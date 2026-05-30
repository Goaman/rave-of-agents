// Reusable image-attachment helper for prompt composers. Holds a reactive list
// of picked images, each kept both as a data URL (for preview) and as the raw
// base64 + media type the server forwards to the agent as an image block.

import { createSignal } from "solid-js";
import type { ImageAttachment } from "../types.ts";

let nextId = 1;

export interface PickedImage {
  id: number;
  name: string;
  mediaType: string;
  data: string; // raw base64 (no data: prefix)
  url: string; // full data URL, for <img src>
}

// Read a File into a PickedImage, or null if it isn't a (supported) image.
async function fileToImage(file: File): Promise<PickedImage | null> {
  if (!file.type.startsWith("image/")) return null;
  const url: string = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
  const comma = url.indexOf(",");
  if (comma === -1) return null;
  return {
    id: nextId++,
    name: file.name || "image",
    mediaType: file.type,
    data: url.slice(comma + 1),
    url,
  };
}

export function createImagePicker() {
  const [images, setImages] = createSignal<PickedImage[]>([]);

  // Add a FileList / array of Files (from a file input, drop, or paste).
  const addFiles = async (files: Iterable<File>) => {
    const picked = await Promise.all([...files].map(fileToImage));
    const ok = picked.filter((p): p is PickedImage => !!p);
    if (ok.length) setImages((list) => [...list, ...ok]);
  };

  // Pull image files out of a clipboard paste; returns true if any were added.
  const addFromClipboard = (data: DataTransfer | null): boolean => {
    if (!data) return false;
    const files = [...data.items]
      .filter((it) => it.kind === "file" && it.type.startsWith("image/"))
      .map((it) => it.getAsFile())
      .filter((f): f is File => !!f);
    if (!files.length) return false;
    void addFiles(files);
    return true;
  };

  const remove = (id: number) => setImages((list) => list.filter((p) => p.id !== id));
  const clear = () => setImages([]);

  // Strip preview-only fields down to the wire payload.
  const payload = (): ImageAttachment[] =>
    images().map((p) => ({ mediaType: p.mediaType, data: p.data, name: p.name }));

  return { images, addFiles, addFromClipboard, remove, clear, payload };
}
