#!/usr/bin/env python3
"""
geojson_to_sql.py

Konversi GeoJSON FeatureCollection -> SQL INSERT statements.

Limitasi: script menghasilkan INSERT sederhana dengan kolom properti
dan kolom geom yang diisi dengan ST_GeomFromText(WKT, SRID).
User perlu memastikan tabel/koneksi DB sesuai.
"""

import argparse
import json
from shapely.geometry import shape
from shapely import wkt


def feature_to_insert(feature, table, prop_keys, geom_col='geom', srid=4326):
    props = feature.get('properties', {}) or {}
    values = []
    for k in prop_keys:
        v = props.get(k)
        if v is None:
            values.append('NULL')
        elif isinstance(v, (int, float)):
            values.append(str(v))
        else:
            # escape single quotes
            s = str(v).replace("'", "''")
            values.append("'{}'".format(s))

    geom = feature.get('geometry')
    if geom is None:
        geom_wkt = None
    else:
        try:
            # default precision is None (full). We'll let caller pass precision via kwarg later.
            geom_wkt = wkt.dumps(shape(geom))
        except Exception:
            geom_wkt = None

    cols = prop_keys + [geom_col]
    vals = values
    if geom_wkt is None:
        vals.append('NULL')
    else:
        # wrap WKT
        vals.append("ST_GeomFromText('{}', {})".format(geom_wkt.replace("'", "''"), srid))

    insert = "INSERT INTO {table} ({cols}) VALUES ({vals});".format(
        table=table,
        cols=','.join(cols),
        vals=','.join(vals)
    )
    return insert


def geojson_to_sql(fc, table, geom_col='geom', srid=4326):
    features = fc.get('features', [])
    # collect all property keys in order of appearance
    keys = []
    seen = set()
    for f in features:
        props = f.get('properties', {}) or {}
        for k in props.keys():
            if k not in seen:
                seen.add(k)
                keys.append(k)

    inserts = [feature_to_insert(f, table, keys, geom_col=geom_col, srid=srid) for f in features]
    return inserts


def main():
    p = argparse.ArgumentParser(description='Convert GeoJSON -> simple SQL INSERT with ST_GeomFromText')
    p.add_argument('input', help='GeoJSON input file (or - for stdin)')
    p.add_argument('-t', '--table', required=True, help='Target table name')
    p.add_argument('--srid', type=int, default=4326, help='SRID to use for ST_GeomFromText')
    p.add_argument('--wkt-precision', type=int, default=None, help='Decimal precision for WKT (passed to shapely.wkt.dumps)')
    p.add_argument('-o', '--output', help='SQL output file (default stdout)')
    p.add_argument('--geom-column', default='geom', help='Name of geometry column')
    args = p.parse_args()

    if args.input == '-':
        import sys
        data = json.load(sys.stdin)
    else:
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)

    # pass precision down to formatter
    # monkeypatch: pass precision by temporarily binding to function if provided
    if args.wkt_precision is not None:
        # redefine feature_to_insert to include precision
        from functools import partial
        original = feature_to_insert
        def feature_to_insert_with_prec(feature, table, prop_keys, geom_col='geom', srid=4326):
            props = feature.get('properties', {}) or {}
            values = []
            for k in prop_keys:
                v = props.get(k)
                if v is None:
                    values.append('NULL')
                elif isinstance(v, (int, float)):
                    values.append(str(v))
                else:
                    s = str(v).replace("'", "''")
                    values.append("'{}'".format(s))

            geom = feature.get('geometry')
            if geom is None:
                geom_wkt = None
            else:
                try:
                    geom_wkt = wkt.dumps(shape(geom), rounding_precision=args.wkt_precision)
                except Exception:
                    geom_wkt = None

            cols = prop_keys + [geom_col]
            vals = values
            if geom_wkt is None:
                vals.append('NULL')
            else:
                vals.append("ST_GeomFromText('{}', {})".format(geom_wkt.replace("'", "''"), srid))

            insert = "INSERT INTO {table} ({cols}) VALUES ({vals});".format(
                table=table,
                cols=','.join(cols),
                vals=','.join(vals)
            )
            return insert
        feature_to_insert = feature_to_insert_with_prec

    inserts = geojson_to_sql(data, args.table, geom_col=args.geom_column, srid=args.srid)

    out_text = '\n'.join(inserts) + '\n'
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(out_text)
    else:
        print(out_text)


if __name__ == '__main__':
    main()
