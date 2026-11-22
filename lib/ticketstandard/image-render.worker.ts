import { standardizeImage } from "./image-processing";

let source: File | null = null;

self.addEventListener("message", async (event: MessageEvent<[File | null, ...Tail<Parameters<typeof standardizeImage>>]>) => {
  const [file, ...settings] = event.data;
  source = file ?? source;
  try {
    if (!source) throw new Error("Open a photo first.");
    const result = await standardizeImage(source, ...settings);
    self.postMessage({ result });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : "Could not render this edit." });
  }
});

type Tail<T> = T extends [unknown, ...infer Rest] ? Rest : never;
