#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
from typing import Tuple

from PIL import Image, ImageChops, ImageFilter, ImageOps, ImageStat

CANVAS = (1024, 1536)

# Fractions of the approved 1024x1536 master canvas. They deliberately overlap
# slightly so soft antialiasing at silhouettes is retained while unrelated
# background-edit noise is ignored.
ROIS = {
    "player-seated": (0.05, 0.43, 0.42, 0.90),
    "npc-standing": (0.60, 0.28, 1.00, 0.91),
    "bag": (0.34, 0.48, 0.70, 0.82),
    "npc-seated": (0.34, 0.40, 0.72, 0.88),
}


def die(message: str) -> None:
    raise SystemExit(message)


def load_rgba(path: Path) -> Image.Image:
    if not path.is_file():
        die(f"Missing input: {path}")
    image = Image.open(path).convert("RGBA")
    if image.size != CANVAS:
        die(f"Expected {CANVAS[0]}x{CANVAS[1]}: {path} is {image.size}")
    return image


def roi_box(fractions: Tuple[float, float, float, float]) -> Tuple[int, int, int, int]:
    left, top, right, bottom = fractions
    return (
        round(left * CANVAS[0]),
        round(top * CANVAS[1]),
        round(right * CANVAS[0]),
        round(bottom * CANVAS[1]),
    )


def diff_alpha(foreground: Image.Image, background: Image.Image, roi_name: str) -> Image.Image:
    # Extract an alpha matte from RGB disagreement while keeping source pixels
    # untouched. Background generation noise outside the expected object ROI is
    # discarded entirely.
    diff = ImageChops.difference(foreground.convert("RGB"), background.convert("RGB"))
    red, green, blue = diff.split()
    gray = ImageChops.lighter(ImageChops.lighter(red, green), blue)

    # Suppress small edit noise, then soften the silhouette edge.
    gray = gray.point(lambda value: 0 if value < 24 else min(255, round((value - 24) * 2.7)))
    gray = gray.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))

    mask = Image.new("L", CANVAS, 0)
    box = roi_box(ROIS[roi_name])
    mask.paste(gray.crop(box), box)
    return mask


def layer_from_source(source: Image.Image, background: Image.Image, roi_name: str) -> Image.Image:
    alpha = diff_alpha(source, background, roi_name)
    result = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    source_rgba = source.convert("RGBA")
    result.paste(source_rgba, (0, 0), alpha)
    return result


def composite(*layers: Image.Image) -> Image.Image:
    out = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    for layer in layers:
        out = Image.alpha_composite(out, layer.convert("RGBA"))
    return out


def shift_layer(layer: Image.Image, target_center: Tuple[float, float]) -> Image.Image:
    alpha = layer.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        die("Bag layer has no visible pixels")
    left, top, right, bottom = bbox
    source_center = ((left + right) / 2, (top + bottom) / 2)
    target = (target_center[0] * CANVAS[0], target_center[1] * CANVAS[1])
    dx = round(target[0] - source_center[0])
    dy = round(target[1] - source_center[1])

    # Paste only the visible sprite bounding box onto a fresh master canvas so
    # translated pixels never wrap around the opposite edge.
    crop = layer.crop(bbox)
    destination = (left + dx, top + dy)
    shifted = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    shifted.alpha_composite(crop, dest=destination)
    return shifted


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG")
    print(f"{path}: mode={image.mode}, size={image.size}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--master", required=True)
    parser.add_argument("--background", required=True)
    parser.add_argument("--seated-composite", required=True)
    parser.add_argument("--out-dir", required=True)
    args = parser.parse_args()

    master = load_rgba(Path(args.master))
    background = load_rgba(Path(args.background))
    seated_composite = load_rgba(Path(args.seated_composite))
    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)

    player = layer_from_source(master, background, "player-seated")
    standing = layer_from_source(master, background, "npc-standing")
    bag = layer_from_source(master, background, "bag")
    seated = layer_from_source(seated_composite, background, "npc-seated")

    # Keep every output on the exact master canvas. No trimming.
    save_png(background, out / "train-background.png")
    save_png(player, out / "train-player-seated.png")
    save_png(standing, out / "train-npc-standing.png")
    save_png(seated, out / "train-npc-seated.png")
    save_png(bag, out / "train-bag.png")

    before = composite(background, player, standing, bag)
    after_seated = composite(background, player, seated)
    after_lap = composite(background, player, seated, shift_layer(bag, (0.29, 0.72)))
    after_floor = composite(background, player, seated, shift_layer(bag, (0.52, 0.89)))

    save_png(before, out / "train-preview-before.png")
    save_png(after_seated, out / "train-preview-after-seated.png")
    save_png(after_lap, out / "train-preview-after-lap.png")
    save_png(after_floor, out / "train-preview-after-floor.png")

    raw_diff = ImageChops.difference(master.convert("RGB"), before.convert("RGB"))
    stats = ImageStat.Stat(raw_diff)
    mean = sum(stats.mean) / len(stats.mean)
    print(f"Before preview mean absolute channel difference: {mean:.2f}")
    amplified = raw_diff.point(lambda value: min(255, value * 4))
    diff_preview = ImageOps.autocontrast(amplified)
    save_png(diff_preview.convert("RGBA"), out / "train-preview-diff.png")

    # Fail early if an expected layer is empty or has lost canvas alignment.
    for name, layer in {
        "player-seated": player,
        "npc-standing": standing,
        "npc-seated": seated,
        "bag": bag,
    }.items():
        if layer.size != CANVAS or layer.getchannel("A").getbbox() is None:
            die(f"Invalid extracted layer: {name}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
