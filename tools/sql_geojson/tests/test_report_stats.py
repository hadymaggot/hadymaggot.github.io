import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

# ensure module path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from report_geojson_stats import analyze_geojson_tree


class TestAnalyzeGeoJSONTree(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()

    def _write_geojson(self, filename, feature):
        fc = {
            "type": "FeatureCollection",
            "features": [feature],
        }
        path = os.path.join(self.tmpdir, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(fc, f)

    def test_summary_counts_and_missing_in_issues(self):
        # File 1: valid Point geometry
        self._write_geojson("valid.geojson", {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [110.0, -7.0]},
            "properties": {"kode": "11.01", "nama": "Test"},
        })

        # File 2: null geometry
        self._write_geojson("missing.geojson", {
            "type": "Feature",
            "geometry": None,
            "properties": {"kode": "99.99", "nama": "Missing"},
        })

        summary, per_level, issues = analyze_geojson_tree(Path(self.tmpdir))

        self.assertEqual(summary["total_features"], 2)
        self.assertEqual(summary["features_with_geometry"], 1)
        self.assertEqual(summary["features_without_geometry"], 1)
        self.assertEqual(summary["invalid_geometries"], 0)

        missing_issues = [i for i in issues if i.get("type") == "missing_geometry"]
        self.assertEqual(len(missing_issues), 1)
        self.assertEqual(missing_issues[0]["kode"], "99.99")
        self.assertEqual(missing_issues[0]["nama"], "Missing")


if __name__ == "__main__":
    unittest.main()
