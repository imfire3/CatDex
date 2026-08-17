#!/usr/bin/env python3
"""Import Maine Coon image URLs from a Google Images Excel scrape into the dataset DB."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

URL_RE = re.compile(r"https?://[^\s\"'<>]+")
SOURCE = "Google Images scrape (IMG TRAIN MAINCOON)"
CLASS_NAME = "Maine Coon"
CLASS_SLUG = "maine_coon"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def extract_urls_from_xlsx(path: Path) -> list[str]:
    import openpyxl

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    urls: list[str] = []
    seen: set[str] = set()
    try:
        for sheet in wb.worksheets:
            for row in sheet.iter_rows(values_only=True):
                for cell in row:
                    if cell is None:
                        continue
                    for match in URL_RE.findall(str(cell)):
                        url = match.rstrip(".,);]")
                        if url not in seen:
                            seen.add(url)
                            urls.append(url)
    finally:
        wb.close()
    return urls


def download(url: str, dest: Path, timeout: float = 20.0) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        data = response.read()
    dest.write_bytes(data)
    return data


def inspect_image(path: Path) -> dict:
    with Image.open(path) as im:
        im.load()
        width, height = im.size
        fmt = (im.format or "JPEG").lower()
    raw = path.read_bytes()
    return {
        "width": width,
        "height": height,
        "format": fmt,
        "byte_size": len(raw),
        "sha256": hashlib.sha256(raw).hexdigest(),
        "is_valid_image": 1,
        "needs_manual_review": 1 if min(width, height) < 200 else 0,
        "label_confidence": 0.72 if min(width, height) < 200 else 0.8,
        "confidence_method": "provenance_quality_heuristic_v1",
        "confidence_reason": (
            "Label issu du scrape Google Images Maine Coon; "
            + (
                "faible résolution"
                if min(width, height) < 200
                else "résolution modeste (thumbnail)"
            )
        ),
    }


def ensure_schema(con: sqlite3.Connection) -> None:
    cols = {row[1] for row in con.execute("PRAGMA table_info(images)")}
    if "source_url" not in cols:
        con.execute("ALTER TABLE images ADD COLUMN source_url TEXT")


def existing_hashes(con: sqlite3.Connection) -> set[str]:
    return {row[0] for row in con.execute("SELECT sha256 FROM images")}


def insert_image(con: sqlite3.Connection, row: dict) -> None:
    con.execute(
        """
        INSERT INTO images (
          filename, absolute_path, class_name, class_slug, split, source,
          width, height, format, byte_size, sha256, label_confidence,
          confidence_method, confidence_reason, needs_manual_review, is_valid_image,
          source_url
        ) VALUES (
          :filename, :absolute_path, :class_name, :class_slug, NULL, :source,
          :width, :height, :format, :byte_size, :sha256, :label_confidence,
          :confidence_method, :confidence_reason, :needs_manual_review, :is_valid_image,
          :source_url
        )
        """,
        row,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--xlsx", type=Path, required=True)
    parser.add_argument(
        "--db",
        type=Path,
        default=Path.home() / "Downloads" / "maine_coon_dataset.db",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=Path.home()
        / "Downloads"
        / "Gano-Cat-Breeds-V1_1"
        / "Maine Coon"
        / "_google_train",
    )
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--sleep", type=float, default=0.15)
    args = parser.parse_args()

    urls = extract_urls_from_xlsx(args.xlsx)
    args.out_dir.mkdir(parents=True, exist_ok=True)

    report = {
        "xlsx": str(args.xlsx),
        "urls": len(urls),
        "downloaded": 0,
        "inserted": 0,
        "duplicates": 0,
        "failed": [],
        "files": [],
    }

    con = sqlite3.connect(args.db)
    con.row_factory = sqlite3.Row
    ensure_schema(con)
    hashes = existing_hashes(con)

    for index, url in enumerate(urls, start=1):
        filename = f"google_maine_coon_{index:03d}.jpg"
        dest = args.out_dir / filename
        try:
            if not dest.exists():
                download(url, dest)
                time.sleep(args.sleep)
            meta = inspect_image(dest)
            report["downloaded"] += 1
            if meta["sha256"] in hashes:
                report["duplicates"] += 1
                report["files"].append(
                    {"filename": filename, "status": "duplicate", "url": url}
                )
                continue
            row = {
                "filename": filename,
                "absolute_path": str(dest.resolve()),
                "class_name": CLASS_NAME,
                "class_slug": CLASS_SLUG,
                "source": SOURCE,
                "source_url": url,
                **meta,
            }
            report["files"].append(
                {
                    "filename": filename,
                    "status": "ok",
                    "url": url,
                    "width": meta["width"],
                    "height": meta["height"],
                }
            )
            if args.apply:
                insert_image(con, row)
                hashes.add(meta["sha256"])
                report["inserted"] += 1
        except (urllib.error.URLError, OSError, ValueError) as exc:
            report["failed"].append({"url": url, "error": str(exc)})
            if dest.exists():
                dest.unlink(missing_ok=True)

    if args.apply:
        con.execute(
            """
            INSERT INTO dataset_metadata(key, value) VALUES('google_xlsx_import', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            (
                json.dumps(
                    {
                        "imported_at_utc": datetime.now(timezone.utc).isoformat(),
                        "xlsx": args.xlsx.name,
                        "urls": report["urls"],
                        "inserted": report["inserted"],
                        "duplicates": report["duplicates"],
                        "failed": len(report["failed"]),
                        "source": SOURCE,
                    }
                ),
            ),
        )
        # Mark splits stale so assign_splits can be re-run.
        con.execute(
            """
            INSERT INTO dataset_metadata(key, value) VALUES('split_status', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            ("Needs reassignment after Google Images import",),
        )
        con.commit()

    report_path = args.out_dir / "import_report.json"
    report_path.write_text(json.dumps(report, indent=2))
    print(
        json.dumps(
            {
                k: report[k]
                for k in ("urls", "downloaded", "inserted", "duplicates", "failed")
            },
            indent=2,
            default=str,
        )
    )
    print(f"report: {report_path}")
    if not args.apply:
        print("(dry-run; pass --apply to write DB rows)")
    con.close()


if __name__ == "__main__":
    main()
