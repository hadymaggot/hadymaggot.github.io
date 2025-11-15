#!/usr/bin/env python3
"""
sql_to_geojson.py

Heuristik sederhana untuk mengekstrak geometri dari file SQL (PostGIS-style)
dan mengeluarkan GeoJSON FeatureCollection.

Mendukung parsing geometri dari:
- ST_GeomFromText('WKT', SRID)
- ST_GeomFromGeoJSON('{...}')

Script ini berusaha juga mengekstrak atribut jika INSERT memiliki kolom
dan VALUES yang konsisten di baris yang sama.

Limitasi: parser ini heuristik dan tidak menangani semua variasi SQL.
Gunakan sebagai alat bantu; untuk dataset kompleks gunakan ogr2ogr atau dump DB.
"""

import argparse
import json
import re
import csv
import os
import sys
from shapely import wkt
from shapely.geometry import shape, mapping
from shapely import wkb
from shapely.ops import unary_union
import struct
try:
    import yaml
except Exception:
    yaml = None


def _swap_latlng_recursive(obj):
    """Recursively swap [lat, lng] -> [lng, lat] for numeric coordinate pairs.

    Leaves non-coordinate lists untouched except by recursion.
    """
    if isinstance(obj, list):
        # check if this is a coordinate pair (two numbers)
        if len(obj) >= 2 and all(isinstance(x, (int, float)) for x in obj[:2]):
            # swap lat/lng
            if len(obj) == 2:
                return [obj[1], obj[0]]
            # preserve any additional dimensions
            return [obj[1], obj[0]] + obj[2:]
        else:
            return [_swap_latlng_recursive(item) for item in obj]
    else:
        return obj


def _array_to_geojson_geometry(arr):
    """Convert nested arrays (as in the `path` column) into a GeoJSON geometry.

    Heuristic rules:
    - If arr is 4-deep ([[[[...]]]]), treat as MultiPolygon.
    - If arr is 3-deep ([[[...]]]) treat as Polygon (with rings).
    - If arr is 2-deep ([[...]]), treat as LineString or MultiLineString heuristically.
    """
    try:
        norm = _swap_latlng_recursive(arr)
    except Exception:
        norm = arr

    def depth(a):
        if not isinstance(a, list):
            return 0
        if not a:
            return 1
        return 1 + max(depth(x) for x in a)

    d = depth(norm)
    if d >= 4:
        return {'type': 'MultiPolygon', 'coordinates': norm}
    if d == 3:
        return {'type': 'Polygon', 'coordinates': norm}
    if d == 2:
        # decide between LineString and MultiLineString
        if any(isinstance(pt, list) and any(isinstance(sub, list) for sub in pt) for pt in norm):
            return {'type': 'MultiLineString', 'coordinates': norm}
        return {'type': 'LineString', 'coordinates': norm}
    return {'type': 'GeometryCollection', 'geometries': []}


def find_inserts(text):
    # Temukan semua pernyataan INSERT sampai titik koma berikutnya.
    inserts = []
    for m in re.finditer(r'INSERT\s+INTO', text, re.IGNORECASE):
        start = m.start()
        # cari titik koma berikutnya dari posisi start
        end = text.find(';', start)
        if end == -1:
            continue
        stmt = text[start:end+1]
        inserts.append(stmt)
    return inserts


def split_value_tuples(values_section):
    # values_section contoh: "(a,b),(c,d),(e,f)" (mungkin multiline)
    s = values_section.strip()
    tuples = []
    buf = ''
    depth = 0
    in_single = False
    prev = ''
    for ch in s:
        buf += ch
        if ch == "'" and prev != '\\':
            in_single = not in_single
        elif not in_single:
            if ch == '(':
                depth += 1
            elif ch == ')':
                depth -= 1

        if depth == 0 and buf.strip():
            # if buffer ends with ), or ) then tuple ended
            stripped = buf.strip()
            if stripped.endswith('),') or stripped.endswith(')'):
                # remove trailing comma
                tup = stripped.rstrip(',')
                # normalize any leading whitespace/comma artifacts
                tup = tup.lstrip()
                if tup.startswith(','):
                    tup = tup[1:].lstrip()
                tuples.append(tup)
                buf = ''
        prev = ch
    if buf.strip():
        tuples.append(buf.strip().rstrip(','))
    return tuples


def extract_geom_from_value(value_text):
    # Cari berbagai bentuk: ST_GeomFromText('WKT', srid), ST_GeomFromGeoJSON('{...}'),
    # ST_SetSRID(ST_GeomFromText('WKT',...), srid)
    # Cek ST_GeomFromGeoJSON
    m_geojson = re.search(r"ST_GeomFromGeoJSON\s*\(\s*'(.+?)'\s*\)", value_text, re.IGNORECASE | re.DOTALL)
    if m_geojson:
        try:
            g = json.loads(m_geojson.group(1))
            return 'geojson', g
        except Exception:
            return 'geojson_raw', m_geojson.group(1)

    # Cek ST_SetSRID(ST_GeomFromText('WKT', <srid>), <srid2>) atau ST_GeomFromText
    m_set = re.search(r"ST_SetSRID\s*\(\s*ST_GeomFromText\s*\(\s*'([^']+)'[^)]*\)\s*,\s*(\d+)\s*\)", value_text, re.IGNORECASE)
    if m_set:
        return 'wkt', m_set.group(1)

    m_wkt = re.search(r"ST_GeomFromText\s*\(\s*'([^']+)'", value_text, re.IGNORECASE)
    if m_wkt:
        return 'wkt', m_wkt.group(1)

    # If wrappers like ST_Union or ST_Collect are present, collect all inner WKT occurrences
    if re.search(r"ST_Union\s*\(|ST_Collect\s*\(|ST_Collect\s*\b|ST_Union\s*\b", value_text, re.IGNORECASE):
        wkts = re.findall(r"'([^']*\b(?:POINT|LINESTRING|POLYGON|MULTI)[^']*)'", value_text, re.IGNORECASE)
        if wkts:
            return 'wkt_multi', wkts

    # EWKT inside quotes: 'SRID=4326;POINT(...)'
    m_ewkt = re.search(r"'SRID=\d+;([^']+)'", value_text, re.IGNORECASE)
    if m_ewkt:
        return 'wkt', m_ewkt.group(1)

    # Hex WKB patterns: E'\\x0101..', '\\x0101..', X'0101..' or 0x0101..
    m_hex_e = re.search(r"E'\\\\x([0-9A-Fa-f]+)'", value_text)
    if not m_hex_e:
        m_hex = re.search(r"'\\x([0-9A-Fa-f]+)'", value_text)
        if m_hex:
            m_hex_e = m_hex
    if not m_hex_e:
        m_hex2 = re.search(r"X'([0-9A-Fa-f]+)'", value_text, re.IGNORECASE)
        if m_hex2:
            m_hex_e = m_hex2
    if not m_hex_e:
        m_hex3 = re.search(r"0x([0-9A-Fa-f]+)", value_text, re.IGNORECASE)
        if m_hex3:
            m_hex_e = m_hex3
    if m_hex_e:
        hexs = m_hex_e.group(1)
        try:
            b = bytes.fromhex(hexs)
            return 'wkb', b
        except Exception:
            pass
    # detect JSON-like array geometry stored as a quoted literal or raw array
    vt = value_text.strip()
    # remove surrounding single or double quotes if present
    if (vt.startswith("'") and vt.endswith("'")) or (vt.startswith('"') and vt.endswith('"')):
        inner = vt[1:-1].strip()
    else:
        inner = vt

    if inner.startswith('['):
        try:
            arr = json.loads(inner)
            return 'array', arr
        except Exception:
            # not valid json, fall through
            pass

    return None, None


def extract_srid_from_wkb(bts):
    """Try to parse EWKB header to extract SRID if present.

    Returns integer SRID or None.
    """
    try:
        if len(bts) < 5:
            return None
        bo = bts[0]
        endian = '<' if bo == 1 else '>'
        # type is next 4 bytes
        type_uint = struct.unpack(endian + 'I', bts[1:5])[0]
        SRID_FLAG = 0x20000000
        if (type_uint & SRID_FLAG) != 0:
            # srid follows next 4 bytes
            if len(bts) >= 9:
                srid = struct.unpack(endian + 'I', bts[5:9])[0]
                return srid
    except Exception:
        return None
    return None

    # direct WKT string (rare)
    m_plain = re.search(r"'\s*(POINT|LINESTRING|POLYGON|MULTI)\s*\([^']+\)'", value_text, re.IGNORECASE)
    if m_plain:
        inner = value_text.strip().strip("() ")
        # extract between first quote pair
        mq = re.search(r"'([^']+)'", value_text)
        if mq:
            return 'wkt', mq.group(1)

    return None, None


def parse_values_block(values_block):
    # values_block is a single VALUES(...) content without trailing );
    # We'll parse using csv.reader with quotechar='\'' so string values in single quotes
    # But first, replace escaped single quotes '' -> '\'' placeholder
    placeholder = "__SINGLE_QUOTE_PLACEHOLDER__"
    vb = values_block.replace("''", placeholder)
    # remove any parentheses inside (should be stripped by caller)
    reader = csv.reader([vb], delimiter=',', quotechar="'", escapechar='\\')
    row = next(reader)
    row = [c.replace(placeholder, "'").strip() for c in row]
    return row


def sql_to_geojson(sql_text):
    features = []
    for stmt in find_inserts(sql_text):
        # extract table and column list and values section
        m = re.search(r"INSERT\s+INTO\s+([^\s(]+)\s*\(([^)]+)\)\s*VALUES\s*(.+);\s$",
                      stmt, re.IGNORECASE | re.DOTALL)
        if not m:
            # try more lenient match without requiring end anchor
            m = re.search(r"INSERT\s+INTO\s+([^\s(]+)\s*\(([^)]+)\)\s*VALUES\s*(.+);",
                          stmt, re.IGNORECASE | re.DOTALL)
        if not m:
            continue
        table = m.group(1)
        cols_raw = m.group(2)
        values_section = m.group(3)

        cols = [c.strip().strip('"') for c in cols_raw.split(',')]

        # split values_section into multiple tuples
        tuples = split_value_tuples(values_section)
        for tup in tuples:
            # remove outer parentheses
            inner = tup.strip()
            if inner.startswith('(') and inner.endswith(')'):
                inner = inner[1:-1]
            try:
                vals = parse_values_block(inner)
            except Exception:
                vals = [inner]

            geom_idx = None
            geom_type = None
            geom_value = None
            for i, v in enumerate(vals):
                t, g = extract_geom_from_value(v)
                if t:
                    geom_idx = i
                    geom_type = t
                    geom_value = g
                    break

            props = {}
            if geom_idx is not None:
                for i, col in enumerate(cols):
                    if i == geom_idx:
                        continue
                    val = vals[i]
                    if len(val) >= 2 and val[0] == "'" and val[-1] == "'":
                        val = val[1:-1]
                    if val.upper() == 'NULL':
                        val = None
                    else:
                        try:
                            if '.' in val:
                                val = float(val)
                            else:
                                val = int(val)
                        except Exception:
                            pass
                    props[col] = val

                geom = None
                if geom_type == 'wkt' and geom_value is not None:
                    try:
                        geom = mapping(wkt.loads(geom_value))
                    except Exception:
                        geom = None
                elif geom_type == 'wkb' and geom_value is not None:
                    try:
                        geom = mapping(wkb.loads(geom_value))
                        # try to extract SRID from EWKB and attach to properties
                        sr = extract_srid_from_wkb(geom_value)
                        if sr is not None:
                            # attach srid at top-level instead of properties (we'll set below)
                            _top_srid = sr
                        else:
                            _top_srid = None
                    except Exception:
                        geom = None
                elif geom_type == 'wkt_multi' and geom_value is not None:
                    # build geometries from multiple wkts and union/collect
                    try:
                        geoms = [wkt.loads(s) for s in geom_value]
                        # attempt to create a union
                        unioned = unary_union(geoms)
                        geom = mapping(unioned)
                    except Exception:
                        geom = None
                elif geom_type in ('geojson', 'geojson_raw'):
                    try:
                        if geom_type == 'geojson_raw':
                            geom = json.loads(geom_value)
                        else:
                            geom = geom_value
                    except Exception:
                        geom = None
                elif geom_type == 'array' and geom_value is not None:
                    try:
                        geom = _array_to_geojson_geometry(geom_value)
                    except Exception:
                        geom = None
                # move top-level SRID out of properties if present
                top_srid = None
                if 'srid' in props:
                    top_srid = props.pop('srid')
                if '_top_srid' in locals() and _top_srid is not None:
                    top_srid = _top_srid
                feature = {'type': 'Feature', 'properties': props, 'geometry': geom}
                if top_srid is not None:
                    feature['srid'] = top_srid
                features.append(feature)
            else:
                # fallback: try to find any geometry in tuple text
                t, g = extract_geom_from_value(tup)
                geom = None
                if t == 'wkt' and g is not None:
                    try:
                        geom = mapping(wkt.loads(g))
                    except Exception:
                        geom = None
                elif t == 'wkb' and g is not None:
                    try:
                        geom = mapping(wkb.loads(g))
                        sr = extract_srid_from_wkb(g)
                        if sr is not None:
                            props = {'srid': sr}
                        else:
                            props = {}
                    except Exception:
                        geom = None
                        props = {}
                elif t == 'geojson':
                    geom = g
                features.append({'type': 'Feature', 'properties': props if 'props' in locals() else {}, 'geometry': geom})

    return {'type': 'FeatureCollection', 'features': features}


def main():
    p = argparse.ArgumentParser(description='Convert simple PostGIS-style SQL -> GeoJSON')
    p.add_argument('input', help='SQL input file or directory (use --in-dir for directory) or - for stdin')
    p.add_argument('-o', '--output', help='GeoJSON output file (default stdout for single file)')
    p.add_argument('--in-dir', action='store_true', help='Treat input as directory and process .sql files inside')
    p.add_argument('--out-dir', help='Output directory when using --in-dir (defaults to input dir)')
    p.add_argument('--recursive', action='store_true', help='When --in-dir, walk directories recursively')
    p.add_argument('--skip-errors', action='store_true', help='Continue on parse errors')
    p.add_argument('--batch-size', type=int, default=0, help='When >0, split output into multiple files with at most N features each')
    p.add_argument('--map', dest='map_file', help='JSON mapping file to rename/reorder properties. Format: {"properties": {"include": [...], "rename": {"old":"new"}}}')
    p.add_argument('--drop-empty-geometry', action='store_true', help='Skip features where geometry could not be parsed/built')
    p.add_argument('--repair-geometries', action='store_true', help='Attempt to repair invalid geometries using buffer(0) and ring orientation fixes')
    args = p.parse_args()

    def process_file(path, outpath=None):
        # streaming parser: read file line-by-line and flush statements at semicolons
        try:
            f = open(path, 'r', encoding='utf-8')
        except Exception as e:
            print(f"Failed to read {path}: {e}", file=sys.stderr)
            return False

        # load mapping config once
        mapping_cfg = None
        if args.map_file:
            try:
                if args.map_file.lower().endswith(('.yml', '.yaml')):
                    if yaml is None:
                        raise RuntimeError('PyYAML not installed')
                    with open(args.map_file, 'r', encoding='utf-8') as mf:
                        mapping_cfg = yaml.safe_load(mf)
                else:
                    with open(args.map_file, 'r', encoding='utf-8') as mf:
                        mapping_cfg = json.load(mf)
            except Exception as e:
                print(f"Failed to load mapping {args.map_file}: {e}", file=sys.stderr)
                if not args.skip_errors:
                    f.close()
                    return False

        batch_size = args.batch_size or 0
        base = outpath or None
        part_index = 0

        def apply_mapping(feat):
            if not mapping_cfg:
                return feat
            props_cfg = mapping_cfg.get('properties', {})
            include = props_cfg.get('include')
            rename = props_cfg.get('rename', {})
            transforms = mapping_cfg.get('transforms', {})
            coerce_map = transforms.get('coerce', {}) if transforms else {}
            lookup_map = transforms.get('lookup', {}) if transforms else {}
            regex_map = transforms.get('regex', {}) if transforms else {}
            date_map = transforms.get('date', {}) if transforms else {}
            csv_map = transforms.get('csv_lookup', {}) if transforms else {}

            props = feat.get('properties', {}) or {}
            new_props = {}
            keys = include if include is not None else list(props.keys())
            for k in keys:
                v = props.get(k)
                # apply lookup first
                if k in lookup_map and v is not None:
                    v = lookup_map[k].get(str(v), v)
                # regex extraction
                if k in regex_map and v is not None:
                    pat = regex_map[k].get('pattern')
                    grp = regex_map[k].get('group', 1)
                    if pat:
                        m = re.search(pat, str(v))
                        if m:
                            v = m.group(grp)
                # date parsing
                if k in date_map and v is not None:
                    fmt = date_map[k]
                    try:
                        from datetime import datetime
                        v = datetime.strptime(v, fmt).isoformat()
                    except Exception:
                        pass
                # csv lookup: csv_map[k] -> {'file':..., 'key':..., 'value':...}
                if k in csv_map and v is not None:
                    cfg = csv_map[k]
                    try:
                        csvfile = cfg.get('file')
                        keycol = cfg.get('key', 0)
                        valcol = cfg.get('value', 1)
                        # load csv into mapping cached on mapping_cfg
                        cache = mapping_cfg.setdefault('_csv_cache', {})
                        if csvfile not in cache:
                            mp = {}
                            with open(csvfile, 'r', encoding='utf-8') as cf:
                                rdr = csv.reader(cf)
                                for row in rdr:
                                    if len(row) > max(keycol, valcol):
                                        mp[row[keycol]] = row[valcol]
                            cache[csvfile] = mp
                        v = cache[csvfile].get(str(v), v)
                    except Exception:
                        pass
                # apply coercion
                if k in coerce_map and v is not None:
                    typ = coerce_map[k]
                    try:
                        if typ == 'int':
                            v = int(v)
                        elif typ == 'float':
                            v = float(v)
                        elif typ == 'str':
                            v = str(v)
                        elif typ == 'bool':
                            v = bool(v)
                    except Exception:
                        pass
                new_key = rename.get(k, k)
                new_props[new_key] = v
            feat['properties'] = new_props
            return feat

        # prepare output for streaming
        if batch_size == 0 and base:
            os.makedirs(os.path.dirname(base) or '.', exist_ok=True)
            out_fp = open(base, 'w', encoding='utf-8')
            out_fp.write('{"type": "FeatureCollection", "features": [')
            first_written = True
        else:
            out_fp = None

        stmt_buf = ''
        current_batch = []
        skipped_empty = 0
        repaired_invalid = 0
        try:
            for line in f:
                stmt_buf += line
                while ';' in stmt_buf:
                    idx = stmt_buf.find(';')
                    stmt = stmt_buf[:idx+1]
                    stmt_buf = stmt_buf[idx+1:]
                    try:
                        fc = sql_to_geojson(stmt)
                    except Exception as e:
                        print(f"Parse error in statement: {e}", file=sys.stderr)
                        if not args.skip_errors:
                            if out_fp:
                                out_fp.close()
                            f.close()
                            return False
                        continue

                    for feat in fc.get('features', []):
                        feat = apply_mapping(feat)
                        if args.repair_geometries and feat.get('geometry'):
                            try:
                                geom_obj = shape(feat['geometry'])
                                if not geom_obj.is_valid:
                                    # Try buffer(0) to fix topology
                                    geom_obj = geom_obj.buffer(0)
                                    if not geom_obj.is_valid:
                                        # Try orient to fix ring order
                                        geom_obj = geom_obj.orient()
                                    if geom_obj.is_valid:
                                        feat['geometry'] = mapping(geom_obj)
                                        repaired_invalid += 1
                            except Exception:
                                pass  # leave as is if repair fails
                        if args.drop_empty_geometry and not feat.get('geometry'):
                            skipped_empty += 1
                            continue
                        if batch_size and base:
                            current_batch.append(feat)
                            if len(current_batch) >= batch_size:
                                part_fc = {'type': 'FeatureCollection', 'features': current_batch}
                                part_path = f"{os.path.splitext(base)[0]}_part{part_index:03d}{os.path.splitext(base)[1]}"
                                with open(part_path, 'w', encoding='utf-8') as pf:
                                    json.dump(part_fc, pf, ensure_ascii=False, indent=2)
                                part_index += 1
                                current_batch = []
                        elif out_fp is not None:
                            # streaming to single file
                            if not first_written:
                                out_fp.write(',')
                            out_fp.write(json.dumps(feat, ensure_ascii=False))
                            first_written = False
                        else:
                            # no outpath: print feature-by-feature as standalone FCs
                            print(json.dumps({'type': 'FeatureCollection', 'features': [feat]}, ensure_ascii=False, indent=2))

            # flush leftover batch
            if batch_size and base and current_batch:
                part_fc = {'type': 'FeatureCollection', 'features': current_batch}
                part_path = f"{os.path.splitext(base)[0]}_part{part_index:03d}{os.path.splitext(base)[1]}"
                with open(part_path, 'w', encoding='utf-8') as pf:
                    json.dump(part_fc, pf, ensure_ascii=False, indent=2)
                part_index += 1

            if out_fp is not None:
                out_fp.write(']}')
                out_fp.close()
            if skipped_empty and not args.drop_empty_geometry:
                # nothing to report; flag not enabled
                pass
        finally:
            f.close()

        if args.drop_empty_geometry and skipped_empty:
            print(f"[sql_to_geojson] Dropped {skipped_empty} empty-geometry features from {path}", file=sys.stderr)

        if args.repair_geometries and repaired_invalid:
            print(f"[sql_to_geojson] Repaired {repaired_invalid} invalid geometries from {path}", file=sys.stderr)

        return True

    if args.in_dir:
        in_dir = args.input
        if not os.path.isdir(in_dir):
            print(f"Not a directory: {in_dir}", file=sys.stderr)
            sys.exit(2)
        out_dir = args.out_dir or in_dir
        if args.recursive:
            for root, dirs, files in os.walk(in_dir):
                for fn in files:
                    if not fn.lower().endswith('.sql'):
                        continue
                    src = os.path.join(root, fn)
                    rel = os.path.relpath(src, in_dir)
                    dst = os.path.join(out_dir, os.path.splitext(rel)[0] + '.geojson')
                    ok = process_file(src, dst)
                    if not ok and not args.skip_errors:
                        sys.exit(1)
        else:
            for fn in os.listdir(in_dir):
                if not fn.lower().endswith('.sql'):
                    continue
                src = os.path.join(in_dir, fn)
                dst = os.path.join(out_dir, os.path.splitext(fn)[0] + '.geojson')
                ok = process_file(src, dst)
                if not ok and not args.skip_errors:
                    sys.exit(1)
    else:
        if args.input == '-':
            sql_text = sys.stdin.read()
            fc = sql_to_geojson(sql_text)
            out = json.dumps(fc, ensure_ascii=False, indent=2)
            print(out)
        else:
            in_path = args.input
            out_path = args.output
            ok = process_file(in_path, out_path)
            if not ok:
                sys.exit(1)


if __name__ == '__main__':
    main()
