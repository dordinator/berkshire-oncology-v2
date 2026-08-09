# Consultant photo pipeline

The site's consultant portraits started as 200×300 crops from the practice's
old site. What ships now:

- **`public/consultants/*.jpg`** (800×1200) — Real-ESRGAN x4plus upscales of
  the originals (via `upscale.py`; restoration CNN, no generative reinvention
  of faces). Used by the profile pages and every small avatar.
- **`public/consultants/tall/*.jpg`** — the focus-strip frames: per-portrait
  top extension sized so every face renders whole in a 92px sliver with hair
  apexes on one line (~33% of frame), built by `normalize.py`. **Dan reviewed
  an enhanced-vs-original A/B (2026-08-09) and chose the ORIGINAL pixels for
  the strip** — so these frames carry the untouched originals lanczos-scaled
  into the extended geometry, not the Real-ESRGAN output. Detection still runs
  on the enhanced files so the framing is deterministic.

Backgrounds are continued procedurally (per-column colour + matched noise;
reflection-tiled graded blur for the one textured backdrop) — nothing is
invented over people, only backdrop above heads.

To rerun: python venv with opencv-python-headless, pillow, numpy (plus torch
and the RealESRGAN_x4plus.pth weights — e.g. huggingface.co/leonelhs/realesrgan
— only if re-running `upscale.py`); yunet.onnx (opencv_zoo) next to the
scripts; source dir paths at the top of each script.

If the practice ever supplies proper photography, drop the new photos into
`public/consultants/`, rerun `normalize.py`, and delete this whole dance.
