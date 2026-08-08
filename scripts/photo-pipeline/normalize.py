"""Normalise the tall portraits: per-image top extension chosen so that, at
the strip's geometry (425px band, 92px slivers, cover-by-height), every face
renders whole and at a consistent scale, with hair apexes near one line.

face_onscreen = face_w * 425 / (1200 + E)  ->  E_fit for face <= 88px
apex_onscreen at ~33% of frame             ->  E_apex
E = clamp(max(E_fit, E_apex), 200, 700)
"""
import os
import cv2
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "upscaled")
DST = "/Users/danord/berkshire-oncology-main/public/consultants/tall"

TEXTURED = {"gelareh-eslamian"}  # blue artwork backdrop -> tiling fill

det = cv2.FaceDetectorYN_create(os.path.join(HERE, "yunet.onnx"), "", (800, 1200), 0.6)


def apex_row(arr):
    """First row where the subject interrupts the backdrop."""
    bg = np.median(arr[2:14, 60:740].reshape(-1, 3), axis=0)
    for y in range(4, 900):
        row = arr[y, 80:720].astype(np.float64)
        frac = (np.abs(row - bg).sum(axis=1) > 90).mean()
        if frac > 0.08:
            return y
    return 200


def flat_fill(arr, ext):
    band = arr[4:28].astype(np.float64)
    base = np.median(band, axis=0)
    med = np.median(base, axis=0)
    bad = np.abs(base - med).sum(axis=1) > 90
    if bad.any() and not bad.all():
        idx = np.arange(len(base))
        for ch in range(3):
            base[bad, ch] = np.interp(idx[bad], idx[~bad], base[~bad, ch])
    k = 31
    pad = np.pad(base, ((k // 2, k // 2), (0, 0)), mode="edge")
    kern = np.hanning(k); kern /= kern.sum()
    base = np.stack([np.convolve(pad[:, c], kern, mode="valid") for c in range(3)], axis=1)
    fill = np.tile(base[None, :, :], (ext, 1, 1))
    sigma = float(np.std(band - np.median(band, axis=0)))
    fill += np.random.default_rng(7).normal(0, min(sigma, 2.5), fill.shape)
    return np.clip(fill, 0, 255)


def textured_fill(arr, ext):
    band = arr[0:56].astype(np.float64)
    chunks, flip, total = [], True, 0
    while total < ext:
        chunks.append(band[::-1] if flip else band)
        total += band.shape[0]
        flip = not flip
    fill = np.vstack(chunks[::-1])[-ext:]
    lo = np.asarray(Image.fromarray(fill.astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))).astype(np.float64)
    hi = np.asarray(Image.fromarray(fill.astype(np.uint8)).filter(ImageFilter.GaussianBlur(22))).astype(np.float64)
    d = np.arange(ext)[::-1] / 220.0
    t = np.clip(d, 0, 1); t = (3 * t**2 - 2 * t**3)[:, None, None]
    fill = lo * (1 - t) + hi * t
    return np.clip(fill + np.random.default_rng(7).normal(0, 1.5, fill.shape), 0, 255)


for f in sorted(os.listdir(SRC)):
    if not f.endswith(".png"):
        continue
    slug = f[:-4]
    arr = np.asarray(Image.open(os.path.join(SRC, f)).convert("RGB"))
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    det.setInputSize((arr.shape[1], arr.shape[0]))
    _, faces = det.detect(bgr)
    face_w = float(faces[0][2])
    apex = apex_row(arr)

    e_fit = face_w * 425 / 88 - 1200
    e_apex = (0.33 * 1200 - apex) / 0.67
    ext = int(np.clip(max(e_fit, e_apex), 200, 700))

    fill = textured_fill(arr, ext) if slug in TEXTURED else flat_fill(arr, ext)
    out = np.vstack([fill, arr.astype(np.float64)])

    if slug not in TEXTURED:
        seam0, seam1 = ext - 36, ext + 14
        band_im = Image.fromarray(out[seam0:seam1].astype(np.uint8)).filter(ImageFilter.GaussianBlur(7))
        blurred = np.asarray(band_im).astype(np.float64)
        alpha = np.hanning((seam1 - seam0) * 2)[: seam1 - seam0][:, None, None]
        alpha = np.minimum(alpha * 1.6, 1.0)
        out[seam0:seam1] = out[seam0:seam1] * (1 - alpha) + blurred * alpha

    Image.fromarray(out.astype(np.uint8)).save(
        os.path.join(DST, slug + ".jpg"), quality=90, optimize=True)
    H = 1200 + ext
    print(f"{slug:28s} face_w={face_w:4.0f} apex={apex:4d} ext={ext:3d} "
          f"frame=800x{H} face@screen={face_w*425/H:.0f}px apex@{(ext+apex)/H:.0%}")
