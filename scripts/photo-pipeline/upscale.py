"""Real-ESRGAN x4plus inference — minimal RRDBNet, official weights."""
import os, sys, time
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from PIL import Image


def make_layer(block, n, **kw):
    return nn.Sequential(*[block(**kw) for _ in range(n)])


class ResidualDenseBlock(nn.Module):
    def __init__(self, num_feat=64, num_grow_ch=32):
        super().__init__()
        self.conv1 = nn.Conv2d(num_feat, num_grow_ch, 3, 1, 1)
        self.conv2 = nn.Conv2d(num_feat + num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv3 = nn.Conv2d(num_feat + 2 * num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv4 = nn.Conv2d(num_feat + 3 * num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv5 = nn.Conv2d(num_feat + 4 * num_grow_ch, num_feat, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)

    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x


class RRDB(nn.Module):
    def __init__(self, num_feat, num_grow_ch=32):
        super().__init__()
        self.rdb1 = ResidualDenseBlock(num_feat, num_grow_ch)
        self.rdb2 = ResidualDenseBlock(num_feat, num_grow_ch)
        self.rdb3 = ResidualDenseBlock(num_feat, num_grow_ch)

    def forward(self, x):
        out = self.rdb3(self.rdb2(self.rdb1(x)))
        return out * 0.2 + x


class RRDBNet(nn.Module):
    def __init__(self, num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32):
        super().__init__()
        self.conv_first = nn.Conv2d(num_in_ch, num_feat, 3, 1, 1)
        self.body = make_layer(RRDB, num_block, num_feat=num_feat, num_grow_ch=num_grow_ch)
        self.conv_body = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_up1 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_hr = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_last = nn.Conv2d(num_feat, num_out_ch, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)

    def forward(self, x):
        feat = self.conv_first(x)
        feat = feat + self.conv_body(self.body(feat))
        feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode="nearest")))
        feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode="nearest")))
        return self.conv_last(self.lrelu(self.conv_hr(feat)))


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    src = "/Users/danord/berkshire-oncology-main/public/consultants"
    out = os.path.join(here, "upscaled")
    os.makedirs(out, exist_ok=True)

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    model = RRDBNet()
    sd = torch.load(os.path.join(here, "RealESRGAN_x4plus.pth"), map_location="cpu", weights_only=True)
    model.load_state_dict(sd["params_ema"], strict=True)
    model.eval().to(device)
    print("device:", device)

    for f in sorted(os.listdir(src)):
        if not f.endswith(".jpg"):
            continue
        t0 = time.time()
        im = Image.open(os.path.join(src, f)).convert("RGB")
        x = torch.from_numpy(np.array(im)).permute(2, 0, 1).float().div_(255.0).unsqueeze(0).to(device)
        with torch.no_grad():
            y = model(x).squeeze(0).clamp_(0, 1)
        arr = (y.permute(1, 2, 0).cpu().numpy() * 255.0).round().astype(np.uint8)
        Image.fromarray(arr).save(os.path.join(out, f.replace(".jpg", ".png")))
        print(f, im.size, "->", arr.shape[1], "x", arr.shape[0], f"{time.time()-t0:.1f}s")


if __name__ == "__main__":
    main()
