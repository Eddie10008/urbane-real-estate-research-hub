#!/usr/bin/env python3
"""Scan the static site for HTML, asset, and JS issues. Writes JSON report."""

from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import asdict, dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import List, Optional

ROOT = Path(__file__).resolve().parents[2]
REPORT_DIR = ROOT / ".cursor" / "error-bot"
REPORT_JSON = REPORT_DIR / "latest-report.json"


@dataclass
class Bug:
    severity: str  # error | warning
    category: str
    file: str
    message: str
    line: Optional[int] = None


@dataclass
class Report:
    ok: bool
    checked_at: str
    bug_count: int
    error_count: int
    warning_count: int
    bugs: List[Bug] = field(default_factory=list)


class SiteChecker(HTMLParser):
    def __init__(self, path: Path):
        super().__init__()
        self.path = path
        self.bugs: List[Bug] = []
        self.stack: List[str] = []
        self.seen_ids: dict[str, int] = {}

    def handle_starttag(self, tag: str, attrs):
        void = tag in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
        if not void:
            self.stack.append(tag)
        attr_map = dict(attrs)
        if tag in {"script", "link", "img"} and "src" in attr_map:
            self._check_asset(attr_map["src"])
        if tag == "link" and "href" in attr_map and attr_map.get("rel") != "preconnect":
            rel = attr_map.get("rel", "")
            if "stylesheet" in rel or attr_map["href"].endswith(".css"):
                self._check_asset(attr_map["href"])
        if tag == "a" and "href" in attr_map:
            self._check_href(attr_map["href"])
        elem_id = attr_map.get("id")
        if elem_id:
            if elem_id in self.seen_ids:
                self.bugs.append(
                    Bug("warning", "html", str(self.path.relative_to(ROOT)), f"Duplicate id '{elem_id}'", self.seen_ids[elem_id])
                )
            else:
                self.seen_ids[elem_id] = self.getpos()[0]

    def handle_endtag(self, tag: str):
        if not self.stack:
            self.bugs.append(Bug("error", "html", str(self.path.relative_to(ROOT)), f"Unexpected closing </{tag}>", self.getpos()[0]))
            return
        expected = self.stack.pop()
        if expected != tag:
            self.bugs.append(
                Bug("error", "html", str(self.path.relative_to(ROOT)), f"Mismatched tag: expected </{expected}>, got </{tag}>", self.getpos()[0])
            )

    def _check_asset(self, ref: str):
        if ref.startswith(("http://", "https://", "//", "data:", "mailto:", "tel:", "#")):
            return
        target = (self.path.parent / ref).resolve()
        if not target.exists():
            self.bugs.append(Bug("error", "asset", str(self.path.relative_to(ROOT)), f"Missing asset: {ref}", self.getpos()[0]))

    def _check_href(self, href: str):
        if href.startswith(("http://", "https://", "//", "mailto:", "tel:", "#", "javascript:")):
            return
        clean = href.split("#")[0].split("?")[0]
        if not clean or clean.endswith("/"):
            return
        target = (self.path.parent / clean).resolve()
        if not target.exists():
            self.bugs.append(Bug("error", "link", str(self.path.relative_to(ROOT)), f"Broken link: {href}", self.getpos()[0]))


def check_html_file(path: Path) -> List[Bug]:
    bugs: List[Bug] = []
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        return [Bug("error", "html", str(path.relative_to(ROOT)), f"Invalid UTF-8: {exc}")]
    except OSError as exc:
        return [Bug("error", "html", str(path.relative_to(ROOT)), f"Cannot read file: {exc}")]

    head = text[:300].upper().replace(" ", "")
    if "<!DOCTYPEHTML>" not in head:
        bugs.append(Bug("warning", "html", str(path.relative_to(ROOT)), "Missing or non-standard DOCTYPE"))

    parser = SiteChecker(path)
    try:
        parser.feed(text)
        parser.close()
    except Exception as exc:  # noqa: BLE001
        bugs.append(Bug("error", "html", str(path.relative_to(ROOT)), f"HTML parse failure: {exc}"))

    if parser.stack:
        unclosed = ", ".join(f"<{t}>" for t in parser.stack)
        bugs.append(Bug("error", "html", str(path.relative_to(ROOT)), f"Unclosed tags: {unclosed}"))

    bugs.extend(parser.bugs)
    return bugs


def check_js_file(path: Path) -> List[Bug]:
    bugs: List[Bug] = []
    text = path.read_text(encoding="utf-8")

    # Bracket balance heuristic
    pairs = {"(": ")", "{": "}", "[": "]"}
    stack: List[str] = []
    in_str: Optional[str] = None
    escape = False
    for i, ch in enumerate(text):
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_str:
                in_str = None
            continue
        if ch in ("'", '"', "`"):
            in_str = ch
            continue
        if ch in pairs:
            stack.append(pairs[ch])
        elif ch in pairs.values():
            if not stack or stack[-1] != ch:
                line = text.count("\n", 0, i) + 1
                bugs.append(Bug("error", "javascript", str(path.relative_to(ROOT)), f"Unbalanced bracket near line {line}", line))
                break
            stack.pop()

    if stack:
        bugs.append(Bug("error", "javascript", str(path.relative_to(ROOT)), "Unclosed brackets in JS file"))

    # Optional node syntax check
    try:
        result = subprocess.run(
            ["node", "--check", str(path)],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode != 0 and result.stderr.strip():
            bugs.append(Bug("error", "javascript", str(path.relative_to(ROOT)), result.stderr.strip().splitlines()[-1]))
    except FileNotFoundError:
        pass
    except subprocess.TimeoutExpired:
        bugs.append(Bug("warning", "javascript", str(path.relative_to(ROOT)), "JS syntax check timed out"))

    return bugs


def check_css_file(path: Path) -> List[Bug]:
    bugs: List[Bug] = []
    text = path.read_text(encoding="utf-8")
    if text.count("{") != text.count("}"):
        bugs.append(Bug("error", "css", str(path.relative_to(ROOT)), "Unbalanced braces in CSS"))
    return bugs


def check_required_files() -> List[Bug]:
    required = ["index.html", "css/styles.css", "js/main.js", "js/data.js"]
    bugs: List[Bug] = []
    for rel in required:
        if not (ROOT / rel).exists():
            bugs.append(Bug("error", "structure", rel, "Required project file is missing"))
    return bugs


def run_checks() -> Report:
    from datetime import datetime, timezone

    bugs: List[Bug] = []
    bugs.extend(check_required_files())

    for html in sorted(ROOT.glob("*.html")):
        bugs.extend(check_html_file(html))

    for js in sorted((ROOT / "js").glob("*.js")):
        bugs.extend(check_js_file(js))

    css = ROOT / "css" / "styles.css"
    if css.exists():
        bugs.extend(check_css_file(css))

    errors = [b for b in bugs if b.severity == "error"]
    warnings = [b for b in bugs if b.severity == "warning"]

    return Report(
        ok=len(errors) == 0,
        checked_at=datetime.now(timezone.utc).isoformat(),
        bug_count=len(bugs),
        error_count=len(errors),
        warning_count=len(warnings),
        bugs=bugs,
    )


def main() -> int:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report = run_checks()
    payload = {
        **asdict(report),
        "bugs": [asdict(b) for b in report.bugs],
    }
    REPORT_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload, indent=2))
    return 0 if report.ok else 1


if __name__ == "__main__":
    sys.exit(main())
