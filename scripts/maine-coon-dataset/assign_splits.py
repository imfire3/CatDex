#!/usr/bin/env python3
"""Assign stratified train / validation / test splits for the Maine Coon dataset."""

from __future__ import annotations

import argparse
import json
import random
import sqlite3
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_RATIOS = {"train": 0.70, "validation": 0.15, "test": 0.15}


def stratified_assign(
    rows: list[sqlite3.Row],
    ratios: dict[str, float],
    seed: int,
) -> dict[int, str]:
    """Assign splits stratified by source. Deterministic for a given seed."""
    if abs(sum(ratios.values()) - 1.0) > 1e-9:
        raise ValueError(f"ratios must sum to 1, got {ratios}")

    by_source: dict[str, list[int]] = defaultdict(list)
    for row in rows:
        by_source[row["source"]].append(row["id"])

    rng = random.Random(seed)
    assignment: dict[int, str] = {}
    order = ("train", "validation", "test")

    for source, ids in sorted(by_source.items()):
        ids = list(ids)
        rng.shuffle(ids)
        n = len(ids)
        n_train = int(round(n * ratios["train"]))
        n_val = int(round(n * ratios["validation"]))
        # remainder goes to test so counts always sum to n
        n_test = n - n_train - n_val
        # fix edge cases where rounding leaves negative test
        if n_test < 0:
            n_val += n_test
            n_test = 0
        if n_train + n_val > n:
            n_val = max(0, n - n_train)
            n_test = n - n_train - n_val

        slices = {
            "train": ids[:n_train],
            "validation": ids[n_train : n_train + n_val],
            "test": ids[n_train + n_val :],
        }
        # ensure empty strata still get something when n is tiny
        if n >= 3 and (not slices["validation"] or not slices["test"]):
            # rebalance from train tail
            pool = list(ids)
            rng.shuffle(pool)
            slices = {
                "train": pool[: max(1, n - 2)],
                "validation": pool[max(1, n - 2) : max(1, n - 2) + 1],
                "test": pool[max(1, n - 2) + 1 :],
            }
            if not slices["test"] and len(slices["train"]) > 1:
                slices["test"] = [slices["train"].pop()]

        for split_name in order:
            for image_id in slices[split_name]:
                assignment[image_id] = split_name

    return assignment


def apply_splits(
    con: sqlite3.Connection,
    assignment: dict[int, str],
    ratios: dict[str, float],
    seed: int,
) -> dict:
    con.execute("UPDATE images SET split = NULL")
    for image_id, split in assignment.items():
        con.execute("UPDATE images SET split = ? WHERE id = ?", (split, image_id))

    counts = dict(Counter(assignment.values()))
    by_source = list(
        con.execute(
            """
            SELECT source, split, COUNT(*) AS c
            FROM images
            WHERE is_valid_image = 1 AND split IS NOT NULL
            GROUP BY source, split
            ORDER BY source, split
            """
        )
    )
    excluded = con.execute(
        "SELECT COUNT(*) FROM images WHERE is_valid_image = 0"
    ).fetchone()[0]
    unassigned = con.execute(
        "SELECT COUNT(*) FROM images WHERE is_valid_image = 1 AND split IS NULL"
    ).fetchone()[0]

    meta = {
        "assigned_at_utc": datetime.now(timezone.utc).isoformat(),
        "seed": seed,
        "ratios": ratios,
        "counts": counts,
        "excluded_invalid": excluded,
        "unassigned_valid": unassigned,
        "by_source": [
            {"source": s, "split": sp, "count": c} for s, sp, c in by_source
        ],
        "method": "stratified_by_source_v1",
    }
    con.execute(
        """
        INSERT INTO dataset_metadata(key, value) VALUES('split_status', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """,
        (json.dumps(meta),),
    )
    return meta


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--db",
        type=Path,
        default=Path.home() / "Downloads" / "maine_coon_dataset.db",
    )
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--train", type=float, default=DEFAULT_RATIOS["train"])
    parser.add_argument("--validation", type=float, default=DEFAULT_RATIOS["validation"])
    parser.add_argument("--test", type=float, default=DEFAULT_RATIOS["test"])
    parser.add_argument("--apply", action="store_true", help="Write splits into the DB")
    parser.add_argument(
        "--include-needs-review",
        action="store_true",
        help="Include rows still marked needs_manual_review (default: exclude them)",
    )
    args = parser.parse_args()
    ratios = {
        "train": args.train,
        "validation": args.validation,
        "test": args.test,
    }

    con = sqlite3.connect(args.db)
    con.row_factory = sqlite3.Row

    query = """
        SELECT id, source
        FROM images
        WHERE is_valid_image = 1
    """
    if not args.include_needs_review:
        query += " AND needs_manual_review = 0"
    rows = list(con.execute(query + " ORDER BY id"))

    assignment = stratified_assign(rows, ratios, args.seed)
    preview = {
        "eligible": len(rows),
        "assigned": len(assignment),
        "counts": dict(Counter(assignment.values())),
        "by_source_preview": {},
    }
    tmp: dict[str, Counter] = defaultdict(Counter)
    id_to_source = {r["id"]: r["source"] for r in rows}
    for image_id, split in assignment.items():
        tmp[id_to_source[image_id]][split] += 1
    preview["by_source_preview"] = {s: dict(c) for s, c in tmp.items()}

    if args.apply:
        meta = apply_splits(con, assignment, ratios, args.seed)
        con.commit()
        print(json.dumps(meta, indent=2))
        print("applied splits to DB")
    else:
        print(json.dumps(preview, indent=2))
        print("(dry-run; pass --apply to write)")

    con.close()


if __name__ == "__main__":
    main()
