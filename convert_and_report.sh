#!/bin/bash
# convert_and_report.sh
# Wrapper script to convert SQL to GeoJSON with repairs and filtering, then report stats.

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <input_dir> <output_dir>"
    echo "Converts all .sql files in input_dir to GeoJSON in output_dir,"
    echo "applying --drop-empty-geometry and --repair-geometries,"
    echo "then runs stats report on output_dir."
    exit 1
fi

INPUT_DIR="$1"
OUTPUT_DIR="$2"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONVERTER="$SCRIPT_DIR/tools/sql_geojson/sql_to_geojson.py"
REPORTER="$SCRIPT_DIR/tools/sql_geojson/report_geojson_stats.py"

echo "Converting SQL files from $INPUT_DIR to $OUTPUT_DIR..."
python "$CONVERTER" --in-dir "$INPUT_DIR" --out-dir "$OUTPUT_DIR" --drop-empty-geometry --repair-geometries --skip-errors --recursive

echo "Generating stats report for $OUTPUT_DIR..."
python "$REPORTER" "$OUTPUT_DIR"