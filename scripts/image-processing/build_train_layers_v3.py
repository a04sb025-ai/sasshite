#!/usr/bin/env python3
"""Configure and build train v3 layers using the common isolation pipeline."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops

from layer_extraction import (assemble_isolated_rgba, checkerboard_preview,
                              composite_layers, normalize_semantic_alpha, require_canvas)
from layer_quality import inspect_layer

SIZE = (1024, 1536)


@dataclass(frozen=True)
class LayerConfig:
    name: str
    mask_name: str
    expected_roi: tuple[int, int, int, int]
    movable: bool
    identity_preservation: bool
    shadow_policy: str = "exclude_background_shadow"


LAYERS = (
    LayerConfig("player-seated", "player", (45, 430, 390, 1340), False, True),
    LayerConfig("npc-standing", "npc-standing", (650, 300, 1010, 1335), False, True),
    LayerConfig("npc-seated", "npc-seated", (350, 350, 990, 1375), False, True),
    LayerConfig("bag", "bag", (360, 850, 650, 1065), True, True),
)


def load(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    require_canvas(image, SIZE, str(path))
    return image


def transform(layer: Image.Image, center: tuple[int, int], scale: float) -> Image.Image:
    bbox = layer.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("cannot transform an empty layer")
    crop = layer.crop(bbox)
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

    layers, report = {}, {"schema_version": 1, "canvas_size": list(SIZE), "layers": {}}
    for config in LAYERS:
        raw = load(args.raw_dir / f"train-{config.name}-v3-raw.png")
        alpha, _component_sizes = normalize_semantic_alpha(raw.getchannel("A"))
        # Both RGB and alpha are from the transparent isolation response. The master is
        # reference-only; no semantic-mask-wide master paste is permitted.
        assembled = assemble_isolated_rgba(raw, alpha)
        quality = inspect_layer(
            assembled.image, expected_size=SIZE, expected_roi=config.expected_roi,
            rgb_source=assembled.rgb_source,
            master_rgb_override_ratio=assembled.master_rgb_override_ratio,
        )
        entry = quality.as_report()
        entry.update({"movable": config.movable,
                      "identity_preservation": config.identity_preservation,
                      "shadow_policy": config.shadow_policy})
        report["layers"][config.name] = entry
        print(f"{config.name}: rgb_source={assembled.rgb_source} "
              f"master_rgb_override={assembled.master_rgb_override_ratio:.1%} "
              f"outside_roi={quality.expected_roi_outside_ratio:.2%}")
        if not quality.pass_:
            raise SystemExit(f"FAIL {config.name}: {'; '.join(quality.failure_reasons)}")
        layer_path = args.out_dir / f"train-{config.name}-v3.png"
        assembled.image.save(layer_path)
        alpha.save(args.out_dir / f"mask-{config.mask_name}-v3.png")
        checkerboard_preview(assembled.image).save(args.out_dir / f"debug-{config.mask_name}-v3.png")
        layers[config.name] = assembled.image

    before = composite_layers(background, layers["player-seated"], layers["npc-standing"], layers["bag"])
    seated = composite_layers(background, layers["player-seated"], layers["npc-seated"])
    previews = {
        "train-preview-v3-before.png": before,
        "train-preview-v3-after-seated.png": seated,
        "train-preview-v3-after-lap.png": composite_layers(seated, transform(layers["bag"], (270, 905), .72)),
        "train-preview-v3-after-floor.png": composite_layers(seated, transform(layers["bag"], (510, 1260), .82)),
        "train-preview-v3-diff.png": ImageChops.difference(master.convert("RGB"), before.convert("RGB")),
    }
    for name, image in previews.items():
        require_canvas(image, SIZE, name)
        image.save(args.out_dir / name)
    (args.out_dir / "quality-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
