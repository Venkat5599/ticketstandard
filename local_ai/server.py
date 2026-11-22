import io
import os
from pathlib import Path

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image, ImageOps

from .nafnet import NAFNet

ROOT = Path(__file__).resolve().parent
WEIGHTS = ROOT / "models" / "NAFNet-GoPro-width64.pth"
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
model = None


def get_model():
    global model
    if model is None:
        if not WEIGHTS.exists():
            raise HTTPException(503, "NAFNet model weights are missing. Run npm run ai:setup.")
        torch.set_num_threads(max(1, min(6, os.cpu_count() or 2)))
        network = NAFNet().eval()
        checkpoint = torch.load(WEIGHTS, map_location="cpu", weights_only=True)
        network.load_state_dict(checkpoint.get("params", checkpoint), strict=True)
        model = network
    return model


@app.get("/health")
def health():
    return {"ready": WEIGHTS.exists(), "device": "cpu"}


def tile_starts(length, tile=512, overlap=48):
    if length <= tile:
        return [0]
    stride = tile - overlap
    starts = list(range(0, max(1, length - tile + 1), stride))
    last = length - tile
    if starts[-1] != last:
        starts.append(last)
    return starts


@app.post("/deblur")
async def deblur(image: UploadFile = File(...)):
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(400, "Use JPEG, PNG, or WebP.")
    data = await image.read(8 * 1024 * 1024 + 1)
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(413, "Choose an image under 8 MB.")
    try:
        with Image.open(io.BytesIO(data)) as opened:
            source = ImageOps.exif_transpose(opened).convert("RGB")
    except Exception as exc:
        raise HTTPException(400, "The selected image could not be opened.") from exc
    width, height = source.size
    if width * height > 20_000_000:
        raise HTTPException(413, "This photo is too large for local repair. Resize it and try again.")

    network = get_model()
    output = Image.new("RGB", source.size)
    tile, overlap = 512, 48
    with torch.inference_mode():
        for top in tile_starts(height, tile, overlap):
            for left in tile_starts(width, tile, overlap):
                patch = source.crop((left, top, min(left + tile, width), min(top + tile, height)))
                tensor = torch.from_numpy(__import__("numpy").array(patch).copy()).permute(2, 0, 1).float().div_(255).unsqueeze(0)
                restored = network(tensor).clamp_(0, 1).squeeze(0).permute(1, 2, 0).mul_(255).byte().numpy()
                output.paste(Image.fromarray(restored), (left, top))
    encoded = io.BytesIO()
    output.save(encoded, format="PNG", optimize=True)
    return Response(encoded.getvalue(), media_type="image/png", headers={"Cache-Control": "no-store"})
