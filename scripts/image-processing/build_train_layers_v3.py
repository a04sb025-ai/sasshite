#!/usr/bin/env python3
"""Build and strictly validate train v3 layers from explicit transparent subjects."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

SIZE = (1024, 1536)
NAMES = ("player-seated", "npc-standing", "npc-seated", "bag")
MASK_NAMES = {"player-seated": "player", "npc-standing": "npc-standing", "npc-seated": "npc-seated", "bag": "bag"}


def load(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    if image.size != SIZE:
        raise SystemExit(f"FAIL size: {path} is {image.size}, expected {SIZE}")
    return image


def components(mask: Image.Image) -> list[list[tuple[int, int]]]:
    pixels, seen, found = mask.load(), set(), []
    bbox = mask.getbbox()
    if not bbox:
        return found
    left, top, right, bottom = bbox
    for y in range(top, bottom):
        for x in range(left, right):
            if not pixels[x, y] or (x, y) in seen:
                continue
            part, queue = [], deque([(x, y)])
            while queue:
                px, py = queue.popleft()
                if (px, py) in seen or not (left <= px < right and top <= py < bottom):
                    continue
                seen.add((px, py))
                if not pixels[px, py]:
                    continue
                part.append((px, py))
                queue.extend(((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)))
            found.append(part)
    return sorted(found, key=len, reverse=True)


def explicit_mask(raw: Image.Image, name: str) -> Image.Image:
    """Harden the API's semantic alpha; RGB differences are intentionally never consulted."""
    semantic = raw.getchannel("A").point(lambda value: 255 if value >= 16 else 0)
    parts = components(semantic)
    if not parts or len(parts[0]) < 2_000:
        raise SystemExit(f"FAIL mask: {name} has no credible main subject")
    # Keep the semantic subject and nearby accessories connected by the model's alpha.
    # Reject remote residue (the v2 orange ghost) rather than blending it into the layer.
    main = Image.new("L", SIZE)
    out = main.load()
    for x, y in parts[0]:
        out[x, y] = 255
    if len(parts) > 1 and len(parts[1]) > len(parts[0]) * 0.02:
        raise SystemExit(f"FAIL isolated component: {name}: {len(parts[1])} pixels")

    # Close pinholes, then fill every enclosed interior pixel. The interior is binary 255;
    # only a one-pixel exterior fringe is allowed to carry antialiasing alpha.
    main = main.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    outside = Image.new("L", SIZE)
    ImageDraw_floodfill(outside, ImageChops.invert(main))
    solid = ImageChops.invert(outside)
    fringe = ImageChops.subtract(solid.filter(ImageFilter.MaxFilter(3)), solid)
    return ImageChops.lighter(solid, fringe.point(lambda value: 128 if value else 0))


def ImageDraw_floodfill(output: Image.Image, traversable: Image.Image) -> None:
    target, allowed, queue = output.load(), traversable.load(), deque([(0, 0)])
    while queue:
        x, y = queue.popleft()
        if not (0 <= x < SIZE[0] and 0 <= y < SIZE[1]) or target[x, y] or not allowed[x, y]:
            continue
        target[x, y] = 255
        queue.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))


def validate_alpha(name: str, alpha: Image.Image) -> None:
    histogram = alpha.histogram()
    zero, opaque, middle = histogram[0], histogram[255], sum(histogram[1:255])
    visible = opaque + middle
    ratio = middle / visible if visible else 1.0
    print(f"{name}: alpha=0 {zero}; alpha=255 {opaque}; alpha=1..254 {middle}; intermediate={ratio:.3%}")
    if ratio > 0.05:
        raise SystemExit(f"FAIL alpha: {name} intermediate alpha exceeds 5%")
    interior = alpha.point(lambda value: 255 if value else 0).filter(ImageFilter.MinFilter(11))
    interior_count = sum(interior.histogram()[1:])
    nonopaque = alpha.point(lambda value: 255 if value != 255 else 0)
    bad_histogram = ImageChops.multiply(nonopaque, interior).histogram()
    bad = sum(bad_histogram[1:])
    if interior_count == 0 or bad / interior_count > 0.001:
        raise SystemExit(f"FAIL interior opacity: {name}: {bad}/{interior_count}")
    hard = alpha.point(lambda value: 255 if value else 0)
    parts = components(hard)
    if len(parts) > 1 and len(parts[1]) > len(parts[0]) * 0.02:
        raise SystemExit(f"FAIL isolated component after hardening: {name}")


def composite(*images: Image.Image) -> Image.Image:
    result = Image.new("RGBA", SIZE)
    for image in images:
        result.alpha_composite(image)
    return result


def transform(layer: Image.Image, center: tuple[int, int], scale: float) -> Image.Image:
    crop = layer.crop(layer.getchannel("A").getbbox())
    crop = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)
    result = Image.new("RGBA", SIZE)
    result.alpha_composite(crop, (center[0] - crop.width // 2, center[1] - crop.height // 2))
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--master", type=Path, required=True)
    parser.add_argument("--background", type=Path, required=True)
    parser.add_argument("--raw-dir", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()
    master, background = load(args.master), load(args.background)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    background.convert("RGB").save(args.out_dir / "train-background-v3.png")

    layers = {}
    for name in NAMES:
        raw = load(args.raw_dir / f"train-{name}-v3-raw.png")
        alpha = explicit_mask(raw, name)
        validate_alpha(name, alpha)
        # Existing subjects retain exact master RGB; only the new seated pose uses API RGB.
        rgb = raw if name == "npc-seated" else master
        layer = rgb.copy()
        layer.putalpha(alpha)
        layer.save(args.out_dir / f"train-{name}-v3.png")
        alpha.save(args.out_dir / f"mask-{MASK_NAMES[name]}-v3.png")
        layers[name] = layer

    before = composite(background, layers["player-seated"], layers["npc-standing"], layers["bag"])
    seated = composite(background, layers["player-seated"], layers["npc-seated"])
    previews = {
        "train-preview-v3-before.png": before,
        "train-preview-v3-after-seated.png": seated,
        "train-preview-v3-after-lap.png": composite(seated, transform(layers["bag"], (270, 905), 0.72)),
        "train-preview-v3-after-floor.png": composite(seated, transform(layers["bag"], (510, 1260), 0.82)),
        "train-preview-v3-diff.png": ImageChops.difference(master.convert("RGB"), before.convert("RGB")),
    }
    for name, image in previews.items():
        image.save(args.out_dir / name)
    required = list(args.out_dir.glob("train-*-v3.png")) + list(args.out_dir.glob("train-preview-v3-*.png"))
    if len(required) < 9 or any(Image.open(path).size != SIZE for path in required):
        raise SystemExit("FAIL output/preview completeness or size")


if __name__ == "__main__":
    main()
