#!/usr/bin/env python3
"""Convert a fetched Notion textbook page into split, public-safe site data."""

from __future__ import annotations

import argparse
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import sys
from typing import Any, Iterable


PAGE_ID_DEFAULT = "39902e78-962a-8051-8275-d4d91a78e607"
HEADING_RE = re.compile(r"^(#{1,4})\s+(.+?)\s*$")
IMAGE_RE = re.compile(r"!\[([^\]]*)\]\((https?://[^)]+)\)")
FENCE_RE = re.compile(r"^\s*```\s*([^`]*)$")
UL_RE = re.compile(r"^\s*[-+*]\s+(.+)$")
OL_RE = re.compile(r"^\s*\d+[.)]\s+(.+)$")
LINK_RE = re.compile(r"\[([^\]]+)\]\((?:https?://|/)[^)]+\)")
RAW_URL_RE = re.compile(r"https?://\S+", re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>")
MARK_RE = re.compile(r"(?<!\\)(?:\*\*|__|~~|`)")
SENSITIVE_RE = re.compile(
    r"x-amz-|security-token|amazonaws\.com|<ancestor-path|<properties|<mention-page|personal space",
    re.IGNORECASE,
)


SUBJECTS = {
    "1": ("subject-01", "공유압 및 자동제어", "공유압·제어"),
    "2": ("subject-02", "용접 및 안전관리", "용접·안전"),
    "3": ("subject-03", "기계설계 일반", "기계설계"),
    "4": ("subject-04", "설비진단 및 관리", "진단·관리"),
}

CHAPTERS = {
    "chapter-01": "공유압",
    "chapter-02": "전기·전자 장치",
    "chapter-03": "센서",
    "chapter-04": "모터제어",
    "chapter-05": "공정제어",
    "chapter-06": "용접 일반",
    "chapter-07": "용접 시공",
    "chapter-08": "비파괴검사",
    "chapter-09": "안전관리",
    "chapter-10": "도면해독",
    "chapter-11": "기본측정기",
    "chapter-12": "기계가공",
    "chapter-13": "기계재료",
    "chapter-14": "구동장치 조립",
    "chapter-15": "기계장치 보전",
    "chapter-16": "진동·소음",
    "chapter-17": "설비관리계획",
    "chapter-18": "TPM·OEE",
    "chapter-19": "윤활관리",
}


def canonical(value: str) -> str:
    return re.sub(r"[^0-9a-z가-힣]+", "", value.casefold())


def clean_inline(value: str) -> str:
    value = IMAGE_RE.sub(lambda match: match.group(1), value)
    value = LINK_RE.sub(lambda match: match.group(1), value)
    # Remove Notion's inline XML-like tags before stripping raw URLs. A signed
    # URL can otherwise consume the closing `/>` and leave a partial tag such
    # as `<mention-page url="` in the public text.
    value = TAG_RE.sub("", value)
    value = RAW_URL_RE.sub("", value)
    value = MARK_RE.sub("", value)
    value = value.replace("\\~", "~").replace("\\*", "*").replace("\\_", "_")
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def normalize_search(value: str) -> str:
    return re.sub(r"\s+", "", value.casefold())


def stable_id(page_id: str, path: list[str], occurrence: int, segment_kind: str) -> str:
    key = f"{page_id}|{'/'.join(canonical(item) for item in path)}|{occurrence}|{segment_kind}"
    return "notion-" + hashlib.sha256(key.encode("utf-8")).hexdigest()[:16]


def extract_content(raw: str) -> str:
    start_marker = "<content>"
    end_marker = "</content>"
    start = raw.find(start_marker)
    end = raw.rfind(end_marker)
    if start < 0 or end < 0 or end <= start:
        raise ValueError("The fetched Notion wrapper does not contain a complete <content> block")
    return raw[start + len(start_marker) : end].strip("\r\n")


class TableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.rows: list[list[str]] = []
        self.headers: list[str] = []
        self.caption = ""
        self._row: list[str] | None = None
        self._cell: list[str] | None = None
        self._cell_is_header = False
        self._caption_parts: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        del attrs
        tag = tag.lower()
        if tag == "tr":
            self._row = []
        elif tag in {"th", "td"}:
            self._cell = []
            self._cell_is_header = tag == "th"
        elif tag == "caption":
            self._caption_parts = []
        elif tag == "br" and self._cell is not None:
            self._cell.append(" ")

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"th", "td"} and self._cell is not None:
            text = clean_inline("".join(self._cell))
            if self._row is None:
                self._row = []
            self._row.append(text)
            if self._cell_is_header:
                self.headers.append(text)
            self._cell = None
        elif tag == "tr" and self._row is not None:
            if any(cell for cell in self._row):
                self.rows.append(self._row)
            self._row = None
        elif tag == "caption" and self._caption_parts is not None:
            self.caption = clean_inline("".join(self._caption_parts))
            self._caption_parts = None

    def handle_data(self, data: str) -> None:
        if self._cell is not None:
            self._cell.append(data)
        if self._caption_parts is not None:
            self._caption_parts.append(data)


def parse_table(raw_html: str) -> dict[str, Any]:
    parser = TableParser()
    parser.feed(raw_html)
    rows = parser.rows
    headers: list[str] | None = None
    if rows and parser.headers and len(parser.headers) >= len(rows[0]):
        headers = rows[0]
        rows = rows[1:]
    return {
        "type": "table",
        **({"headers": headers} if headers else {}),
        "rows": rows,
        **({"caption": parser.caption} if parser.caption else {}),
    }


def parse_blocks(lines: list[str]) -> tuple[list[dict[str, Any]], str]:
    blocks: list[dict[str, Any]] = []
    plain_parts: list[str] = []
    paragraph: list[str] = []
    index = 0

    def flush_paragraph() -> None:
        if not paragraph:
            return
        text = clean_inline(" ".join(paragraph))
        paragraph.clear()
        if text:
            blocks.append({"type": "paragraph", "text": text})
            plain_parts.append(text)

    while index < len(lines):
        line = lines[index]
        stripped = line.strip()

        if not stripped:
            flush_paragraph()
            index += 1
            continue

        fence = FENCE_RE.match(line)
        if fence:
            flush_paragraph()
            language = clean_inline(fence.group(1))
            index += 1
            code_lines: list[str] = []
            while index < len(lines) and not FENCE_RE.match(lines[index]):
                code_lines.append(lines[index])
                index += 1
            if index < len(lines):
                index += 1
            code = "\n".join(code_lines)
            if code:
                blocks.append({"type": "code", "text": code, **({"language": language} if language else {})})
                plain_parts.append(code)
            continue

        if "<table" in stripped.lower():
            flush_paragraph()
            table_lines = [line]
            while "</table>" not in table_lines[-1].lower() and index + 1 < len(lines):
                index += 1
                table_lines.append(lines[index])
            table = parse_table("\n".join(table_lines))
            blocks.append(table)
            plain_parts.extend(cell for row in table["rows"] for cell in row)
            plain_parts.extend(table.get("headers", []))
            index += 1
            continue

        images = list(IMAGE_RE.finditer(line))
        if images:
            flush_paragraph()
            for image_match in images:
                alt = clean_inline(image_match.group(1)) or "Notion 원문 이미지"
                blocks.append({
                    "type": "image",
                    "src": "",
                    "alt": alt,
                    "caption": alt,
                    "rightsStatus": "unknown",
                })
                plain_parts.append(alt)
            remainder = clean_inline(IMAGE_RE.sub("", line))
            if remainder:
                blocks.append({"type": "paragraph", "text": remainder})
                plain_parts.append(remainder)
            index += 1
            continue

        if stripped in {"---", "***", "___"}:
            flush_paragraph()
            blocks.append({"type": "divider"})
            index += 1
            continue

        if stripped.startswith(">"):
            flush_paragraph()
            quote_lines: list[str] = []
            while index < len(lines) and lines[index].strip().startswith(">"):
                quote_lines.append(lines[index].strip().lstrip(">").strip())
                index += 1
            text = clean_inline(" ".join(quote_lines))
            if text:
                block_type = "callout" if re.match(r"^[^\w가-힣]", text) else "quote"
                blocks.append({"type": block_type, "text": text})
                plain_parts.append(text)
            continue

        unordered = UL_RE.match(line)
        ordered = OL_RE.match(line)
        if unordered or ordered:
            flush_paragraph()
            is_ordered = ordered is not None
            items: list[str] = []
            pattern = OL_RE if is_ordered else UL_RE
            while index < len(lines):
                match = pattern.match(lines[index])
                if not match:
                    break
                item = clean_inline(match.group(1))
                if item:
                    items.append(item)
                    plain_parts.append(item)
                index += 1
            if items:
                blocks.append({"type": "list", "items": items, "ordered": is_ordered})
            continue

        text = clean_inline(line)
        if text:
            paragraph.append(text)
        index += 1

    flush_paragraph()
    plain_text = re.sub(r"\s+", " ", " ".join(plain_parts)).strip()
    return blocks, plain_text


def split_segments(content: str) -> tuple[list[dict[str, Any]], dict[str, int]]:
    lines = content.splitlines()
    segments: list[dict[str, Any]] = []
    stack: dict[int, str] = {}
    current: dict[str, Any] | None = {
        "level": 0,
        "title": "문서 안내",
        "path": ["문서 안내"],
        "body": [],
        "source_lines": [],
        "heading_line": None,
    }
    in_fence = False
    heading_counts = {"h1": 0, "h2": 0, "h3": 0, "h4": 0}

    def flush() -> None:
        nonlocal current
        if current is not None:
            segments.append(current)

    for line_index, line in enumerate(lines):
        if FENCE_RE.match(line):
            in_fence = not in_fence
        heading = None if in_fence else HEADING_RE.match(line)
        if heading:
            flush()
            level = len(heading.group(1))
            title = clean_inline(heading.group(2)) or f"제목 {line_index + 1}"
            heading_counts[f"h{level}"] += 1
            stack[level] = title
            for deeper in range(level + 1, 5):
                stack.pop(deeper, None)
            path = [stack[item] for item in sorted(stack)]
            current = {
                "level": level,
                "title": title,
                "path": path,
                "body": [],
                "source_lines": [line_index],
                "heading_line": line_index,
            }
        else:
            assert current is not None
            current["body"].append(line)
            current["source_lines"].append(line_index)
    flush()

    all_assigned = [line for segment in segments for line in segment["source_lines"]]
    if len(all_assigned) != len(lines) or sorted(all_assigned) != list(range(len(lines))):
        raise ValueError("Source line assignment is incomplete or duplicated")
    return segments, heading_counts


def parse_number(title: str, unit: str) -> int | None:
    match = re.search(rf"제\s*(\d+)\s*{unit}", title)
    return int(match.group(1)) if match else None


def dynamic_id(prefix: str, title: str) -> str:
    return f"{prefix}-" + hashlib.sha256(canonical(title).encode("utf-8")).hexdigest()[:10]


def resolve_location(segment: dict[str, Any]) -> tuple[tuple[str, str, str], tuple[str, str], list[str]]:
    path: list[str] = segment["path"]
    h1 = next((item for item in path if re.search(r"제\s*[1-4]\s*편", item)), None)
    part = parse_number(h1 or "", "편")
    h2 = path[1] if len(path) > 1 and h1 == path[0] else next(
        (item for item in path if item != h1 and ("제" in item and "장" in item)),
        None,
    )
    h3 = path[2] if len(path) > 2 and h1 == path[0] else None
    chapter_number = parse_number(h2 or "", "장")

    if part in {1, 2, 3, 4}:
        subject = SUBJECTS[str(part)]
        chapter_id: str | None = None
        if part == 1 and chapter_number and 1 <= chapter_number <= 5:
            chapter_id = f"chapter-{chapter_number:02d}"
        elif part == 2:
            if chapter_number == 1:
                chapter_id = "chapter-06"
            elif chapter_number == 2:
                h3_number = re.match(r"\s*(\d+)[.)]", h3 or "")
                if h3_number and h3_number.group(1) == "3":
                    chapter_id = "chapter-08"
                elif h3_number and h3_number.group(1) == "4":
                    chapter_id = "chapter-09"
                else:
                    chapter_id = "chapter-07"
        elif part == 3 and chapter_number and 1 <= chapter_number <= 6:
            chapter_id = f"chapter-{chapter_number + 9:02d}"
        elif part == 4 and chapter_number:
            if 1 <= chapter_number <= 3:
                chapter_id = f"chapter-{chapter_number + 15:02d}"
            elif 4 <= chapter_number <= 6:
                chapter_id = "chapter-19"

        if chapter_id:
            chapter = (chapter_id, CHAPTERS[chapter_id])
            chapter_heading_index = next(
                (index for index, item in enumerate(path) if parse_number(item, "장") == chapter_number),
                0,
            )
            parents = path[chapter_heading_index + 1 : -1]
            return subject, chapter, parents

        if segment["level"] == 1:
            chapter = (f"{subject[0]}-overview", "과목 개요")
            return subject, chapter, []

        source_title = h2 or segment["title"]
        appendix_subject = ("subject-appendix", "부록·출처", "부록")
        chapter = (dynamic_id("appendix", f"{subject[0]}-{source_title}"), source_title)
        parents = path[path.index(source_title) + 1 : -1] if source_title in path else path[:-1]
        return appendix_subject, chapter, parents

    intro_subject = ("subject-intro", "이용 안내·전체 목차", "안내")
    chapter_title = path[1] if len(path) > 1 else path[0]
    chapter = (dynamic_id("intro", chapter_title), chapter_title)
    parents = path[path.index(chapter_title) + 1 : -1] if chapter_title in path else []
    return intro_subject, chapter, parents


def tags_for(title: str, path: Iterable[str]) -> list[str]:
    tokens: list[str] = []
    for value in [title, *path]:
        for token in re.findall(r"[A-Za-z][A-Za-z0-9+-]{1,}|[가-힣]{2,}", value):
            if token not in tokens:
                tokens.append(token)
    return tokens[:12]


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")), encoding="utf-8")


def scan_public_json(paths: Iterable[Path]) -> list[str]:
    violations: list[str] = []
    for path in paths:
        text = path.read_text(encoding="utf-8")
        if SENSITIVE_RE.search(text):
            violations.append(str(path))
    return violations


def convert(project_root: Path, source: Path, manifest_path: Path, allow_noncanonical: bool) -> dict[str, Any]:
    raw = source.read_text(encoding="utf-8")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    page_id = str(manifest.get("pageId") or PAGE_ID_DEFAULT)
    fetched_at = str(manifest.get("fetchedAt") or "")
    reviewed_at = fetched_at[:10] if fetched_at else "2026-07-20"
    content = extract_content(raw)
    segments, heading_counts = split_segments(content)

    raw_heading_count = sum(heading_counts.values())
    raw_table_count = len(re.findall(r"<table\b", content, re.IGNORECASE))
    raw_image_count = len(IMAGE_RE.findall(content))
    if not allow_noncanonical and (raw_heading_count, raw_table_count, raw_image_count) != (556, 49, 125):
        raise ValueError(
            f"Canonical source counts changed: headings={raw_heading_count}, tables={raw_table_count}, images={raw_image_count}"
        )

    occurrences: dict[str, int] = {}
    subjects_order: list[str] = []
    subjects_by_id: dict[str, dict[str, Any]] = {}
    topic_payloads: list[tuple[dict[str, Any], dict[str, Any]]] = []
    search_topics: list[dict[str, str]] = []
    emitted_body_chars = 0
    skipped_empty_overviews = 0
    skipped_empty_leaf_categories = 0
    pending_leaf_category: tuple[tuple[str, ...], str] | None = None

    for segment in segments:
        body_raw = "\n".join(segment["body"])
        is_leaf = segment["level"] == 4
        if not is_leaf and not body_raw.strip():
            skipped_empty_overviews += 1
            pending_leaf_category = None
            continue
        path: list[str] = segment["path"]
        parent_path = tuple(path[:-1])
        if is_leaf and not body_raw.strip():
            skipped_empty_leaf_categories += 1
            pending_leaf_category = (parent_path, segment["title"])
            continue

        inherited_leaf_category = ""
        if is_leaf and pending_leaf_category and pending_leaf_category[0] == parent_path:
            inherited_leaf_category = pending_leaf_category[1]
        pending_leaf_category = None

        segment_kind = "leaf" if is_leaf else "overview"
        semantic_path = [*path[:-1], inherited_leaf_category, path[-1]] if inherited_leaf_category else path
        occurrence_key = "/".join(canonical(item) for item in semantic_path)
        occurrence = occurrences.get(occurrence_key, 0)
        occurrences[occurrence_key] = occurrence + 1
        topic_id = stable_id(page_id, semantic_path, occurrence, segment_kind)
        blocks, plain_text = parse_blocks(segment["body"])
        emitted_body_chars += len(body_raw)
        subject_info, chapter_info, category_path = resolve_location(segment)
        if inherited_leaf_category:
            category_path = [*category_path, inherited_leaf_category]
        subject_id, subject_title, short_title = subject_info
        chapter_id, chapter_title = chapter_info

        if subject_id not in subjects_by_id:
            subjects_order.append(subject_id)
            subjects_by_id[subject_id] = {
                "id": subject_id,
                "title": subject_title,
                "shortTitle": short_title,
                "chapters": [],
                "_chapters": {},
            }
        subject = subjects_by_id[subject_id]
        if chapter_id not in subject["_chapters"]:
            chapter = {"id": chapter_id, "title": chapter_title, "topics": []}
            subject["chapters"].append(chapter)
            subject["_chapters"][chapter_id] = chapter
        chapter = subject["_chapters"][chapter_id]

        # Keep the eagerly loaded catalog compact. The complete searchable text
        # and full body live in separately fetched public files.
        summary = plain_text[:120].strip()
        if not summary:
            summary = f"{segment['title']}의 원문 학습 항목입니다."
        logical_path = " › ".join(semantic_path)
        topic = {
            "id": topic_id,
            "title": segment["title"],
            "summary30s": summary,
            "categoryPath": category_path,
        }
        chapter["topics"].append(topic)
        payload = {
            "schemaVersion": 1,
            "id": topic_id,
            "title": segment["title"],
            "sourcePath": f"Notion page {page_id} › {logical_path}",
            "blocks": blocks,
        }
        topic_payloads.append((topic, payload))
        search_topics.append({
            "id": topic_id,
            "title": segment["title"],
            "normalizedText": normalize_search(" ".join([segment["title"], *semantic_path, plain_text])),
            "excerpt": plain_text[:240],
        })

    subjects: list[dict[str, Any]] = []
    preferred_order = ["subject-01", "subject-02", "subject-03", "subject-04", "subject-intro", "subject-appendix"]
    for subject_id in sorted(subjects_order, key=lambda item: preferred_order.index(item) if item in preferred_order else 99):
        subject = subjects_by_id[subject_id]
        subject.pop("_chapters", None)
        subjects.append(subject)

    topics_dir = project_root / "public" / "generated" / "topics"
    topics_dir.mkdir(parents=True, exist_ok=True)
    for old_topic in topics_dir.glob("*.json"):
        old_topic.unlink()
    for _topic, payload in topic_payloads:
        write_json(topics_dir / f"{payload['id']}.json", payload)

    catalog = {
        "schemaVersion": 1,
        "generatedFrom": [f"Notion page {page_id}"],
        "generatedAt": fetched_at or reviewed_at,
        "subjects": subjects,
        "stats": {
            "subjects": len(subjects),
            "chapters": sum(len(subject["chapters"]) for subject in subjects),
            "topics": len(topic_payloads),
            "headings": raw_heading_count,
            "tables": raw_table_count,
            "images": raw_image_count,
            "textCharacters": len(content),
        },
    }
    catalog_path = project_root / "app" / "generated" / "notion-catalog.json"
    search_path = project_root / "public" / "generated" / "search-index.json"
    write_json(catalog_path, catalog)
    write_json(search_path, {"schemaVersion": 1, "topics": search_topics})

    public_json_paths = [catalog_path, search_path, *topics_dir.glob("*.json")]
    security_violations = scan_public_json(public_json_paths)
    payload_table_count = sum(
        1 for _topic, payload in topic_payloads for block in payload["blocks"] if block["type"] == "table"
    )
    payload_image_count = sum(
        1 for _topic, payload in topic_payloads for block in payload["blocks"] if block["type"] == "image"
    )
    unique_ids = len({payload["id"] for _topic, payload in topic_payloads})
    source_body_chars = sum(len("\n".join(segment["body"])) for segment in segments if segment["body"])
    report = {
        "schemaVersion": 1,
        "source": f"Notion page {page_id}",
        "counts": {
            "sourceCharacters": len(content),
            "sourceBodyCharacters": source_body_chars,
            "emittedBodyCharacters": emitted_body_chars,
            "headings": raw_heading_count,
            **heading_counts,
            "tables": raw_table_count,
            "images": raw_image_count,
            "topics": len(topic_payloads),
            "topicJsonFiles": len(list(topics_dir.glob("*.json"))),
            "searchEntries": len(search_topics),
            "subjects": len(subjects),
            "chapters": catalog["stats"]["chapters"],
            "skippedEmptyOverviews": skipped_empty_overviews,
            "skippedEmptyLeafCategories": skipped_empty_leaf_categories,
        },
        "checks": {
            "uniqueTopicIds": unique_ids == len(topic_payloads),
            "topicFileParity": len(list(topics_dir.glob("*.json"))) == len(topic_payloads),
            "searchParity": len(search_topics) == len(topic_payloads),
            "tableParity": payload_table_count == raw_table_count,
            "imageParity": payload_image_count == raw_image_count,
            "bodyCoverageMatched": emitted_body_chars == source_body_chars,
            "securityViolations": security_violations,
            "unknownRightsPublicAssets": 0,
        },
    }
    report_path = project_root / "work" / "notion-import-report.json"
    write_json(report_path, report)

    required_checks = [
        report["checks"]["uniqueTopicIds"],
        report["checks"]["topicFileParity"],
        report["checks"]["searchParity"],
        report["checks"]["tableParity"],
        report["checks"]["imageParity"],
        report["checks"]["bodyCoverageMatched"],
        not security_violations,
        allow_noncanonical or len(topic_payloads) == 420,
    ]
    if not all(required_checks):
        raise ValueError(f"Import validation failed; inspect {report_path}")
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--source", type=Path, default=Path("work/notion-source/main.md"))
    parser.add_argument("--manifest", type=Path, default=Path("work/notion-source/source-manifest.json"))
    parser.add_argument("--allow-noncanonical", action="store_true")
    args = parser.parse_args()
    project_root = args.project_root.resolve()
    source = args.source if args.source.is_absolute() else project_root / args.source
    manifest = args.manifest if args.manifest.is_absolute() else project_root / args.manifest
    try:
        report = convert(project_root, source.resolve(), manifest.resolve(), args.allow_noncanonical)
    except Exception as error:  # noqa: BLE001 - CLI must fail closed with a concise reason.
        print(f"Notion import failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
