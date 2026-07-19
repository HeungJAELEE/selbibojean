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
import struct
import sys
from typing import Any, Iterable
from urllib.parse import unquote, urlsplit, urlunsplit


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
CORE_H4_RE = re.compile(
    r"^\s*(?!(?:19|20)\d{2}\b)(?:\d+(?:\.\d+)+(?:[.)])?|\d+[.)])\s+"
)
SUPPLEMENT_H4_RE = re.compile(
    r"^\s*(?:[★☆📷]|NCS\b|최근\s*기출|(?:19|20)\d{2}\s*기출|기출\s*(?:연결|예상)|웹\s*실사)",
    re.IGNORECASE,
)
PART_RE = re.compile(r"제\s*[1-4]\s*편")
CHAPTER_RE = re.compile(r"제\s*\d+\s*장")
CANONICAL_IMAGE_SET_SHA256 = "904fa66bbbb78d7b01f07a3e05e2f8982042a6b6054b3ec37154821e9a077f19"
IMAGE_MIME_EXTENSIONS = {
    "image/svg+xml": ".svg",
    "image/png": ".png",
    "image/jpeg": ".jpg",
}
SVG_ACTIVE_CONTENT_RE = re.compile(
    r"<\s*(?:script|foreignObject)\b|\son[a-z]+\s*=|javascript:|<!DOCTYPE|<!ENTITY|"
    r"(?:href|xlink:href)\s*=\s*['\"]\s*(?:https?:|//)",
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
    value = re.sub(r"\$`([^`]+)`\$", r"\1", value)
    value = re.sub(r"\$([^$\n]+)\$", r"\1", value)
    # Remove Notion's inline XML-like tags before stripping raw URLs. A signed
    # URL can otherwise consume the closing `/>` and leave a partial tag such
    # as `<mention-page url="` in the public text.
    value = TAG_RE.sub("", value)
    value = RAW_URL_RE.sub("", value)
    value = MARK_RE.sub("", value)
    value = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"\1", value)
    value = value.replace("\\~", "~").replace("\\*", "*").replace("\\_", "_")
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def clean_formula(value: str) -> str:
    """Turn the small TeX subset in the source into readable plain math."""
    value = value.strip()
    for _ in range(6):
        updated = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"(\1)/(\2)", value)
        if updated == value:
            break
        value = updated
    value = re.sub(r"\\sqrt\{([^{}]+)\}", r"√(\1)", value)
    value = re.sub(r"\\(?:mathrm|text)\{([^{}]+)\}", r"\1", value)
    replacements = {
        r"\qquad": "    ", r"\quad": "  ", r"\,": " ", r"\;": " ",
        r"\left": "", r"\right": "", r"\times": "×", r"\propto": "∝",
        r"\Delta": "Δ", r"\sigma": "σ", r"\varepsilon": "ε", r"\tau": "τ",
        r"\eta": "η", r"\lambda": "λ", r"\mu": "μ", r"\rho": "ρ",
        r"\omega": "ω", r"\phi": "φ", r"\pi": "π", r"\approx": "≈",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    return re.sub(r"[ \t]+", " ", value).strip()


def normalize_search(value: str) -> str:
    return re.sub(r"\s+", "", value.casefold())


def canonical_image_url(value: str) -> str:
    parsed = urlsplit(value)
    return urlunsplit((parsed.scheme.lower(), parsed.netloc.lower(), parsed.path, "", ""))


def image_filename_label(value: str) -> str:
    filename = Path(unquote(urlsplit(value).path)).stem
    label = re.sub(r"[_-]+", " ", filename).strip()
    return label or "원문 참고 이미지"


def image_dimensions(path: Path, mime: str) -> tuple[int, int]:
    data = path.read_bytes()
    if mime == "image/png":
        if not data.startswith(b"\x89PNG\r\n\x1a\n") or len(data) < 24:
            raise ValueError(f"Invalid PNG signature: {path}")
        return struct.unpack(">II", data[16:24])
    if mime == "image/jpeg":
        if not data.startswith(b"\xff\xd8\xff"):
            raise ValueError(f"Invalid JPEG signature: {path}")
        cursor = 2
        while cursor + 9 < len(data):
            if data[cursor] != 0xFF:
                cursor += 1
                continue
            marker = data[cursor + 1]
            cursor += 2
            if marker in {0xD8, 0xD9}:
                continue
            if cursor + 2 > len(data):
                break
            segment_length = int.from_bytes(data[cursor:cursor + 2], "big")
            if segment_length < 2 or cursor + segment_length > len(data):
                break
            if marker in {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}:
                height = int.from_bytes(data[cursor + 3:cursor + 5], "big")
                width = int.from_bytes(data[cursor + 5:cursor + 7], "big")
                return width, height
            cursor += segment_length
        raise ValueError(f"JPEG dimensions were not found: {path}")
    if mime == "image/svg+xml":
        text = data.decode("utf-8-sig")
        if "<svg" not in text[:4096].lower() or SVG_ACTIVE_CONTENT_RE.search(text):
            raise ValueError(f"SVG is invalid or contains active/external content: {path}")
        view_box = re.search(
            r"\bviewBox\s*=\s*['\"]\s*[-+0-9.eE]+[ ,]+[-+0-9.eE]+[ ,]+([-+0-9.eE]+)[ ,]+([-+0-9.eE]+)\s*['\"]",
            text,
            re.IGNORECASE,
        )
        if view_box:
            return max(1, round(float(view_box.group(1)))), max(1, round(float(view_box.group(2))))
        width_match = re.search(r"\bwidth\s*=\s*['\"]\s*([0-9.]+)", text, re.IGNORECASE)
        height_match = re.search(r"\bheight\s*=\s*['\"]\s*([0-9.]+)", text, re.IGNORECASE)
        if width_match and height_match:
            return max(1, round(float(width_match.group(1)))), max(1, round(float(height_match.group(1))))
        raise ValueError(f"SVG dimensions were not found: {path}")
    raise ValueError(f"Unsupported image MIME type: {mime}")


def prepare_public_images(
    project_root: Path,
    source: Path,
    allow_noncanonical: bool,
) -> tuple[dict[str, dict[str, Any]], list[Path]]:
    image_map_path = source.parent / "image-map.json"
    if not image_map_path.is_file():
        raise ValueError(f"Image map is missing: {image_map_path}")
    raw_map = json.loads(image_map_path.read_text(encoding="utf-8"))
    if not isinstance(raw_map, dict):
        raise ValueError("Image map root must be an object")

    hashes = sorted(str(item.get("sha256") or "") for item in raw_map.values() if isinstance(item, dict))
    image_set_digest = hashlib.sha256("\n".join(hashes).encode("utf-8")).hexdigest()
    if not allow_noncanonical and image_set_digest != CANONICAL_IMAGE_SET_SHA256:
        raise ValueError("The source image set differs from the approved 125-image snapshot")

    source_root = source.parent.resolve()
    public_root = (project_root / "public" / "notion-images").resolve()
    expected_public_root = (project_root / "public").resolve()
    if not public_root.is_relative_to(expected_public_root):
        raise ValueError("Public image directory escaped the project public directory")
    public_root.mkdir(parents=True, exist_ok=True)

    assets: dict[str, dict[str, Any]] = {}
    public_paths: list[Path] = []
    expected_names: set[str] = set()
    for source_url, metadata in raw_map.items():
        if not isinstance(source_url, str) or not isinstance(metadata, dict):
            raise ValueError("Image map contains an invalid entry")
        sha256 = str(metadata.get("sha256") or "")
        mime = str(metadata.get("mime") or "")
        expected_bytes = metadata.get("bytes")
        local_path = str(metadata.get("localPath") or "")
        extension = IMAGE_MIME_EXTENSIONS.get(mime)
        if not re.fullmatch(r"[0-9a-f]{64}", sha256) or extension is None:
            raise ValueError(f"Image map contains an unapproved digest or MIME: {source_url}")

        asset_path = (source_root / local_path).resolve()
        if not asset_path.is_relative_to(source_root) or asset_path.is_symlink() or not asset_path.is_file():
            raise ValueError(f"Image asset path is invalid: {local_path}")
        data = asset_path.read_bytes()
        if expected_bytes != len(data) or hashlib.sha256(data).hexdigest() != sha256:
            raise ValueError(f"Image bytes or digest changed: {local_path}")
        if asset_path.suffix.lower() != extension:
            raise ValueError(f"Image extension does not match MIME: {local_path}")
        width, height = image_dimensions(asset_path, mime)
        if width > 20_000 or height > 20_000:
            raise ValueError(f"Image dimensions exceed the renderer limit: {local_path}")

        public_name = f"{sha256}{extension}"
        public_path = public_root / public_name
        shutil.copy2(asset_path, public_path)
        expected_names.add(public_name)
        public_paths.append(public_path)
        canonical_url = canonical_image_url(source_url)
        if canonical_url in assets:
            raise ValueError(f"Duplicate canonical image URL: {canonical_url}")
        assets[canonical_url] = {
            "src": f"/notion-images/{public_name}",
            "width": width,
            "height": height,
            "sha256": sha256,
        }

    for stale_path in public_root.iterdir():
        if stale_path.is_file() and stale_path.name not in expected_names:
            stale_path.unlink()
    if len(assets) != len(raw_map) or len(public_paths) != len(expected_names):
        raise ValueError("Image map, public files, and canonical URLs are not one-to-one")
    return assets, sorted(public_paths)


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
        self._header_row_requested = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag == "table":
            attributes = {name.lower(): (value or "") for name, value in attrs}
            self._header_row_requested = attributes.get("header-row", "").lower() == "true"
        elif tag == "tr":
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
    markdown_alignment_row = (
        len(rows) >= 2
        and len(rows[0]) == len(rows[1])
        and all(re.fullmatch(r":?-{3,}:?", cell.strip()) for cell in rows[1])
    )
    if markdown_alignment_row:
        headers = rows[0]
        rows = rows[2:]
    elif rows and (
        (parser.headers and len(parser.headers) >= len(rows[0]))
        or parser._header_row_requested
    ):
        headers = rows[0]
        rows = rows[1:]
    return {
        "type": "table",
        **({"headers": headers} if headers else {}),
        "rows": rows,
        **({"caption": parser.caption} if parser.caption else {}),
    }


def parse_blocks(
    lines: list[str],
    image_assets: dict[str, dict[str, Any]] | None = None,
    context_title: str = "",
) -> tuple[list[dict[str, Any]], str]:
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

        if stripped == "$$":
            flush_paragraph()
            index += 1
            formula_lines: list[str] = []
            while index < len(lines) and lines[index].strip() != "$$":
                formula_lines.append(lines[index])
                index += 1
            if index < len(lines):
                index += 1
            formula = clean_formula(" ".join(formula_lines))
            if formula:
                blocks.append({"type": "code", "text": formula, "language": "formula"})
                plain_parts.append(formula)
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
                source_url = image_match.group(2)
                canonical_url = canonical_image_url(source_url)
                asset = image_assets.get(canonical_url) if image_assets is not None else None
                if image_assets is not None and asset is None:
                    raise ValueError(f"Image asset is missing from the approved map: {canonical_url}")
                filename_label = image_filename_label(source_url)
                alt = clean_inline(image_match.group(1)) or clean_inline(context_title) or filename_label
                image_block: dict[str, Any] = {
                    "type": "image",
                    "src": asset["src"] if asset else "",
                    "alt": alt,
                    "caption": alt,
                    "rightsStatus": "cleared" if asset else "unknown",
                }
                if asset:
                    image_block["width"] = asset["width"]
                    image_block["height"] = asset["height"]
                blocks.append(image_block)
                plain_parts.append(alt)
            remainder = clean_inline(IMAGE_RE.sub("", line))
            if remainder:
                blocks.append({"type": "paragraph", "text": remainder})
                plain_parts.append(remainder)
            index += 1
            continue

        bold_heading = re.fullmatch(r"\s*\*\*([^*\n]{2,100})\*\*\s*", line)
        if bold_heading:
            flush_paragraph()
            heading_text = clean_inline(bold_heading.group(1))
            if heading_text:
                blocks.append({"type": "heading", "text": heading_text, "level": 5})
                plain_parts.append(heading_text)
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
    merged_blocks: list[dict[str, Any]] = []
    block_index = 0
    while block_index < len(blocks):
        block = blocks[block_index]
        if (
            block["type"] == "image"
            and block_index + 1 < len(blocks)
            and blocks[block_index + 1]["type"] in {"quote", "callout"}
            and len(blocks[block_index + 1].get("text", "")) <= 600
        ):
            caption = blocks[block_index + 1]["text"]
            block["caption"] = caption
            if block.get("alt") in {"", "Notion 원문 이미지"}:
                block["alt"] = clean_inline(context_title) or caption[:140]
            merged_blocks.append(block)
            block_index += 2
            continue
        merged_blocks.append(block)
        block_index += 1
    blocks = merged_blocks
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


def prepare_segment(
    segment: dict[str, Any],
    image_assets: dict[str, dict[str, Any]] | None = None,
) -> None:
    """Cache a segment's parsed representation without changing its source body."""
    if "_blocks" in segment:
        return
    blocks, plain_text = parse_blocks(
        segment["body"],
        image_assets=image_assets,
        context_title=segment["title"],
    )
    segment["_blocks"] = blocks
    segment["_plain_text"] = plain_text
    # Page-size decisions intentionally ignore whitespace and markup. This
    # avoids signed image URLs and HTML syntax distorting the textbook size.
    segment["_plain_chars"] = len(normalize_search(plain_text))
    segment["_body_raw"] = "\n".join(segment["body"])


def build_heading_tree(
    segments: list[dict[str, Any]],
    image_assets: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any]:
    root: dict[str, Any] = {"level": -1, "segment": None, "children": []}
    stack = [root]
    for index, segment in enumerate(segments):
        prepare_segment(segment, image_assets=image_assets)
        node = {
            "level": segment["level"],
            "segment": segment,
            "children": [],
            "source_index": index,
        }
        if segment["level"] == 0:
            # The connector preamble inside <content> is a document overview,
            # not a parent heading for the first H2.
            root["children"].append(node)
            continue
        while stack[-1]["level"] >= segment["level"]:
            stack.pop()
        stack[-1]["children"].append(node)
        stack.append(node)
    return root


def flatten_nodes(node: dict[str, Any]) -> list[dict[str, Any]]:
    nodes = [node]
    for child in node["children"]:
        nodes.extend(flatten_nodes(child))
    return nodes


def nodes_plain_chars(nodes: Iterable[dict[str, Any]]) -> int:
    return sum(node["segment"]["_plain_chars"] for node in nodes)


def is_h4_supplement(title: str) -> bool:
    """Return True for evidence/photo/practice headings attached to a core."""
    return bool(SUPPLEMENT_H4_RE.match(title))


def h4_bundles(h4_nodes: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    """Keep supplemental H4 sections with the preceding substantive H4.

    Leading supplements have no preceding core, so they are retained in source
    order and attached to the first following core. No source node is dropped.
    """
    bundles: list[list[dict[str, Any]]] = []
    leading: list[dict[str, Any]] = []
    for node in h4_nodes:
        title = node["segment"]["title"]
        explicit_core = bool(CORE_H4_RE.match(title))
        if is_h4_supplement(title) and not explicit_core:
            if bundles:
                bundles[-1].append(node)
            else:
                leading.append(node)
            continue
        bundle = [*leading, node]
        leading = []
        bundles.append(bundle)
    if leading:
        if bundles:
            bundles[-1].extend(leading)
        else:
            bundles.append(leading)
    return bundles


def bundle_core_title(bundle: list[dict[str, Any]]) -> str:
    for node in bundle:
        title = node["segment"]["title"]
        if not is_h4_supplement(title):
            return title
    return bundle[0]["segment"]["title"]


def cohesion_terms(value: str) -> set[str]:
    terms = set(re.findall(r"[A-Za-z][A-Za-z0-9+-]{2,}|[가-힣]{2,}", value.casefold()))
    for domain_term in {
        "베어링", "용접", "윤활", "공압", "유압", "밸브", "센서", "모터",
        "진동", "소음", "기어", "벨트", "체인", "측정", "검사", "안전",
    }:
        if domain_term in value:
            terms.add(domain_term)
    return terms


def partition_h4_bundles(
    bundles: list[list[dict[str, Any]]],
    preface_chars: int,
) -> list[list[list[dict[str, Any]]]]:
    """Partition an oversized H3 into readable, source-order chunks.

    The dynamic program targets about 4,500 normalized characters, accepts
    3,000-8,000 naturally, and only exceeds 8,000 to avoid breaking one
    indivisible microsection. A shared domain term discourages a cut.
    """
    if not bundles:
        return [[]]
    sizes = [nodes_plain_chars(bundle) for bundle in bundles]
    prefix = [0]
    for size in sizes:
        prefix.append(prefix[-1] + size)
    count = len(bundles)
    infinity = float("inf")
    costs = [infinity] * (count + 1)
    previous = [-1] * (count + 1)
    costs[0] = 0.0

    for end in range(1, count + 1):
        for start in range(end):
            size = prefix[end] - prefix[start] + (preface_chars if start == 0 else 0)
            single_bundle = end - start == 1
            if size > 12_000 and not single_bundle:
                continue
            deviation = (size - 4_500) / 4_500
            page_cost = deviation * deviation * 100
            if size < 3_000:
                page_cost += ((3_000 - size) / 3_000) * 120
            if size > 8_000:
                page_cost += ((size - 8_000) / 4_000) * 600
            if start > 0:
                left_terms = cohesion_terms(bundle_core_title(bundles[start - 1]))
                right_terms = cohesion_terms(bundle_core_title(bundles[start]))
                if left_terms & right_terms:
                    page_cost += 90
            candidate = costs[start] + page_cost
            if candidate < costs[end]:
                costs[end] = candidate
                previous[end] = start

    if previous[count] < 0:
        # This can only occur when a single source microsection is itself very
        # large. Keeping it whole is safer than splitting a table or image run.
        return [bundles]
    chunks: list[list[list[dict[str, Any]]]] = []
    cursor = count
    while cursor:
        start = previous[cursor]
        chunks.append(bundles[start:cursor])
        cursor = start
    chunks.reverse()
    return chunks


def build_topic_groups(
    segments: list[dict[str, Any]],
    image_assets: dict[str, dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """Turn the heading tree into human-sized textbook pages.

    H1/H2 are navigation, H3 is the normal page boundary, and H4 stays inside
    a page as an anchored heading. Intro/TOC/appendix subtrees are intentionally
    kept together. Every body-bearing source segment is assigned exactly once.
    """
    root = build_heading_tree(segments, image_assets=image_assets)
    groups: list[dict[str, Any]] = []
    assigned: set[int] = set()

    def add_group(
        anchor: dict[str, Any],
        nodes: list[dict[str, Any]],
        kind: str,
        title: str | None = None,
        semantic_suffix: list[str] | None = None,
    ) -> None:
        unique_nodes: list[dict[str, Any]] = []
        for node in nodes:
            source_index = node["source_index"]
            if source_index in assigned:
                raise ValueError(f"Source segment assigned more than once: {source_index}")
            assigned.add(source_index)
            unique_nodes.append(node)
        anchor_segment = anchor["segment"]
        groups.append({
            "anchor": anchor,
            "nodes": unique_nodes,
            "kind": kind,
            "title": title or anchor_segment["title"],
            "semantic_path": [*anchor_segment["path"], *(semantic_suffix or [])],
        })

    def add_h3(node: dict[str, Any]) -> None:
        segment = node["segment"]
        h4_nodes = [child for child in node["children"] if child["level"] == 4]
        other_children = [child for child in node["children"] if child["level"] != 4]
        if other_children:
            raise ValueError(f"Unexpected heading below H3: {segment['title']}")
        all_nodes = flatten_nodes(node)
        if nodes_plain_chars(all_nodes) <= 10_000 or not h4_nodes:
            add_group(node, all_nodes, "section")
            return

        bundles = h4_bundles(h4_nodes)
        chunks = partition_h4_bundles(bundles, segment["_plain_chars"])
        for chunk_index, chunk_bundles in enumerate(chunks):
            chunk_h4 = [item for bundle in chunk_bundles for item in bundle]
            chunk_nodes = ([node] if chunk_index == 0 else []) + chunk_h4
            lead = bundle_core_title(chunk_bundles[0]) if chunk_bundles else segment["title"]
            page_title = f"{segment['title']} · {lead}"
            tail = bundle_core_title(chunk_bundles[-1]) if chunk_bundles else lead
            add_group(
                node,
                chunk_nodes,
                "section-split",
                title=page_title,
                semantic_suffix=[lead, tail],
            )

    for node in root["children"]:
        segment = node["segment"]
        if node["level"] == 0:
            add_group(node, [node], "document-overview")
            continue

        part = parse_number(segment["title"], "편") if PART_RE.search(segment["title"]) else None
        if node["level"] == 1 and part in {1, 2, 3, 4}:
            if segment["_body_raw"]:
                add_group(node, [node], "subject-overview", title=f"{segment['title']} 개요")
            for h2_node in node["children"]:
                h2_segment = h2_node["segment"]
                chapter_number = (
                    parse_number(h2_segment["title"], "장")
                    if CHAPTER_RE.search(h2_segment["title"])
                    else None
                )
                if h2_node["level"] == 2 and chapter_number is not None:
                    if h2_segment["_body_raw"]:
                        add_group(h2_node, [h2_node], "chapter-overview", title=f"{h2_segment['title']} 개요")
                    extras: list[dict[str, Any]] = []
                    for child in h2_node["children"]:
                        if child["level"] == 3:
                            add_h3(child)
                        else:
                            extras.extend(flatten_nodes(child))
                    if extras:
                        add_group(
                            h2_node,
                            extras,
                            "chapter-details",
                            title=f"{h2_segment['title']} 세부 항목",
                            semantic_suffix=["세부 항목"],
                        )
                else:
                    # Sources and the quick-reference material after Part 4
                    # must not leak into the final lubrication chapter.
                    add_group(h2_node, flatten_nodes(h2_node), "appendix")
            continue

        # "전체 목차" and top-level intro sections are one readable page,
        # with all descendant headings retained inside it.
        add_group(node, flatten_nodes(node), "intro")

    # Fail closed if a future source shape leaves meaningful body content out.
    for node in flatten_nodes(root)[1:]:
        if node["source_index"] not in assigned and node["segment"]["_body_raw"]:
            add_group(node, [node], "unmapped-overview")
    return groups


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

    image_assets, public_image_paths = prepare_public_images(
        project_root,
        source,
        allow_noncanonical=allow_noncanonical,
    )
    topic_groups = build_topic_groups(segments, image_assets=image_assets)
    occurrences: dict[str, int] = {}
    anchor_occurrences: dict[str, int] = {}
    subjects_order: list[str] = []
    subjects_by_id: dict[str, dict[str, Any]] = {}
    topic_payloads: list[tuple[dict[str, Any], dict[str, Any]]] = []
    search_topics: list[dict[str, Any]] = []
    emitted_body_chars = 0
    internal_heading_count = 0

    for group in topic_groups:
        anchor_node = group["anchor"]
        segment = anchor_node["segment"]
        semantic_path: list[str] = group["semantic_path"]
        segment_kind: str = group["kind"]
        occurrence_key = "/".join(canonical(item) for item in semantic_path)
        occurrence = occurrences.get(occurrence_key, 0)
        occurrences[occurrence_key] = occurrence + 1
        topic_id = stable_id(page_id, semantic_path, occurrence, segment_kind)
        blocks: list[dict[str, Any]] = []
        body_plain_parts: list[str] = []
        searchable_parts: list[str] = []
        section_anchors: list[dict[str, str]] = []
        anchor_is_in_group = any(node is anchor_node for node in group["nodes"])

        for node in group["nodes"]:
            source_segment = node["segment"]
            is_page_heading = anchor_is_in_group and node is anchor_node
            if source_segment["level"] > 0 and not is_page_heading:
                anchor_key = "/".join(canonical(item) for item in source_segment["path"])
                anchor_occurrence = anchor_occurrences.get(anchor_key, 0)
                anchor_occurrences[anchor_key] = anchor_occurrence + 1
                section_id = stable_id(page_id, source_segment["path"], anchor_occurrence, "section-anchor")
                blocks.append({
                    "type": "heading",
                    "level": source_segment["level"],
                    "text": source_segment["title"],
                    "id": section_id,
                })
                section_anchors.append({"id": section_id, "title": source_segment["title"]})
                searchable_parts.append(source_segment["title"])
                internal_heading_count += 1
            blocks.extend(source_segment["_blocks"])
            if source_segment["_plain_text"]:
                body_plain_parts.append(source_segment["_plain_text"])
                searchable_parts.append(source_segment["_plain_text"])
            emitted_body_chars += len(source_segment["_body_raw"])

        plain_text = re.sub(r"\s+", " ", " ".join(body_plain_parts)).strip()
        subject_info, chapter_info, category_path = resolve_location(segment)
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
            summary = f"{group['title']}의 원문 학습 항목입니다."
        logical_path = " › ".join(semantic_path)
        topic = {
            "id": topic_id,
            "title": group["title"],
            "summary30s": summary,
            "categoryPath": category_path,
        }
        chapter["topics"].append(topic)
        payload = {
            "schemaVersion": 1,
            "id": topic_id,
            "title": group["title"],
            "sourcePath": f"Notion page {page_id} › {logical_path}",
            "blocks": blocks,
            "sectionAnchors": section_anchors,
        }
        topic_payloads.append((topic, payload))
        search_topics.append({
            "id": topic_id,
            "title": group["title"],
            "normalizedText": normalize_search(
                " ".join([group["title"], *semantic_path, *searchable_parts])
            ),
            "excerpt": plain_text[:240],
            "sections": section_anchors,
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
    cleared_image_blocks = [
        block
        for _topic, payload in topic_payloads
        for block in payload["blocks"]
        if block["type"] == "image"
        and block.get("rightsStatus") == "cleared"
        and re.fullmatch(r"/notion-images/[0-9a-f]{64}\.(?:svg|png|jpg)", block.get("src", ""))
    ]
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
            "publicImageFiles": len(public_image_paths),
            "publicImageBytes": sum(path.stat().st_size for path in public_image_paths),
            "topics": len(topic_payloads),
            "topicJsonFiles": len(list(topics_dir.glob("*.json"))),
            "searchEntries": len(search_topics),
            "subjects": len(subjects),
            "chapters": catalog["stats"]["chapters"],
            "groupedSourceSegments": sum(len(group["nodes"]) for group in topic_groups),
            "internalHeadings": internal_heading_count,
        },
        "checks": {
            "uniqueTopicIds": unique_ids == len(topic_payloads),
            "topicFileParity": len(list(topics_dir.glob("*.json"))) == len(topic_payloads),
            "searchParity": len(search_topics) == len(topic_payloads),
            "tableParity": payload_table_count == raw_table_count,
            "imageParity": payload_image_count == raw_image_count,
            "publicImageParity": (
                len(cleared_image_blocks) == raw_image_count
                and len(public_image_paths) == raw_image_count
            ),
            "bodyCoverageMatched": emitted_body_chars == source_body_chars,
            "groupingTargetMatched": allow_noncanonical or len(topic_payloads) == 70,
            "securityViolations": security_violations,
            "approvedImageSet": len(image_assets) == raw_image_count,
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
        report["checks"]["publicImageParity"],
        report["checks"]["bodyCoverageMatched"],
        report["checks"]["groupingTargetMatched"],
        report["checks"]["approvedImageSet"],
        not security_violations,
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
