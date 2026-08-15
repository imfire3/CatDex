#!/usr/bin/env python3
"""Verify needs_manual_review images and update the Maine Coon SQLite dataset."""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

MIN_SIDE_PX = 128
MIN_BYTES = 3000


def verify_row(row: sqlite3.Row) -> dict:
    path = Path(row["absolute_path"])
    result = {
        "id": row["id"],
        "filename": row["filename"],
        "path": str(path),
        "exists": path.exists(),
        "db_w": row["width"],
        "db_h": row["height"],
        "db_bytes": row["byte_size"],
        "db_sha": row["sha256"],
        "confidence": row["label_confidence"],
        "reason": row["confidence_reason"],
        "source": row["source"],
    }
    if not path.exists():
        result.update(status="missing", decision="exclude", issues=["missing"])
        return result

    try:
        with Image.open(path) as im:
            im.load()
            width, height = im.size
            fmt = (im.format or "").lower()
            mode = im.mode
        raw = path.read_bytes()
        sha = hashlib.sha256(raw).hexdigest()
        aspect = round(width / height, 3) if height else None
        issues: list[str] = []
        if width != row["width"] or height != row["height"]:
            issues.append("dim_mismatch")
        if sha != row["sha256"]:
            issues.append("sha_mismatch")
        if min(width, height) < MIN_SIDE_PX:
            issues.append("too_small")
        if len(raw) < MIN_BYTES:
            issues.append("tiny_file")
        if aspect is not None and (aspect < 0.35 or aspect > 2.8):
            issues.append("extreme_aspect")

        hard = {"dim_mismatch", "sha_mismatch", "too_small", "extreme_aspect"}
        decision = "exclude" if any(i in hard for i in issues) else "keep"
        result.update(
            status="warn" if issues else "ok",
            decision=decision,
            issues=issues,
            actual_w=width,
            actual_h=height,
            actual_fmt=fmt,
            mode=mode,
            actual_bytes=len(raw),
            actual_sha=sha,
            aspect=aspect,
        )
    except Exception as exc:  # noqa: BLE001 — surface decode failures in report
        result.update(
            status="corrupt",
            decision="exclude",
            issues=["corrupt"],
            error=str(exc),
        )
    return result


def _strip_review_suffix(reason: str) -> str:
    for marker in ("; review_pass_v1", "; review_exclude_v1:"):
        if marker in reason:
            reason = reason.split(marker, 1)[0]
    return reason


def apply_decisions(con: sqlite3.Connection, results: list[dict]) -> None:
    for item in results:
        row = con.execute(
            "SELECT confidence_reason FROM images WHERE id = ?", (item["id"],)
        ).fetchone()
        base = _strip_review_suffix(row["confidence_reason"] if row else "")
        if item["decision"] == "keep":
            con.execute(
                """
                UPDATE images
                SET needs_manual_review = 0,
                    is_valid_image = 1,
                    confidence_reason = ?
                WHERE id = ?
                """,
                (f"{base}; review_pass_v1", item["id"]),
            )
        else:
            issues = ",".join(item.get("issues") or ["unknown"])
            con.execute(
                """
                UPDATE images
                SET needs_manual_review = 0,
                    is_valid_image = 0,
                    confidence_reason = ?
                WHERE id = ?
                """,
                (f"{base}; review_exclude_v1:{issues}", item["id"]),
            )
    con.execute(
        """
        INSERT INTO dataset_metadata(key, value) VALUES('flagged_review_status', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """,
        (
            json.dumps(
                {
                    "reviewed_at_utc": datetime.now(timezone.utc).isoformat(),
                    "method": "decode_dim_sha_min_side_v1",
                    "min_side_px": MIN_SIDE_PX,
                    "kept": sum(1 for r in results if r["decision"] == "keep"),
                    "excluded": sum(1 for r in results if r["decision"] == "exclude"),
                }
            ),
        ),
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--db",
        type=Path,
        default=Path.home() / "Downloads" / "maine_coon_dataset.db",
    )
    parser.add_argument(
        "--report-dir",
        type=Path,
        default=None,
        help="Directory for JSON report + contact sheet (default: <images>/_flagged_review)",
    )
    parser.add_argument("--apply", action="store_true", help="Write decisions into the DB")
    parser.add_argument("--contact-sheet", action="store_true", help="Write thumbnail grid")
    args = parser.parse_args()

    con = sqlite3.connect(args.db)
    con.row_factory = sqlite3.Row
    flagged = list(
        con.execute("SELECT * FROM images WHERE needs_manual_review = 1 ORDER BY id")
    )
    results = [verify_row(row) for row in flagged]

    report_dir = args.report_dir
    if report_dir is None and flagged:
        report_dir = Path(flagged[0]["absolute_path"]).parent / "_flagged_review"
    if report_dir is None:
        report_dir = args.db.parent / "_flagged_review"
    report_dir.mkdir(parents=True, exist_ok=True)

    report = {
        "verified_at_utc": datetime.now(timezone.utc).isoformat(),
        "db": str(args.db),
        "total_flagged": len(results),
        "decisions": dict(Counter(r["decision"] for r in results)),
        "status": dict(Counter(r["status"] for r in results)),
        "issue_counts": dict(Counter(i for r in results for i in r.get("issues", []))),
        "results": results,
    }
    report_path = report_dir / "flagged_verification_report.json"
    report_path.write_text(json.dumps(report, indent=2))

    if args.contact_sheet and flagged:
        cols, thumb = 8, 128
        rows_n = (len(flagged) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * thumb, rows_n * thumb), (30, 30, 30))
        for i, row in enumerate(flagged):
            path = Path(row["absolute_path"])
            x, y = (i % cols) * thumb, (i // cols) * thumb
            try:
                with Image.open(path) as im:
                    im = im.convert("RGB")
                    im.thumbnail((thumb, thumb))
                    sheet.paste(
                        im,
                        (x + (thumb - im.width) // 2, y + (thumb - im.height) // 2),
                    )
            except Exception:
                continue
        sheet.save(report_dir / "flagged_contact_sheet.jpg", quality=85)

    if args.apply:
        apply_decisions(con, results)
        con.commit()

    print(json.dumps({k: report[k] for k in ("total_flagged", "decisions", "status", "issue_counts")}, indent=2))
    print(f"report: {report_path}")
    if args.apply:
        print("applied decisions to DB")
    con.close()


if __name__ == "__main__":
    main()
