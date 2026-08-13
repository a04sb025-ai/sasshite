#!/usr/bin/env python3
"""Extract and preview master-aligned train layers on a fixed 1024x1536 canvas."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

SIZE = (1024, 1536)
REGIONS = {
    "player-seated": (40, 450, 390, 1340),
    "npc-standing": (650, 300, 1010, 1330),
    "bag": (350, 850, 660, 1070),
    "npc-seated": (330, 430, 690, 1290),
}


def opened(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    if image.size != SIZE:
        raise SystemExit(f"{path} must be {SIZE[0]}x{SIZE[1]}, got {image.size}")
    return image


def difference_layer(subject: Image.Image, plate: Image.Image, region: tuple[int, int, int, int]) -> Image.Image:
    """Keep source pixels whose RGB differs from the clean plate inside a known scene ROI."""
    delta = ImageChops.difference(subject.convert("RGB"), plate.convert("RGB")).convert("L")
    # Ignore small plate-generation noise, then lightly feather the cut edge.
    alpha = delta.point(lambda value: 0 if value < 24 else min(255, (value - 24) * 7))
    roi = Image.new("L", SIZE)
    roi.paste(255, region)
    alpha = ImageChops.multiply(alpha, roi).filter(ImageFilter.GaussianBlur(0.6))
    layer = subject.copy()
    layer.putalpha(alpha)
    return layer


def overlay(*images: Image.Image) -> Image.Image:
    result = Image.new("RGBA", SIZE)
    for image in images:
        result.alpha_composite(image)
    return result


def moved(layer: Image.Image, center: tuple[int, int]) -> Image.Image:
    bbox = layer.getchannel("A").getbbox()
    if bbox is None:
        raise SystemExit("Bag extraction has no visible pixels")
    current = ((bbox[0] + bbox[2]) // 2, (bbox[1] + bbox[3]) // 2)
    translated = Image.new("RGBA", SIZE)
    translated.alpha_composite(layer, (center[0] - current[0], center[1] - current[1]))
    return translated


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--master", type=Path, required=True)
    parser.add_argument("--background", type=Path, required=True)
    parser.add_argument("--seated-composite", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()

    master = opened(args.master)
    background = opened(args.background)
    seated_composite = opened(args.seated_composite)
    args.out_dir.mkdir(parents=True, exist_ok=True)

    layers = {
        name: difference_layer(master, background, REGIONS[name])
        for name in ("player-seated", "npc-standing", "bag")
    }
    layers["npc-seated"] = difference_layer(
        seated_composite, background, REGIONS["npc-seated"]
    )

    background.convert("RGB").save(args.out_dir / "train-background.png")
    for name, layer in layers.items():
        layer.save(args.out_dir / f"train-{name}.png")

    before = overlay(background, layers["player-seated"], layers["npc-standing"], layers["bag"])
    after = overlay(background, layers["player-seated"], layers["npc-seated"])
    before.save(args.out_dir / "train-preview-before.png")
    after.save(args.out_dir / "train-preview-after-seated.png")
    overlay(after, moved(layers["bag"], (285, 910))).save(args.out_dir / "train-preview-after-lap.png")
    overlay(after, moved(layers["bag"], (510, 1270))).save(args.out_dir / "train-preview-after-floor.png")

    diff = ImageChops.difference(master.convert("RGB"), before.convert("RGB"))
    diff.save(args.out_dir / "train-preview-diff.png")
    histogram = diff.histogram()
    mean = sum((index % 256) * count for index, count in enumerate(histogram)) / (SIZE[0] * SIZE[1] * 3)
    print(f"before/master mean absolute channel difference: {mean:.2f}")

    for path in sorted(args.out_dir.glob("train-*.png")):
        with Image.open(path) as image:
            if image.size != SIZE:
                raise SystemExit(f"Unexpected output size: {path}: {image.size}")
            print(f"{path}: mode={image.mode}, size={image.size}")


if __name__ == "__main__":
    main()
