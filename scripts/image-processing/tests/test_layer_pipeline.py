from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
PROCESSING = ROOT / "scripts" / "image-processing"
sys.path.insert(0, str(PROCESSING))

from layer_extraction import (RGBSource, assemble_isolated_rgba, checkerboard_preview,
                              connected_components, normalize_semantic_alpha,
                              transparent_background_is_clean)
from layer_quality import inspect_layer


class LayerPipelineTests(unittest.TestCase):
    def test_semantic_mask_keeps_main_and_rejects_large_stray(self):
        alpha = Image.new("L", (100, 100))
        draw = ImageDraw.Draw(alpha)
        draw.rectangle((10, 10, 60, 80), fill=255)
        draw.rectangle((90, 90, 92, 92), fill=255)
        normalized, sizes = normalize_semantic_alpha(alpha, minimum_pixels=100)
        self.assertEqual(len(sizes), 2)
        self.assertIsNone(normalized.crop((89, 89, 94, 94)).getbbox())
        draw.rectangle((70, 60, 84, 75), fill=255)
        with self.assertRaisesRegex(ValueError, "stray component"):
            normalize_semantic_alpha(alpha, minimum_pixels=100)

    def test_connected_component_gate(self):
        mask = Image.new("L", (50, 50))
        draw = ImageDraw.Draw(mask)
        draw.rectangle((2, 2, 20, 20), fill=255)
        draw.rectangle((30, 30, 40, 40), fill=255)
        self.assertEqual([361, 121], [len(c) for c in connected_components(mask)])

    def test_api_rgb_prevents_master_background_line_regression(self):
        # The correct semantic alpha covers the whole person. The completed master has a
        # blue background line crossing that silhouette; the isolation RGB reconstructs it.
        alpha = Image.new("L", (80, 80))
        ImageDraw.Draw(alpha).rectangle((15, 10, 64, 69), fill=255)
        master = Image.new("RGBA", (80, 80), (0, 0, 0, 0))
        ImageDraw.Draw(master).rectangle((15, 10, 64, 69), fill=(220, 120, 60, 255))
        ImageDraw.Draw(master).rectangle((15, 38, 64, 42), fill=(20, 90, 210, 255))
        api = Image.new("RGBA", (80, 80), (0, 0, 0, 0))
        ImageDraw.Draw(api).rectangle((15, 10, 64, 69), fill=(220, 120, 60, 255))
        old = master.copy(); old.putalpha(alpha)
        new = assemble_isolated_rgba(api, alpha)
        self.assertEqual(old.getpixel((40, 40))[:3], (20, 90, 210))
        self.assertEqual(new.image.getpixel((40, 40))[:3], (220, 120, 60))
        self.assertEqual(new.rgb_source, RGBSource.API_RGBA.value)
        self.assertEqual(new.master_rgb_override_ratio, 0)
        self.assertTrue(transparent_background_is_clean(new.image))

    def test_rgb_provenance_rejects_unbounded_master_override(self):
        alpha = Image.new("L", (20, 20), 255)
        api = Image.new("RGBA", (20, 20), "red")
        master = Image.new("RGBA", (20, 20), "blue")
        with self.assertRaisesRegex(ValueError, "override"):
            assemble_isolated_rgba(api, alpha, master=master,
                                   safe_master_mask=alpha, max_master_override_ratio=.1)

    def test_alpha_roi_and_prohibited_source_gates(self):
        image = Image.new("RGBA", (100, 100))
        ImageDraw.Draw(image).rectangle((20, 20, 70, 80), fill=(1, 2, 3, 255))
        good = inspect_layer(image, expected_size=(100, 100), expected_roi=(10, 10, 90, 90),
                             rgb_source="api_isolation", master_rgb_override_ratio=0)
        self.assertTrue(good.pass_)
        bad = inspect_layer(image, expected_size=(100, 100), expected_roi=(30, 30, 60, 60),
                            rgb_source="prohibited_master_copy", master_rgb_override_ratio=1)
        self.assertFalse(bad.pass_)
        self.assertGreater(bad.expected_roi_outside_ratio, 0)

    def test_checkerboard_preview(self):
        layer = Image.new("RGBA", (48, 48))
        ImageDraw.Draw(layer).rectangle((12, 12, 35, 35), fill=(255, 0, 0, 255))
        preview = checkerboard_preview(layer, tile=8)
        self.assertEqual(preview.mode, "RGB")
        self.assertNotEqual(preview.getpixel((0, 0)), preview.getpixel((8, 0)))
        self.assertEqual(preview.getpixel((20, 20)), (255, 0, 0))

    def test_train_preview_and_quality_report_generation(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); raw = root / "raw"; out = root / "out"; raw.mkdir()
            master = Image.new("RGBA", (1024, 1536), (245, 240, 230, 255))
            background = master.copy()
            master.save(root / "master.png"); background.save(root / "background.png")
            rectangles = {
                "player-seated": (100, 500, 300, 1200), "npc-standing": (700, 400, 930, 1250),
                "npc-seated": (450, 500, 800, 1250), "bag": (400, 900, 600, 1030),
            }
            for index, (name, box) in enumerate(rectangles.items()):
                image = Image.new("RGBA", (1024, 1536))
                ImageDraw.Draw(image).rectangle(box, fill=(100 + index * 20, 70, 50, 255))
                image.save(raw / f"train-{name}-v3-raw.png")
            subprocess.run([sys.executable, str(PROCESSING / "build_train_layers_v3.py"),
                            "--master", str(root / "master.png"), "--background", str(root / "background.png"),
                            "--raw-dir", str(raw), "--out-dir", str(out)], check=True)
            report = json.loads((out / "quality-report.json").read_text())
            self.assertTrue(all(item["pass"] for item in report["layers"].values()))
            with Image.open(out / "train-preview-v3-before.png") as preview:
                self.assertEqual(preview.size, (1024, 1536))
            for debug in ("player", "npc-standing", "npc-seated", "bag"):
                with Image.open(out / f"debug-{debug}-v3.png") as preview:
                    self.assertEqual(preview.size, (1024, 1536))


if __name__ == "__main__":
    unittest.main()
