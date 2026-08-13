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
ANCHORS = {
    "player-seated": (205, 700),
    "npc-standing": (805, 650),
    "bag": (510, 950),
    "npc-seated": (525, 650),
}


def opened(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    if image.size != SIZE:
        raise SystemExit(f"{path} must be {SIZE[0]}x{SIZE[1]}, got {image.size}")
    return image


def _fill_holes(mask: Image.Image) -> Image.Image:
    inverse = ImageChops.invert(mask)
    outside = Image.new("L", SIZE)
    pending = [(0, 0)]
    pixels, inv, seen = outside.load(), inverse.load(), set()
    while pending:
        x, y = pending.pop()
        if (x, y) in seen or not (0 <= x < SIZE[0] and 0 <= y < SIZE[1]) or inv[x, y] == 0:
            continue
        seen.add((x, y))
        pixels[x, y] = 255
        pending.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
    return ImageChops.invert(outside)


def _keep_subject_component(mask: Image.Image, anchor: tuple[int, int]) -> Image.Image:
    source = mask.load()
    visited: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []
    left, top, right, bottom = mask.getbbox() or (0, 0, 0, 0)
    for y in range(top, bottom):
        for x in range(left, right):
            if source[x, y] == 0 or (x, y) in visited:
                continue
            component, pending = [], [(x, y)]
            while pending:
                point = pending.pop()
                px, py = point
                if point in visited or not (left <= px < right and top <= py < bottom) or source[px, py] == 0:
                    continue
                visited.add(point)
                component.append(point)
                pending.extend(((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)))
            if len(component) >= 300:
                components.append(component)
    if not components:
        raise SystemExit(f"No subject mask component near {anchor}")
    # A known point inside each subject chooses the target itself, rather than every
    # changed background patch in the ROI. Nearest-point scoring tolerates edit drift.
    selected = min(
        components,
        key=lambda points: min((px - anchor[0]) ** 2 + (py - anchor[1]) ** 2 for px, py in points),
    )
    result = Image.new("L", SIZE)
    output = result.load()
    for px, py in selected:
        output[px, py] = 255
    return result


def subject_mask(
    subject: Image.Image,
    plate: Image.Image,
    region: tuple[int, int, int, int],
    anchor: tuple[int, int],
) -> Image.Image:
    """Create a hard subject mask; RGB difference is only a segmentation seed, never alpha."""
    difference = ImageChops.difference(subject.convert("RGB"), plate.convert("RGB"))
    # max(R,G,B) retains flat character fills that luminance conversion can understate.
    channels = difference.split()
    maximum = ImageChops.lighter(ImageChops.lighter(channels[0], channels[1]), channels[2])
    mask = maximum.point(lambda value: 255 if value >= 42 else 0)
    roi = Image.new("L", SIZE)
    roi.paste(255, region)
    mask = ImageChops.multiply(mask, roi)
    # Close small gaps, remove plate-noise islands, then make every enclosed subject pixel opaque.
    mask = mask.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(7))
    mask = _fill_holes(_keep_subject_component(mask, anchor))
    # Preserve a hard 255 interior; only a one-pixel exterior antialias fringe may be translucent.
    fringe = ImageChops.subtract(mask.filter(ImageFilter.MaxFilter(3)), mask)
    fringe = fringe.point(lambda value: 128 if value else 0)
    return ImageChops.lighter(mask, fringe)


def masked_layer(
    subject: Image.Image,
    plate: Image.Image,
    region: tuple[int, int, int, int],
    anchor: tuple[int, int],
) -> Image.Image:
    alpha = subject_mask(subject, plate, region, anchor)
    layer = subject.copy()
    layer.putalpha(alpha)
    return layer


def overlay(*images: Image.Image) -> Image.Image:
    result = Image.new("RGBA", SIZE)
    for image in images:
        result.alpha_composite(image)
    return result


def transformed(layer: Image.Image, center: tuple[int, int], scale: float) -> Image.Image:
    bbox = layer.getchannel("A").getbbox()
    if bbox is None:
        raise SystemExit("Bag extraction has no visible pixels")
    current = ((bbox[0] + bbox[2]) // 2, (bbox[1] + bbox[3]) // 2)
    crop = layer.crop(bbox)
    crop = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)
    translated = Image.new("RGBA", SIZE)
    translated.alpha_composite(crop, (center[0] - crop.width // 2, center[1] - crop.height // 2))
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
        name: masked_layer(master, background, REGIONS[name], ANCHORS[name])
        for name in ("player-seated", "npc-standing", "bag")
    }
    layers["npc-seated"] = masked_layer(
        seated_composite, background, REGIONS["npc-seated"], ANCHORS["npc-seated"]
    )

    background.convert("RGB").save(args.out_dir / "train-background.png")
    for name, layer in layers.items():
        layer.save(args.out_dir / f"train-{name}.png")

    before = overlay(background, layers["player-seated"], layers["npc-standing"], layers["bag"])
    after = overlay(background, layers["player-seated"], layers["npc-seated"])
    before.save(args.out_dir / "train-preview-before.png")
    after.save(args.out_dir / "train-preview-after-seated.png")
    overlay(after, transformed(layers["bag"], (270, 905), 0.72)).save(args.out_dir / "train-preview-after-lap.png")
    overlay(after, transformed(layers["bag"], (510, 1260), 0.82)).save(args.out_dir / "train-preview-after-floor.png")

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
            if path.stem in {"train-player-seated", "train-npc-standing", "train-npc-seated", "train-bag"}:
                counts = image.convert("RGBA").getchannel("A").histogram()
                transparent, opaque, intermediate = counts[0], counts[255], sum(counts[1:255])
                visible = opaque + intermediate
                ratio = intermediate / visible if visible else 1.0
                print(f"  alpha: zero={transparent}, opaque={opaque}, intermediate={intermediate} ({ratio:.3%} visible)")
                if ratio > 0.05:
                    print(f"::warning file={path}::Intermediate alpha exceeds 5% of visible pixels")


if __name__ == "__main__":
    main()
