# Consultant photo pipeline

The site's consultant portraits started as 200×300 crops from the practice's
old site. Two scripts turned them into the assets now in `public/consultants/`:

1. **upscale.py** — Real-ESRGAN x4plus (official weights, restoration CNN — no
   generative reinvention of faces) takes each 200×300 original to 800×1200.
   Those 800×1200 files replaced `public/consultants/*.jpg` directly.
2. **normalize.py** — builds `public/consultants/tall/*.jpg` for the
   /consultants focus strip: detects each face (OpenCV YuNet), then extends the
   studio backdrop *upward* by a per-image amount chosen so every face renders
   whole (≤88px) in a 92px sliver with hair apexes on one line (~33% of frame).
   Backgrounds are continued procedurally (per-column colour + matched noise;
   reflection-tiled + graded blur for the one textured backdrop) — nothing is
   invented over people, only backdrop above heads.

To rerun: python venv with torch, opencv-python-headless, pillow, numpy; the
RealESRGAN_x4plus.pth weights (67 MB, e.g. huggingface.co/leonelhs/realesrgan)
and yunet.onnx (opencv_zoo) next to the scripts; originals in `upscaled/`
resp. the source dir paths at the top of each script.

If the practice ever supplies proper photography, delete `tall/`, drop the new
photos into `public/consultants/`, and rerun only normalize.py.
