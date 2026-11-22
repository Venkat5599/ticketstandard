export type ImagePreset = "square" | "portrait" | "landscape" | "original";
export type OutputFormat = "image/png" | "image/jpeg" | "image/webp";
export type ImageTransform = { rotation: 0 | 90 | 180 | 270; flipHorizontal: boolean };
export type PhotoAdjustments = {
  exposure: number;
  contrast: number;
  saturation: number;
  warmth: number;
  sharpness: number;
  fillMode?: "none" | "color" | "blur";
  zoom: number;
  straighten: number;
  panX: number;
  panY: number;
};

export type ProcessedImage = {
  blob: Blob;
  width: number;
  height: number;
  format: OutputFormat;
  changes: string[];
};

const MAX_FILE_BYTES = 40 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 32_000_000;
const MAX_OUTPUT_EDGE = 8192;

const presets: Record<Exclude<ImagePreset, "original">, { width: number; height: number; label: string }> = {
  square: { width: 1024, height: 1024, label: "Square · 1024 × 1024" },
  portrait: { width: 1024, height: 1280, label: "Portrait · 1024 × 1280" },
  landscape: { width: 1280, height: 1024, label: "Landscape · 1280 × 1024" },
};

export const imagePresets: { value: ImagePreset; label: string }[] = [
  { value: "square", label: presets.square.label },
  { value: "portrait", label: presets.portrait.label },
  { value: "landscape", label: presets.landscape.label },
  { value: "original", label: "Original dimensions" },
];

export function validateImageFile(file: File) {
  const normalizedType = file.type.toLowerCase();
  const supported = ["image/jpeg", "image/png", "image/webp"].includes(normalizedType);
  if (!supported) throw new Error("Choose a JPEG, PNG, or WebP image.");
  if (file.size <= 0) throw new Error("This image file is empty.");
  if (file.size > MAX_FILE_BYTES) throw new Error("This image is larger than 40 MB. Choose a smaller file.");
}

function outputDimensions(preset: ImagePreset, sourceWidth: number, sourceHeight: number) {
  if (preset === "original") return { width: sourceWidth, height: sourceHeight };
  return presets[preset];
}

async function encodeCanvas(canvas: OffscreenCanvas | HTMLCanvasElement, type: OutputFormat, quality = 0.92): Promise<Blob> {
  if ("convertToBlob" in canvas) return canvas.convertToBlob({ type, quality });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The browser could not export this image. Try another format.")), type, quality);
  });
}

function makeCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function get2dContext(canvas: OffscreenCanvas | HTMLCanvasElement, alpha = true): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  return canvas.getContext("2d", { alpha }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
}

function presetLabel(preset: ImagePreset, width: number, height: number) {
  return preset === "original" ? `Kept original dimensions · ${width} × ${height}` : `Fitted to ${width} × ${height}`;
}

const previewSources = new WeakMap<File, Promise<{ bitmap: ImageBitmap; width: number; height: number }>>();

function getPreviewSource(file: File) {
  const cached = previewSources.get(file);
  if (cached) return cached;
  const pending = (async () => {
    const original = await createImageBitmap(file, { imageOrientation: "from-image" });
    try {
      const { width, height } = original;
      if (width * height > MAX_SOURCE_PIXELS) throw new Error("This image has too many pixels to process safely.");
      const scale = Math.min(1, 1200 / Math.max(width, height));
      const bitmap = await createImageBitmap(original, {
        resizeWidth: Math.max(1, Math.round(width * scale)),
        resizeHeight: Math.max(1, Math.round(height * scale)),
        resizeQuality: "high",
      });
      return { bitmap, width, height };
    } finally {
      original.close();
    }
  })().catch(error => { previewSources.delete(file); throw error; });
  previewSources.set(file, pending);
  return pending;
}

export async function standardizeImage(
  file: File,
  preset: ImagePreset,
  format: OutputFormat,
  background = "#f4f2ed",
  transform: ImageTransform = { rotation: 0, flipHorizontal: false },
  adjustments?: PhotoAdjustments,
  previewEdge?: number,
): Promise<ProcessedImage> {
  validateImageFile(file);

  let sourceBitmap: ImageBitmap;
  let cachedSource: Awaited<ReturnType<typeof getPreviewSource>> | undefined;
  try {
    if (previewEdge) cachedSource = await getPreviewSource(file);
    sourceBitmap = cachedSource?.bitmap ?? await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This file could not be decoded as a valid image.");
  }
  try {
    const rotation = transform.rotation;
    const quarterTurn = rotation === 90 || rotation === 270;
    const originalWidth = cachedSource?.width ?? sourceBitmap.width;
    const originalHeight = cachedSource?.height ?? sourceBitmap.height;
    const sourceWidth = quarterTurn ? originalHeight : originalWidth;
    const sourceHeight = quarterTurn ? originalWidth : originalHeight;
    if (sourceWidth * sourceHeight > MAX_SOURCE_PIXELS) throw new Error("This image has too many pixels to process safely. Choose a smaller image.");
    if (preset === "original" && (sourceWidth > MAX_OUTPUT_EDGE || sourceHeight > MAX_OUTPUT_EDGE)) {
      throw new Error("This image is too large to keep at its original dimensions. Choose a standard canvas size instead.");
    }
    const output = outputDimensions(preset, sourceWidth, sourceHeight);
    const renderScale = previewEdge ? Math.min(1, previewEdge / Math.max(output.width, output.height)) : 1;
    const width = Math.max(1, Math.round(output.width * renderScale));
    const height = Math.max(1, Math.round(output.height * renderScale));
    if (width > MAX_OUTPUT_EDGE || height > MAX_OUTPUT_EDGE || width * height > MAX_SOURCE_PIXELS) {
      throw new Error("The requested output size is too large. Choose a smaller preset.");
    }

    const canvas = makeCanvas(width, height);
    const context = get2dContext(canvas);
    if (!context) throw new Error("The browser could not prepare this image.");
    context.clearRect(0, 0, width, height);
    const scale = Math.min(output.width / sourceWidth, output.height / sourceHeight, 1) * renderScale * (adjustments?.zoom ?? 1);
    const fittedWidth = Math.max(1, Math.round(sourceWidth * scale));
    const fittedHeight = Math.max(1, Math.round(sourceHeight * scale));
    const x = Math.round((width - fittedWidth) / 2);
    const y = Math.round((height - fittedHeight) / 2);
    context.save();
    context.translate(x + fittedWidth / 2 + (adjustments?.panX ?? 0) * width, y + fittedHeight / 2 + (adjustments?.panY ?? 0) * height);
    if (transform.flipHorizontal) context.scale(-1, 1);
    context.rotate(((rotation + (adjustments?.straighten ?? 0)) * Math.PI) / 180);
    context.drawImage(sourceBitmap, -(originalWidth * scale) / 2, -(originalHeight * scale) / 2, originalWidth * scale, originalHeight * scale);
    context.restore();

    if (adjustments && (adjustments.exposure || adjustments.contrast || adjustments.saturation || adjustments.warmth)) {
      const pixels = context.getImageData(0, 0, width, height);
      const data = pixels.data;
      const exposure = 2 ** adjustments.exposure;
      const contrast = 1 + adjustments.contrast;
      const saturation = 1 + adjustments.saturation;
      const warmth = adjustments.warmth * 35;
      const tone = (value: number) => (value * exposure - 128) * contrast + 128;
      for (let i = 0; i < data.length; i += 4) {
        if (!data[i + 3]) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = r * .2126 + g * .7152 + b * .0722;
        data[i] = tone(gray + (r - gray) * saturation) + warmth;
        data[i + 1] = tone(gray + (g - gray) * saturation);
        data[i + 2] = tone(gray + (b - gray) * saturation) - warmth;
      }
      context.putImageData(pixels, 0, 0);
    }
    if (adjustments?.sharpness) {
      const pixels = context.getImageData(0, 0, width, height);
      const data = pixels.data;
      const stride = width * 4;
      let previous = data.slice(0, stride);
      let row = new Uint8ClampedArray(stride);
      const strength = adjustments.sharpness * .28;
      for (let y = 1; y < height - 1; y++) {
        const offset = y * stride;
        row.set(data.subarray(offset, offset + stride));
        for (let x = 4; x < stride - 4; x += 4) {
          if (Math.min(row[x+3], row[x-1], row[x+7], previous[x+3], data[offset+stride+x+3]) < 255) continue;
          for (let channel = x; channel < x + 3; channel++) {
            const center = row[channel];
            const detail = 4 * center - row[channel-4] - row[channel+4] - previous[channel] - data[offset+stride+channel];
            data[offset+channel] = center + strength * detail;
          }
        }
        [previous, row] = [row, previous];
      }
      context.putImageData(pixels, 0, 0);
    }
    const fillMode = adjustments?.fillMode ?? "none";
    if (fillMode !== "none" || format === "image/jpeg") {
      context.globalCompositeOperation = "destination-over";
      if (fillMode === "blur") {
        const blur = Math.max(4, Math.round(Math.min(width, height) * .035));
        const scale = Math.max((width + blur * 6) / sourceBitmap.width, (height + blur * 6) / sourceBitmap.height);
        const backdropWidth = sourceBitmap.width * scale;
        const backdropHeight = sourceBitmap.height * scale;
        context.filter = `blur(${blur}px)`;
        context.drawImage(sourceBitmap, (width - backdropWidth) / 2, (height - backdropHeight) / 2, backdropWidth, backdropHeight);
        context.filter = "none";
      }
      if (fillMode === "color" || format === "image/jpeg") {
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);
      }
    }
    const blob = await encodeCanvas(canvas, format, format === "image/png" ? undefined : 0.92);
    if (blob.type !== format) throw new Error("This browser cannot export that format. Choose PNG or JPEG.");
    const changes = [rotation ? `Rotated ${rotation}° clockwise` : "Image orientation normalized", presetLabel(preset, width, height)];
    if (transform.flipHorizontal) changes.push("Flipped horizontally");
    if (fittedWidth !== width || fittedHeight !== height) changes.push("Added padding around the full photo");
    if (format === "image/jpeg" && file.type === "image/png") changes.push("Placed transparency on a solid background");
    if (format !== file.type) changes.push(`Converted to ${format.split("/")[1].toUpperCase()}`);

    return { blob, width, height, format, changes };
  } finally {
    if (!cachedSource) sourceBitmap.close();
  }
}

