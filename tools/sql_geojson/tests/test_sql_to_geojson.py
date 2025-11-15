import os
import sys
import json
import tempfile
import unittest
from shapely.geometry import Point
from shapely import wkb

# ensure module path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sql_to_geojson import sql_to_geojson


class TestSQLToGeoJSON(unittest.TestCase):
    def test_basic_sample(self):
        here = os.path.dirname(__file__)
        sample = os.path.join(here, '..', 'samples', 'sample.sql')
        with open(sample, 'r', encoding='utf-8') as f:
            txt = f.read()
        fc = sql_to_geojson(txt)
        self.assertEqual(fc['type'], 'FeatureCollection')
        self.assertEqual(len(fc['features']), 2)
        coords = [tuple(feat['geometry']['coordinates']) for feat in fc['features']]
        self.assertIn((100.0, 0.0), coords)

    def test_wkb_hex(self):
        # generate WKB hex of a point and embed in a fake INSERT
        p = Point(10.0, 20.0)
        b = wkb.dumps(p)
        hx = b.hex()
        sql = "INSERT INTO t (id, geom) VALUES (1, E'\\x" + hx + "');"
        fc = sql_to_geojson(sql)
        self.assertEqual(len(fc['features']), 1)
        geom = fc['features'][0]['geometry']
        self.assertEqual(geom['type'], 'Point')


if __name__ == '__main__':
    unittest.main()
