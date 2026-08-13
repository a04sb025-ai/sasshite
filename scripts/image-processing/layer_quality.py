#!/usr/bin/env python3
"""Stage-independent quality gates and JSON reporting for generated RGBA layers."""

from __future__ import annotations

from dataclasses import asdict, dataclass

from PIL import Image, ImageFilter

from layer_extraction import connected_components, transparent_background_is_clean


@dataclass
class LayerQuality:
    size: list[int]
    alpha0: int
    alpha255: int
    intermediate_alpha: int
    intermediate_ratio: float
    connected_components: int
    largest_component_size: int
    stray_component_ratio: float
    rgb_source: str
    master_rgb_override_ratio: float
    expected_roi_outside_ratio: float
    pass_: bool
    failure_reasons: list[str]

    def as_report(self) -> dict:
        report = asdict(self)
        report["pass"] = report.pop("pass_")
        return report


def inspect_layer(image: Image.Image, *, expected_size: tuple[int, int],
                  expected_roi: tuple[int, int, int, int], rgb_source: str,
                  master_rgb_override_ratio: float,
                  max_intermediate_ratio: float = 0.05,
                  max_stray_ratio: float = 0.02,
                  max_outside_ratio: float = 0.01) -> LayerQuality:
    failures: list[str] = []
    if image.size != expected_size:
        failures.append(f"canvas size {image.size} != {expected_size}")
    alpha = image.getchannel("A")
    histogram = alpha.histogram()
    zero, opaque, intermediate = histogram[0], histogram[255], sum(histogram[1:255])
    visible = opaque + intermediate
    intermediate_ratio = intermediate / visible if visible else 1.0
    hard = alpha.point(lambda value: 255 if value else 0)
    parts = connected_components(hard)
    sizes = [len(part) for part in parts]
    stray_ratio = sizes[1] / sizes[0] if len(sizes) > 1 else 0.0
    outside = hard.copy()
    outside.paste(0, expected_roi)
    outside_ratio = sum(outside.histogram()[1:]) / visible if visible else 1.0
    if not visible:
        failures.append("no visible subject")
    if intermediate_ratio > max_intermediate_ratio:
        failures.append(f"intermediate alpha {intermediate_ratio:.2%} exceeds {max_intermediate_ratio:.2%}")
    interior = hard.filter(ImageFilter.MinFilter(11))
    interior_pixels = sum(interior.histogram()[1:])
    nonopaque = alpha.point(lambda value: 255 if value != 255 else 0)
    bad_interior = sum(Image.composite(nonopaque, Image.new("L", image.size), interior).histogram()[1:])
    if not interior_pixels or bad_interior / interior_pixels > 0.001:
        failures.append("subject interior is not opaque")
    if stray_ratio >= max_stray_ratio:
        failures.append(f"stray component {stray_ratio:.2%} is at least {max_stray_ratio:.2%}")
    if outside_ratio > max_outside_ratio:
        failures.append(f"visible pixels outside expected ROI {outside_ratio:.2%} exceed {max_outside_ratio:.2%}")
    if rgb_source == "prohibited_master_copy":
        failures.append("prohibited unconditional master RGB copy")
    if master_rgb_override_ratio > 0.10:
        failures.append("master RGB override exceeds 10%")
    if not transparent_background_is_clean(image):
        failures.append("alpha-zero pixels contain nonzero RGB")
    return LayerQuality(list(image.size), zero, opaque, intermediate, intermediate_ratio,
                        len(parts), sizes[0] if sizes else 0, stray_ratio, rgb_source,
                        master_rgb_override_ratio, outside_ratio, not failures, failures)
