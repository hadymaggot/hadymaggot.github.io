#!/usr/bin/env python3
"""Summarize GeoJSON outputs and validate geometries."""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Tuple

from shapely.geometry import shape
from shapely.validation import explain_validity


def analyze_geojson_tree(root: Path) -> Tuple[Dict[str, int], Dict[str, Dict[str, int]], List[Dict[str, Any]]]:
    summary = {
        "total_files": 0,
        "total_features": 0,
        "features_with_geometry": 0,
        "features_without_geometry": 0,
        "valid_geometries": 0,
        "invalid_geometries": 0,
    }
    per_level: Dict[str, Dict[str, int]] = defaultdict(
        lambda: {
            "files": 0,
            "features": 0,
            "with_geometry": 0,
            "without_geometry": 0,
            "invalid_geometries": 0,
        }
    )
    issues: List[Dict[str, Any]] = []

    for path in sorted(root.rglob("*.geojson")):
        summary["total_files"] += 1
        relative_path = path.relative_to(root)
        level = relative_path.parts[0] if relative_path.parts else "."
        level_stats = per_level[level]
        level_stats["files"] += 1

        try:
            data = json.loads(path.read_text())
        except Exception as exc:  # pragma: no cover - IO errors are runtime concerns
            issues.append({
                "file": str(relative_path),
                "type": "file_read",
                "error": str(exc),
            })
            continue

        features = data.get("features") or []
        level_stats["features"] += len(features)

        for idx, feature in enumerate(features):
            summary["total_features"] += 1
            geometry = feature.get("geometry")

            if not geometry:
                summary["features_without_geometry"] += 1
                level_stats["without_geometry"] += 1
                continue

            summary["features_with_geometry"] += 1
            level_stats["with_geometry"] += 1

            try:
                geom_obj = shape(geometry)
            except Exception as exc:  # pragma: no cover - depends on data cleanliness
                summary["invalid_geometries"] += 1
                level_stats["invalid_geometries"] += 1
                issues.append({
                    "file": str(relative_path),
                    "feature": idx,
                    "type": "invalid_geometry",
                    "error": str(exc),
                })
                continue

            if geom_obj.is_valid:
                summary["valid_geometries"] += 1
            else:
                summary["invalid_geometries"] += 1
                level_stats["invalid_geometries"] += 1
                issues.append({
                    "file": str(relative_path),
                    "feature": idx,
                    "type": "invalid_geometry",
                    "error": explain_validity(geom_obj),
                })

    return summary, per_level, issues


def main() -> None:
    parser = argparse.ArgumentParser(description="Summarize GeoJSON outputs and validate geometries.")
    parser.add_argument("root", nargs="?", default="indonesian_boundaries/db_geojson", help="Root directory to scan")
    parser.add_argument("--max-issues", type=int, default=20, dest="max_issues", help="Maximum issues to display")
    parser.add_argument("--json", action="store_true", help="Print JSON output instead of text summary")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists():
        raise SystemExit(f"Directory not found: {root}")

    summary, per_level, issues = analyze_geojson_tree(root)

    payload = {
        "root": str(root),
        "summary": summary,
        "per_level": {k: dict(v) for k, v in sorted(per_level.items())},
        "issues": issues[: args.max_issues],
    }

    if args.json:
        print(json.dumps(payload, indent=2))
        return

    print(f"GeoJSON summary for {root}")
    print("\nSummary:")
    for key, value in summary.items():
        print(f"  {key.replace('_', ' ').title()}: {value}")

    print("\nPer level:")
    for level, stats in sorted(per_level.items()):
        print(
            f"  {level}: files={stats['files']}, features={stats['features']}, "
            f"with_geom={stats['with_geometry']}, without_geom={stats['without_geometry']}, "
            f"invalid_geom={stats['invalid_geometries']}"
        )

    if issues:
        print(f"\nTop {min(args.max_issues, len(issues))} issues:")
        for issue in issues[: args.max_issues]:
            location = issue.get("file", "")
            feature = issue.get("feature")
            if feature is not None:
                location = f"{location}#feature={feature}"
            print(f"  - {issue['type']} @ {location}: {issue['error']}")
    else:
        print("\nNo issues detected.")


if __name__ == "__main__":
    main()
