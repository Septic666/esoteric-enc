#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Konwerter paczki danych (tabela Markdown, 7 kolumn) -> JSON encyklopedii ezoteryki.

Format wejściowy (tabela Markdown, kolejność kolumn stała):
| Nazwa systemu/techniki | Autorzy | Epoka/Okres | Opis | Techniki/Kluczowe pojęcia | Zastosowania | Referencje |

Użycie:
    python3 md_to_json.py <plik.md> <plik_wyjsciowy.json> [--nazwa "Nazwa paczki"]
"""
import argparse
import hashlib
import json
import re
import sys
import unicodedata

# ---------------------------------------------------------------- epoki -----
EPOCHS = [
    {"id": "prehistoria", "name": "Prehistoria i Megality", "order": 0},
    {"id": "starozytnosc", "name": "Starożytność", "order": 1},
    {"id": "hellenizm", "name": "Hellenizm i Antyk Rzymski", "order": 2},
    {"id": "sredniowiecze", "name": "Średniowiecze i Świat Arabski", "order": 3},
    {"id": "renesans", "name": "Renesans", "order": 4},
    {"id": "barok", "name": "XVII–XVIII wiek", "order": 5},
    {"id": "xix", "name": "XIX wiek", "order": 6},
    {"id": "xx", "name": "XX wiek", "order": 7},
    {"id": "xxi", "name": "XXI wiek / Współczesność", "order": 8},
]
EPOCH_BY_ID = {e["id"]: e for e in EPOCHS}

ROMAN = {
    "i": 1, "ii": 2, "iii": 3, "iv": 4, "v": 5, "vi": 6, "vii": 7,
    "viii": 8, "ix": 9, "x": 10, "xi": 11, "xii": 12, "xiii": 13,
    "xiv": 14, "xv": 15, "xvi": 16, "xvii": 17, "xviii": 18,
    "xix": 19, "xx": 20, "xxi": 21,
}

def _norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.replace("\u0142", "l").replace("\u0141", "l")

EPOCH_TESTS = [
    ("prehistoria", ["paleolit", "megalit", "prehistor", "stonehenge", "neolit"]),
    ("xxi", ["xxi wiek", "xxi w", "xxi/xxii"]),
    ("xx", ["xx wiek", "xx w", "xx/xxi", "wspolczesn", "nowoczesn", "nowozytn",
            "lata 19", "lata 20", "lata 30", "lata 40", "lata 50", "lata 60",
            "lata 70", "lata 80", "lata 90", "epoka wiktoria"]),
    ("xix", ["xix wiek", "xix w", "xix/xx"]),
    ("barok", ["xvii wiek", "xvii w", "xviii wiek", "xviii w", "barok", "xvii/xviii"]),
    ("renesans", ["renesans", "xv wiek", "xv w", "xvi wiek", "xvi w", "xv/xvi"]),
    ("sredniowiecze", ["sredniowiecz", "arabsk", "persko-arabsk", "persko arabsk",
                       "islam", "bagdad", "sasanid", "zloty wiek"]),
    ("hellenizm", ["hellenist", "rzymsk", "rzym", "bizanty", "ptolemejsk",
                   "ptolemeusz", "tetrabiblos", "aleksandria", "antyk",
                   "pozna starozytn", "pozna antyk"]),
    ("starozytnosc", ["starozytn", "babilon", "chaldej", "egip", "wedy", "sumer",
                      "asyryjsk", "mezopotam"]),
]

def _strip_parens(s):
    return re.sub(r"\([^)]*\)", " ", s)

def detect_epoch(text):
    t = _norm(text)
    main = _norm(_strip_parens(text))
    matches = []
    for field_pos, field in ((0, main), (1, t)):
        for epoch_id, keys in EPOCH_TESTS:
            for k in keys:
                pos = field.find(k)
                if pos >= 0:
                    matches.append((field_pos, pos, epoch_id))
                    break
    if matches:
        matches.sort()
        return matches[0][2]
    return None

def epoch_from_year(year):
    if year >= 2001:
        return "xxi"
    if year >= 1900:
        return "xx"
    if year >= 1800:
        return "xix"
    if year >= 1600:
        return "barok"
    if year >= 1400:
        return "renesans"
    if year >= 501:
        return "sredniowiecze"
    if year >= -500:
        return "hellenizm"
    return "starozytnosc"

CENTURY_RE = re.compile(r"\b([ivxlv]+)\s*(?:wiek|w\.?)(?!\w)", re.IGNORECASE)
YEAR_RE = re.compile(r"(\d[\d\u00a0\s\u202f]*)\s*(r\.?)?\s*(p\.?\s*n\.?\s*e\.?|n\.?\s*e\.?)?", re.IGNORECASE)
LATA_RE = re.compile(r"lata\s+(\d)0", re.IGNORECASE)

def _clean_num(s):
    return int(re.sub(r"[^\d]", "", s))

def estimate_year(period, name=""):
    """Zgrubny rok (ujemny = p.n.e.) na potrzeby osi czasu."""
    src = f"{name} {period}".strip()
    t = _norm(src)
    m = LATA_RE.search(t)
    if m:
        dec = int(m.group(1))
        ctx = t[m.end():m.end() + 40]
        return (2000 if "xxi" in ctx else 1900) + dec * 10
    has_bce = "p.n.e" in t or "pne" in t
    candidates = []
    for m in YEAR_RE.finditer(src):
        digits = _clean_num(m.group(1))
        if not (1 <= digits <= 500000):
            continue
        era = _norm(m.group(3) or "")
        after = _norm(src[m.end():m.end() + 8]).strip()
        is_bce = "p.n.e" in era or after.startswith("p.n.e") or "lat temu" in after or "temu" in after
        is_ce = ("n.e" in era and "p.n.e" not in era) or after.startswith("n.e")
        if is_bce:
            candidates.append((0, -min(digits, 10000)))
        elif is_ce:
            candidates.append((0, min(digits, 2100)))
        elif 1000 <= digits <= 2100:
            candidates.append((1, -digits if has_bce else digits))
        elif digits > 2100:
            candidates.append((2, -min(digits, 10000) if has_bce else digits))
    if candidates:
        candidates.sort(key=lambda c: c[0])
        return candidates[0][1]
    m = CENTURY_RE.search(period or "")
    if m:
        c = ROMAN.get(m.group(1).lower())
        if c:
            year = (c - 1) * 100 + 50
            ctx = _norm(period[max(0, m.start() - 15):m.end() + 5])
            if "p.n.e" in ctx:
                return -year
            return year
    return None

# --------------------------------------------------------------- tradycje ---
TRADITIONS = [
    {"id": "archaiczna", "name": "Tradycje Pradziejowe", "color": "#9c8f7f",
     "keys": ["paleolit", "megalit", "prehistor", "stonehenge", "archaicz",
              "druid", "celt", "megalithic", "neolit"]},
    {"id": "chinska", "name": "Tradycja Chińska", "color": "#e05a4e",
     "keys": ["chinsk", "taoist", "i ching", "feng shui", "qi men", "huang ti",
              "fohi", "ming shu", "zwierzat", "trigram"]},
    {"id": "wedyjska", "name": "Tradycja Wedyjska (Indie)", "color": "#e09a3c",
     "keys": ["indyjsk", "wedyjsk", "vedic", "jyotish", "hindusk", "nakszatr",
              "nakshatra", "dasha", "mahadasa", "veda", "rahu", "ketu", "navamsha",
              "krishnamurti", "siddhanta", "gann", "indii", "indie ", " indii"]},
    {"id": "mesoameryka", "name": "Tradycje Mesoameryki", "color": "#c8b93e",
     "keys": ["majow", "mesoamer", "aztek", "tzolkin"]},
    {"id": "mezopotamska", "name": "Tradycja Mezopotamska", "color": "#8fbf5f",
     "keys": ["babilon", "mezopotam", "chaldej", "asyryjsk", "sumer", "enuma",
              "sargon", "nabu", "omen"]},
    {"id": "egipska", "name": "Tradycja Egipska", "color": "#4ec9a5",
     "keys": ["egip", "piramid", "imhotep", "dekan", "sphinx", "mazzaroth"]},
    {"id": "persko-arabska", "name": "Tradycja Persko-Arabska", "color": "#4aa8d8",
     "keys": ["arabsk", "persk", "islam", "bagdad", "sasanid", "albumasar",
              "abu ma'shar", "abu maszar", "firdaria", "nabatej", "nabatcz"]},
    {"id": "grecko-rzymska", "name": "Tradycja Grecko-Rzymska", "color": "#6d8fe0",
     "keys": ["grec", "hellenist", "rzym", "rzymsk", "ptolemeusz", "ptolomejsk",
              "aleksandria", "hermes", "pitagoras", "maniliusz", "nechepso",
              "petosiris", "berossus", "doroteusz", "antioch", "hefajstion",
              "porfir", "wap", "zodiakaln"]},
    {"id": "psychologiczna", "name": "Astrologia Psychologiczna", "color": "#a06de0",
     "keys": ["psychologic", "jungow", "archetyp", "humanist", "kosmopsycholog",
              "depth", "ewolucyjn", "transformacyjn", "terapi", "kliniczn",
              "huber", "samoświadom", "samoswiadom", "empower", "duchow"]},
    {"id": "ezoteryczna", "name": "Ezoteryka i Hermetyzm", "color": "#d84a9e",
     "keys": ["hermetycz", "ezoterycz", "esoterycz", "okultyst", "magiczn",
              "kaba", "teurgi", "teosof", "misteryjn", "misterijn", "rytualn",
              "dywinacj", "geomancj", "wicca", "nigromancj", "spirytual",
              "karmiczn", "reinkarnacj", "initiacyjn", "inicjacyjn"]},
    {"id": "statystyczna", "name": "Astrologia Statystyczna / Naukowa", "color": "#5fbfb0",
     "keys": ["statystyc", "naukow", "gauquelin", "kosmobiolog", "efekt marsa",
              "badan", "epidemiolog", "algorytmiczn", "cyfrowy", "ai "]},
]
TRADITION_BY_ID = {t["id"]: t for t in TRADITIONS}

def detect_tradition(name, period, description):
    for field in (name, period, description):
        t = _norm(field)
        if not t:
            continue
        for tr in TRADITIONS:
            for k in tr["keys"]:
                if k in t:
                    return tr["id"]
    return None

# ----------------------------------------------------------------- parsowanie
def parse_markdown_table(text):
    rows = []
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) != 7 or set(cells[0]) <= {"-"}:
            continue
        if _norm(cells[0]).startswith("nazwa") or _norm(cells[1]).startswith("autor"):
            continue
        rows.append(cells)
    return rows

def slug(s):
    s = _norm(s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:60] or "node"

def convert(text, package_name, package_id=None):
    rows = parse_markdown_table(text)
    if not rows:
        raise SystemExit("Nie znaleziono wierszy tabeli (oczekiwano 7 kolumn).")
    nodes = []
    for i, (name, authors, period, description, techniques, applications, refs) in enumerate(rows):
        epoch = detect_epoch(period + " " + name)
        year = estimate_year(period, name)
        if epoch is None:
            epoch = epoch_from_year(year if year is not None else 1950)
        if year is None:
            year = {"prehistoria": -8000, "starozytnosc": -2000, "hellenizm": 0,
                    "sredniowiecze": 900, "renesans": 1500, "barok": 1700,
                    "xix": 1850, "xx": 1950, "xxi": 2010}[epoch]
        tradition = detect_tradition(name, period, description) or "grecko-rzymska"
        nid = f"{package_id or 'pkg'}-{slug(name)}-{i}"
        nodes.append({
            "id": nid,
            "name": name,
            "authors": authors,
            "period": period,
            "epoch": epoch,
            "epochName": EPOCH_BY_ID[epoch]["name"],
            "epochOrder": EPOCH_BY_ID[epoch]["order"],
            "year": year,
            "tradition": tradition,
            "traditionName": TRADITION_BY_ID[tradition]["name"],
            "traditionColor": TRADITION_BY_ID[tradition]["color"],
            "description": description,
            "techniques": techniques,
            "applications": applications,
            "references": refs,
        })
    return {
        "packageId": package_id or ("pkg-" + slug(package_name)[:20]),
        "packageName": package_name,
        "generated": True,
        "epochs": EPOCHS,
        "traditions": TRADITIONS,
        "nodes": nodes,
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--nazwa", default="Paczka danych")
    ap.add_argument("--id", default=None)
    args = ap.parse_args()
    text = open(args.input, encoding="utf-8", errors="replace").read()
    data = convert(text, args.nazwa, args.id)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"OK: {len(data['nodes'])} węzłów -> {args.output}")

if __name__ == "__main__":
    main()
