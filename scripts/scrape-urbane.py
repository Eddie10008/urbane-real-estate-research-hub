#!/usr/bin/env python3
"""Scrape content, listings, and team data from urbanere.com.au into js/ data files."""

import html
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS_DIR = ROOT / "js"
BASE_URL = "https://www.urbanere.com.au"

BEDS_DATA = {
    "1793914": ("4", "2", "2"), "1792342": ("4", "1", "1"), "1789703": ("2", "1", ""),
    "1789162": ("3", "2", "2"), "1788108": ("3", "1", "1"), "1788077": ("3", "1", "2"),
    "1782298": ("4", "1", "2"), "1781991": ("3", "2", "1"), "1781603": ("3", "1", "1"),
    "1780849": ("3", "2", "1"), "1776954": ("4", "2", "2"), "1773830": ("3", "2", "1"),
    "1772102": ("2", "2", "1"), "1771059": ("5", "2", "2"), "1769955": ("3", "2", "2"),
    "1768074": ("5", "2", "2"), "1762200": ("3", "1", "1"), "1759347": ("2", "2", "1"),
    "1758995": ("2", "2", "1"), "1752147": ("3", "2", "2"), "1744827": ("4", "1", "2"),
    "1737160": ("4", "2", "1"), "1725429": ("2", "2", "1"), "1693183": ("2", "1", "1"),
    "820906": ("4", "2", "1"),
}


def fetch(path: str) -> str:
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "UrbaneScraper/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_listings(content: str) -> list:
    cards = re.findall(r"<li>\s*<div class=\"card\">(.*?)</div>\s*</div>\s*</li>", content, re.DOTALL)
    listings = []
    for card in cards:
        link_m = re.search(r'href="(/property\?property_id=[^"]+)"', card)
        if not link_m:
            continue
        url = link_m.group(1)
        pid = re.search(r"property_id=(\d+)", url).group(1)
        img_m = re.search(r'<img[^>]+src="([^"]+)"', card)
        status_m = re.search(
            r'rel="tag">([^<]+)</a></li>\s*</ul>\s*</div>\s*<div class="price">', card, re.DOTALL
        )
        price_m = re.search(r'<div class="price">([^<]+)', card)
        title_m = re.search(r'<div class="title"><a[^>]+>([^<]+)</a>', card)
        suburb_m = re.search(
            r'<div class="title">.*?<ul class="meta-list">\s*<li><a[^>]+>([^<]+)</a>', card, re.DOTALL
        )
        sqm_m = re.search(r"(\d+)\s*sqm", card)
        beds, baths, cars = BEDS_DATA.get(pid, ("", "", ""))
        listings.append({
            "id": pid,
            "url": f"{BASE_URL}{url}",
            "image": img_m.group(1) if img_m else "",
            "status": status_m.group(1).strip() if status_m else "",
            "price": html.unescape(price_m.group(1).strip()) if price_m else "",
            "address": html.unescape(title_m.group(1).strip()) if title_m else "",
            "suburb": suburb_m.group(1).strip() if suburb_m else "",
            "beds": beds,
            "baths": baths,
            "cars": cars,
            "land": sqm_m.group(1) + " sqm" if sqm_m else "",
        })
    return listings


def parse_suburbs(content: str) -> list:
    match = re.search(r'<select[^>]*name="suburb"[^>]*>(.*?)</select>', content, re.DOTALL)
    if match:
        suburbs = re.findall(r"<option[^>]*>([^<]+)</option>", match.group(1))
        result = [s.strip() for s in suburbs if s.strip() and s.strip() not in ("Suburb", "Any")]
        if result:
            return result
    # Fallback: suburb options may use a different select name on the live site
    for opt in re.findall(r"<option value=\"[^\"]+\">([A-Z][a-zA-Z ]+)</option>", content):
        if opt not in ("Residential", "Rentals", "Vacant Land", "Any", "Studio"):
            pass
    return FALLBACK_SUBURBS


FALLBACK_SUBURBS = [
    "Ashfield", "Auburn", "Austral", "Bardia", "Blacktown", "Box Hill", "Cambridge Gardens",
    "Cambridge Park", "Castle Hill", "Cranebrook", "Dean Park", "Doonside", "Edmondson Park",
    "Girraween", "Glenwood", "Grantham Farm", "Granville", "Gregory Hills", "Guildford",
    "Harris Park", "Homebush", "Homebush West", "Huntley", "Jamisontown", "Jordan Springs",
    "Katoomba", "Kings Park", "Kingswood", "Lethbridge Park", "Marayong", "Marsden Park",
    "Melonba", "Merrylands", "Mount Colah", "Mount Druitt", "Narara", "North Parramatta",
    "North St Marys", "Oakhurst", "Oakville", "Parramatta", "Penrith", "Plumpton",
    "Quakers Hill", "Riverstone", "Rooty Hill", "Schofields", "Seven Hills", "St Clair",
    "St Marys", "Toongabbie", "Wentworthville", "Werrington", "Werrington County",
    "West Gosford", "Westmead", "Willmot", "Woodcroft",
]


def parse_agents(content: str) -> list:
    agents = []
    for block in re.findall(
        r'<div class="card teaser\s+with-image\s*">(.*?)</div>\s*</div>\s*</div>\s*</div>',
        content,
        re.DOTALL,
    ):
        aid = re.search(r"agent_id=(\d+)", block)
        img = re.search(r'src="([^"]+)"', block)
        name = re.search(r'class="title"[^>]*>\s*<a[^>]+>([^<]+)</a>', block)
        role = re.search(r'<p style="font-size: 16px[^"]*">([^<]+)</p>', block)
        mobile = re.search(r'Mobile:\s*<a href="tel:([^"]+)"', block)
        if name:
            agents.append({
                "id": aid.group(1) if aid else "",
                "name": html.unescape(name.group(1).strip()),
                "role": html.unescape(role.group(1).strip()) if role else "",
                "image": img.group(1) if img else "",
                "mobile": mobile.group(1) if mobile else "",
                "url": f"{BASE_URL}/agent-profile?agent_id={aid.group(1)}" if aid else "",
            })
    return agents


def parse_about(content: str) -> list:
    paras = []
    for p in re.findall(r"<p>([^<]+(?:<(?!/p)[^>]*>[^<]*)*)</p>", content):
        clean = html.unescape(re.sub(r"<[^>]+>", "", p).strip())
        if len(clean) > 40 and "dataLayer" not in clean and "function" not in clean:
            paras.append(clean)
    return paras


def write_js(path: Path, *assignments: tuple[str, object]) -> None:
    parts = []
    for name, data in assignments:
        parts.append(f"const {name} = {json.dumps(data, indent=2)};")
    path.write_text("\n\n".join(parts) + "\n", encoding="utf-8")


def main() -> int:
    print("Fetching urbanere.com.au …")
    home = fetch("/")
    agents_html = fetch("/agents")
    about_html = fetch("/about")

    listings = parse_listings(home)
    suburbs = parse_suburbs(home)
    agents = parse_agents(agents_html)
    about = parse_about(about_html)

    write_js(JS_DIR / "listings.js", ("URBANE_LISTINGS", listings), ("URBANE_SUBURBS", suburbs))
    write_js(JS_DIR / "agents.js", ("URBANE_AGENTS", agents), ("URBANE_ABOUT", about))

    print(f"  Listings: {len(listings)}")
    print(f"  Suburbs:  {len(suburbs)}")
    print(f"  Agents:   {len(agents)}")
    print(f"  About:    {len(about)} paragraphs")
    print(f"Written to {JS_DIR}/listings.js and {JS_DIR}/agents.js")
    return 0


if __name__ == "__main__":
    sys.exit(main())
