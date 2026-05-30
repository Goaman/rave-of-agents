// SolidJS app, authored with the solid-js/html tagged-template (no JSX/babel
// step — Bun bundles this straight to public/client.js).

import { render } from "solid-js/web";
import html from "solid-js/html";
import { createEffect, createSignal } from "solid-js";
import {
  actions,
  connect,
  connected,
  selectSession,
  selectSub,
  selected,
  selectedId,
  selectedSubKey,
  sessions,
  setView,
  view,
} from "./store.ts";
import { PmView } from "./pm.ts";
import { createImagePicker, type PickedImage } from "./images.ts";
import type { SessionSnapshot, SubAgentNode, TranscriptEntry } from "../types.ts";

// Shared bits of the image-attachment UI, reused by the composer and the
// new-agent form. `picker` comes from createImagePicker().
type Picker = ReturnType<typeof createImagePicker>;

// A "📎" button that opens a (hidden) multi-image file chooser.
function AttachButton(picker: Picker) {
  let fileEl!: HTMLInputElement;
  return html`
    <span class="attach">
      <input type="file" accept="image/*" multiple class="attach-input"
        ref=${(el: HTMLInputElement) => (fileEl = el)}
        onChange=${(e: Event) => {
          const input = e.currentTarget as HTMLInputElement;
          if (input.files) void picker.addFiles(input.files);
          input.value = ""; // allow re-picking the same file
        }} />
      <button type="button" class="attach-btn" title="Attach image(s)"
        onClick=${() => fileEl.click()}>📎</button>
    </span>
  `;
}

// A strip of thumbnails for the currently-attached images, each removable.
function AttachStrip(picker: Picker) {
  return html`${() =>
    picker.images().length
      ? html`<div class="attach-strip">
          ${() =>
            picker.images().map(
              (img: PickedImage) => html`
                <div class="thumb" title=${img.name}>
                  <img src=${img.url} alt=${img.name} />
                  <button type="button" class="thumb-x" title="Remove"
                    onClick=${() => picker.remove(img.id)}>✕</button>
                </div>
              `,
            )}
        </div>`
      : ""}`;
}

// Recursive lineage of nested agents spawned via super_agent. Clicking a node
// focuses that sub-agent's conversation. Rebuilt whole whenever the session's
// subAgents array changes (cheap at demo scale).
function SubTreeImpl(nodes: SubAgentNode[], parent: string | null, sessionId: string): any {
  const kids = nodes.filter((n) => n.parentKey === parent);
  if (kids.length === 0) return "";
  return html`<div class="tree">
    ${kids.map(
      (n: SubAgentNode) => html`
        <div class="tnode">
          <div class="tnode-row clickable"
            classList=${() => ({ "tnode-active": n.key === selectedSubKey() })}
            onClick=${(e: MouseEvent) => {
              e.stopPropagation();
              selectSub(sessionId, n.key);
            }}>
            <span class="tstatus ${n.status}"></span>
            <span class="tdepth">L${n.depth}</span>
            <span class="tprompt">${n.prompt || "(no prompt)"}</span>
          </div>
          ${n.resultPreview
            ? html`<div class="tresult ${n.status}">↩ ${n.resultPreview}</div>`
            : ""}
          ${SubTreeImpl(nodes, n.key, sessionId)}
        </div>
      `,
    )}
  </div>`;
}

// Focused view of a single sub-agent: the prompt it was given, any agents it
// spawned, and the answer it returned. (Sub-agents run headless/one-shot, so
// this is the full conversation available for them — input, lineage, output.)
function SubAgentDetail(node: SubAgentNode, session: SessionSnapshot) {
  return html`
    <div class="sub-detail">
      <header class="conv-head">
        <div>
          <button class="back" onClick=${() => selectSession(session.id)}>← ${session.label}</button>
          <span class="badge ${node.status}">${STATUS_LABEL[node.status] ?? node.status}</span>
          <span class="sub-meta">L${node.depth} · ${node.model ?? "default"}${node.pid ? ` · pid ${node.pid}` : ""}</span>
        </div>
      </header>
      <div class="transcript">
        <div class="entry user">
          <span class="who">spawned with</span>
          <div class="text">${node.prompt || "(no prompt)"}</div>
        </div>
        ${() =>
          session.subAgents.some((c) => c.parentKey === node.key)
            ? html`<div class="entry system">
                <span class="who">spawned sub-agents</span>
                <div class="text">${SubTreeImpl(session.subAgents, node.key, session.id)}</div>
              </div>`
            : ""}
        ${() =>
          node.status === "done" || node.status === "error"
            ? html`<div class="entry ${node.status === "error" ? "error" : "result"}">
                <span class="who">returned</span>
                <div class="text">${node.result ?? node.resultPreview ?? "(no result)"}</div>
              </div>`
            : html`<div class="entry system">
                <span class="who">${node.status}</span>
                <div class="text">working…</div>
              </div>`}
      </div>
    </div>
  `;
}

const STATUS_LABEL: Record<string, string> = {
  starting: "starting",
  running: "running",
  idle: "ready",
  done: "closed",
  error: "error",
};

function Sidebar() {
  const [showForm, setShowForm] = createSignal(false);
  const picker = createImagePicker();
  let promptEl!: HTMLTextAreaElement;
  let labelEl!: HTMLInputElement;
  let modelEl!: HTMLSelectElement;
  let cwdEl!: HTMLInputElement;

  const launch = () => {
    const prompt = promptEl.value.trim();
    const images = picker.payload();
    if (!prompt && !images.length) return;
    actions.create({
      prompt,
      images: images.length ? images : undefined,
      label: labelEl.value.trim() || undefined,
      model: modelEl.value || undefined,
      cwd: cwdEl.value.trim() || undefined,
    });
    promptEl.value = "";
    labelEl.value = "";
    picker.clear();
    setShowForm(false);
  };

  return html`
    <aside class="sidebar">
      <div class="brand">
        <span class="dot" classList=${() => ({ on: connected() })}></span>
        <strong>Agent Console</strong>
        <span class="conn">${() => (connected() ? "live" : "offline")}</span>
      </div>

      <button class="primary" onClick=${() => setShowForm((v) => !v)}>
        ${() => (showForm() ? "✕ cancel" : "+ new agent")}
      </button>

      ${() =>
        showForm() &&
        html`
          <div class="form">
            <label>task / first message</label>
            <textarea ref=${(el: HTMLTextAreaElement) => (promptEl = el)} rows="4"
              placeholder="e.g. List the files here and tell me what this project does."
              onPaste=${(e: ClipboardEvent) => picker.addFromClipboard(e.clipboardData)}></textarea>
            ${AttachStrip(picker)}
            <div class="form-attach">${AttachButton(picker)}<span class="hint">attach or paste image(s)</span></div>
            <label>label (optional)</label>
            <input ref=${(el: HTMLInputElement) => (labelEl = el)} placeholder="my agent" />
            <label>model</label>
            <select ref=${(el: HTMLSelectElement) => (modelEl = el)}>
              <option value="">inherit / default</option>
              <option value="haiku">haiku (fast)</option>
              <option value="sonnet">sonnet</option>
              <option value="opus">opus</option>
            </select>
            <label>working dir (optional)</label>
            <input ref=${(el: HTMLInputElement) => (cwdEl = el)} placeholder="server cwd" />
            <button class="primary" onClick=${launch}>launch agent</button>
          </div>
        `}

      <div class="list">
        ${() =>
          sessions().length === 0
            ? html`<p class="empty">No agents yet. Launch one above.</p>`
            : sessions().map((s: SessionSnapshot) =>
                html`
                  <div class="item" classList=${() => ({ active: s.id === selectedId() })}
                    onClick=${() => selectSession(s.id)}>
                    <div class="item-top">
                      <span class="name">${s.label}</span>
                      <span class="badge ${s.status}">${STATUS_LABEL[s.status] ?? s.status}</span>
                    </div>
                    <div class="item-sub">
                      ${s.model ?? "default"} · ${() => s.transcript.length} lines
                      ${() =>
                        s.subAgents.length
                          ? html`<span class="sub-count">· ${s.subAgents.length} sub-agents</span>`
                          : ""}
                      ${() => (s.busy ? html`<span class="spinner"></span>` : "")}
                    </div>
                    ${() => (s.subAgents.length ? SubTreeImpl(s.subAgents, null, s.id) : "")}
                  </div>
                `,
              )}
      </div>
    </aside>
  `;
}

function Entry(props: { e: TranscriptEntry }) {
  const e = props.e;
  const head =
    e.kind === "tool_use"
      ? `🔧 ${e.tool ?? "tool"}`
      : e.kind === "user"
        ? "you"
        : e.kind === "assistant"
          ? "agent"
          : e.kind;
  return html`
    <div class="entry ${e.kind}">
      <span class="who">${head}</span>
      ${e.images && e.images.length
        ? html`<div class="entry-images">
            ${e.images.map(
              (img) => html`<img class="entry-img"
                src=${`data:${img.mediaType};base64,${img.data}`} alt=${img.name ?? "image"} />`,
            )}
          </div>`
        : ""}
      ${e.text ? html`<div class="text">${e.text}</div>` : ""}
    </div>
  `;
}

function Conversation() {
  let scroller!: HTMLDivElement;
  let composer!: HTMLTextAreaElement;
  const picker = createImagePicker();

  // Auto-scroll to the newest entry whenever the selected session's transcript grows.
  createEffect(() => {
    const s = selected();
    s?.transcript.length; // track
    queueMicrotask(() => {
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    });
  });

  const sendMsg = () => {
    const s = selected();
    const text = composer.value.trim();
    const images = picker.payload();
    if (!s || (!text && !images.length)) return;
    actions.message(s.id, text, images.length ? images : undefined);
    composer.value = "";
    picker.clear();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendMsg();
    }
  };

  return html`
    <main class="main">
      ${() => {
        const s = selected();
        if (!s) return html`<div class="placeholder">Select or launch an agent.</div>`;

        // Focused sub-agent conversation, if one is selected and still present.
        const sub = selectedSubKey()
          ? s.subAgents.find((n) => n.key === selectedSubKey())
          : undefined;
        if (sub) return SubAgentDetail(sub, s);

        return html`
          <header class="conv-head">
            <div>
              <strong>${s.label}</strong>
              <span class="badge ${s.status}">${STATUS_LABEL[s.status] ?? s.status}</span>
              ${() => (!s.live ? html`<span class="badge dormant">dormant</span>` : "")}
            </div>
            <div class="head-actions">
              ${() =>
                s.live
                  ? html`<button onClick=${() => actions.interrupt(s.id)} disabled=${() => !s.busy}>interrupt</button>
                         <button onClick=${() => actions.close(s.id)}>close</button>`
                  : ""}
              <button class="danger"
                onClick=${() => confirm(`Delete "${s.label}" permanently?`) && actions.remove(s.id)}>delete</button>
            </div>
          </header>

          ${() =>
            s.subAgents.length
              ? html`<div class="subagents-panel">
                  <div class="panel-title">🌿 sub-agent tree (${s.subAgents.length}) — click a node to open it</div>
                  ${SubTreeImpl(s.subAgents, null, s.id)}
                </div>`
              : ""}

          <div class="transcript" ref=${(el: HTMLDivElement) => (scroller = el)}>
            ${() =>
              s.transcript.length === 0
                ? html`<p class="empty">Waiting for the agent…</p>`
                : s.transcript.map((e: TranscriptEntry) => html`<${Entry} e=${e} />`)}
          </div>

          <div class="composer"
            onDragOver=${(e: DragEvent) => e.preventDefault()}
            onDrop=${(e: DragEvent) => {
              e.preventDefault();
              if (e.dataTransfer?.files?.length) void picker.addFiles(e.dataTransfer.files);
            }}>
            ${AttachStrip(picker)}
            <div class="composer-row">
              ${AttachButton(picker)}
              <textarea ref=${(el: HTMLTextAreaElement) => (composer = el)} rows="2"
                placeholder=${() =>
                  s.live
                    ? "Message this agent (⌘/Ctrl+Enter to send, paste/drop images)…"
                    : "Send to resume this conversation (⌘/Ctrl+Enter)…"}
                onPaste=${(e: ClipboardEvent) => picker.addFromClipboard(e.clipboardData)}
                onKeyDown=${onKey}></textarea>
              <button class="primary" onClick=${sendMsg}>${() => (s.live ? "send" : "resume")}</button>
            </div>
          </div>
        `;
      }}
    </main>
  `;
}

function TopNav() {
  const tab = (id: "agents" | "pm", label: string) => html`
    <button class="tab" classList=${() => ({ active: view() === id })}
      onClick=${() => setView(id)}>${label}</button>
  `;
  return html`
    <nav class="topnav">
      ${tab("agents", "Agents")}
      ${tab("pm", "Projects")}
    </nav>
  `;
}

function App() {
  return html`<div class="root-shell">
    <${TopNav} />
    ${() =>
      view() === "pm"
        ? html`<${PmView} />`
        : html`<div class="app"><${Sidebar} /><${Conversation} /></div>`}
  </div>`;
}

connect();
render(App, document.getElementById("root")!);
