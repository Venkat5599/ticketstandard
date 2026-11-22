import { validateImageFile } from "@/lib/ticketstandard/image-processing";

export const runtime = "nodejs";
const limit = 8 * 1024 * 1024;
const localAi = process.env.TICKETSTANDARD_LOCAL_AI_URL ?? "http://127.0.0.1:8765";

export async function GET() {
  let deblur = false;
  try {
    const health = await fetch(`${localAi}/health`, { signal: AbortSignal.timeout(900) });
    if (health.ok) deblur = Boolean((await health.json()).ready);
  } catch { /* The optional local model may not be installed or running. */ }
  return Response.json({
    deblur,
    expand: Boolean(process.env.POWERPAINT_URL && process.env.POWERPAINT_TOKEN),
  });
}

export async function POST(request: Request) {
  if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname)) {
    return Response.json({ error: "Cloud tools are enabled for the local studio only." }, { status: 403 });
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const error = (message: string, status: number) => Response.json({ error: message }, { status });
  const length = Number(request.headers.get("content-length"));
  if (!length || length > limit + 65536) return error("Choose an image under 8 MB for cloud editing.", 413);
  try {
    const form = await request.formData();
    const image = form.get("image");
    const tool = form.get("tool");
    if (!(image instanceof File) || image.size > limit) return error("Choose an image under 8 MB.", 400);
    try { validateImageFile(image); } catch { return error("Choose a valid JPEG, PNG, or WebP.", 400); }
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(10 * 60_000)]);
    let result: Response;
    if (tool === "deblur") {
      try {
        const payload = new FormData();
        payload.set("image", image);
        result = await fetch(`${localAi}/deblur`, { method: "POST", body: payload, signal, redirect: "error" });
      } catch {
        return error("Local photo repair is not running. Start it with `npm run ai:setup`, then `npm run dev`.", 503);
      }
    } else if (tool === "expand") {
      const endpoint = process.env.POWERPAINT_URL;
      const token = process.env.POWERPAINT_TOKEN;
      if (!endpoint || !token) return error("Image expansion is not configured yet.", 503);
      const ratio = form.get("ratio");
      if (ratio !== "1:1" && ratio !== "4:5" && ratio !== "5:4") return error("Choose a canvas ratio.", 400);
      const payload = new FormData();
      payload.set("image", image);
      payload.set("ratio", ratio);
      result = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: payload, signal, redirect: "error" });
    } else return error("Unknown photo tool.", 400);

    const type = result.headers.get("content-type")?.split(";")[0] ?? "";
    if (!result.ok || !result.body || !["image/png", "image/jpeg", "image/webp"].includes(type)) {
      if (!result.ok && tool === "deblur") return error("Local photo repair could not process this image. Check the model setup and try again.", 502);
      return error("The image service did not return a usable image.", 502);
    }
    return new Response(result.body, { headers: { "Content-Type": type, "Cache-Control": "no-store" } });
  } catch {
    return error("Cloud processing did not complete. Try again.", 502);
  }
}
