#!/usr/bin/env python3
"""Reusable primitives for turning transparent isolation edits into scene layers.

RGB and alpha both originate in the isolation response.  A semantic mask is not
permission to copy pixels from a completed scene: those pixels can describe an
occluder or background even when they are inside the subject silhouette.
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from enum import Enum

from PIL import Image, ImageChops, ImageDraw, ImageFilter


class RGBSource(str, Enum):
    API_RGBA = "api_isolation"
    MASTER_SAFE_COPY = "master_safe_copy"
    GENERATED_FILL = "generated_fill"
    PROHIBITED_MASTER_COPY = "prohibited_master_copy"


@dataclass(frozen=True)
class AssemblyResult:
    image: Image.Image
    rgb_source: str
    master_rgb_override_ratio: float


def require_canvas(image: Image.Image, size: tuple[int, int], label: str) -> None:
    if image.size != size:
        raise ValueError(f"{label} is {image.size}, expected {size}")


def connected_components(mask: Image.Image) -> list[list[tuple[int, int]]]:
    """Return 4-connected nonzero components, largest first."""
    pixels, seen, result = mask.load(), set(), []
    bbox = mask.getbbox()
    if bbox is None:
        return result
    left, top, right, bottom = bbox
    for y in range(top, bottom):
        for x in range(left, right):
            if not pixels[x, y] or (x, y) in seen:
                continue
            component, queue = [], deque([(x, y)])
            while queue:
                point = queue.popleft()
                if point in seen:
                    continue
                seen.add(point)
                px, py = point
                if not (left <= px < right and top <= py < bottom) or not pixels[px, py]:
                    continue
                component.append(point)
                queue.extend(((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)))
            result.append(component)
    return sorted(result, key=len, reverse=True)


def select_main_component(alpha: Image.Image, *, threshold: int = 16,
                          minimum_pixels: int = 2_000,
                          max_stray_ratio: float = 0.02) -> tuple[Image.Image, list[int]]:
    semantic = alpha.point(lambda value: 255 if value >= threshold else 0)
    parts = connected_components(semantic)
    if not parts or len(parts[0]) < minimum_pixels:
        raise ValueError("no credible main subject")
    sizes = [len(part) for part in parts]
    if len(sizes) > 1 and sizes[1] / sizes[0] >= max_stray_ratio:
        raise ValueError(f"stray component is {sizes[1] / sizes[0]:.2%} of subject")
    selected = Image.new("L", alpha.size)
    selected_pixels = selected.load()
    for x, y in parts[0]:
        selected_pixels[x, y] = 255
    return selected, sizes


def normalize_semantic_alpha(raw_alpha: Image.Image, *, minimum_pixels: int = 2_000,
                             max_stray_ratio: float = 0.02) -> tuple[Image.Image, list[int]]:
    """Keep API antialiasing on the main semantic component and remove residue.

    The function deliberately does not grow or fill the silhouette: generated RGB
    does not exist outside the API subject, and inventing alpha there can expose
    arbitrary transparent-pixel RGB.
    """
    selected, sizes = select_main_component(
        raw_alpha, minimum_pixels=minimum_pixels, max_stray_ratio=max_stray_ratio
    )
    alpha = ImageChops.multiply(raw_alpha, selected)
    # Pixels well inside the API subject are made fully opaque; edge alpha is retained.
    interior = selected.filter(ImageFilter.MinFilter(5))
    alpha = ImageChops.lighter(alpha, interior)
    return alpha, sizes


def assemble_isolated_rgba(api_rgba: Image.Image, alpha: Image.Image, *,
                           master: Image.Image | None = None,
                           safe_master_mask: Image.Image | None = None,
                           max_master_override_ratio: float = 0.10) -> AssemblyResult:
    """Assemble a layer from API RGB; allow only explicit, bounded safe corrections."""
    layer = api_rgba.convert("RGBA")
    layer.putalpha(alpha)
    # Canonicalize invisible pixels without changing any visible API RGB. This makes
    # accidental hidden background payloads detectable and keeps PNGs deterministic.
    visible_mask = alpha.point(lambda value: 255 if value else 0)
    canonical = Image.new("RGBA", layer.size)
    canonical.paste(layer, mask=visible_mask)
    canonical.putalpha(alpha)
    layer = canonical
    visible = sum(alpha.histogram()[1:])
    override = 0
    if safe_master_mask is not None:
        if master is None:
            raise ValueError("safe_master_mask requires a master reference")
        safe = ImageChops.multiply(safe_master_mask.convert("L"), alpha.point(lambda v: 255 if v else 0))
        override = sum(safe.histogram()[1:])
        ratio = override / visible if visible else 1.0
        if ratio > max_master_override_ratio:
            raise ValueError(f"master RGB override {ratio:.2%} exceeds {max_master_override_ratio:.2%}")
        layer.paste(master.convert("RGBA"), mask=safe)
        layer.putalpha(alpha)
    ratio = override / visible if visible else 0.0
    source = RGBSource.MASTER_SAFE_COPY.value if override else RGBSource.API_RGBA.value
    return AssemblyResult(layer, source, ratio)


def transparent_background_is_clean(image: Image.Image) -> bool:
    """Return whether every alpha-zero pixel also has canonical zero RGB."""
    rgba = image.convert("RGBA")
    alpha_zero = rgba.getchannel("A").point(lambda value: 255 if value == 0 else 0)
    rgb = rgba.convert("RGB")
    return all(channel.getbbox() is None for channel in (
        ImageChops.multiply(rgb.getchannel(index), alpha_zero) for index in range(3)
    ))


def checkerboard_preview(layer: Image.Image, *, tile: int = 24) -> Image.Image:
    board = Image.new("RGBA", layer.size, (255, 255, 255, 255))
    draw = ImageDraw.Draw(board)
    colors = ((224, 224, 224, 255), (255, 255, 255, 255))
    for y in range(0, layer.height, tile):
        for x in range(0, layer.width, tile):
            draw.rectangle((x, y, min(x + tile - 1, layer.width - 1),
                            min(y + tile - 1, layer.height - 1)),
                           fill=colors[((x // tile) + (y // tile)) & 1])
    board.alpha_composite(layer)
    return board.convert("RGB")


def composite_layers(background: Image.Image, *layers: Image.Image) -> Image.Image:
    result = background.convert("RGBA")
    for layer in layers:
        result.alpha_composite(layer)
    return result
