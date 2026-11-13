# ☾ Arbor Arcanum — Chronologiczna Encyklopedia Ezoteryki

Interaktywna aplikacja webowa prezentująca wiedzę ezoteryczną (na start: **228 systemów i technik astrologicznych**) w formie **drzewa genealogicznego**: korzeń → epoki historyczne → strumienie tradycji → konkretne systemy/techniki.

Aplikacja jest w 100% statyczna (HTML + CSS + vanilla JS, zero zależności, zero zewnętrznych zapytań) — działa offline z dowolnego serwera plików.

## Uruchomienie

```bash
cd ezoteryka-encyklopedia
python3 -m http.server 8080
# otwórz http://localhost:8080
```

> Uwaga: otwarcie `index.html` bezpośrednio z dysku (`file://`) zablokuje `fetch()` danych bazowych — użyj serwera HTTP.

## Funkcje

- **🌳 Drzewo genealogiczne** — hierarchia Epoki → Tradycje → Systemy, z rozwijaniem/zwijaniem i licznikami węzłów.
- **⏳ Oś czasu** — strumienie tradycji płynące przez epoki na wspólnej, nieliniowej osi czasu (od paleolitu po XXI wiek); linie pokazują ciągłość przekazu.
- **📜 Katalog** — karty wszystkich systemów z filtrami (epoka / tradycja / paczka) i sortowaniem chronologicznym.
- **⌕ Wyszukiwarka** — pełnotekstowa (nazwy, autorzy, opisy, techniki, zastosowania) z podświetlaniem trafień.
- **Panel szczegółów** — pełny rekord: opis, autorzy, epoka, techniki, zastosowania, referencje.
- **📦 Paczki danych** — rozbudowa drzewa bez dotykania kodu (opis niżej), zapis w `localStorage` + eksport scalonych danych do JSON.

## Rozbudowa: dodawanie paczek danych

Drzewo rozbudowujesz wczytując kolejne paczki przyciskiem **„＋ Dodaj paczkę danych"**. Wspierane są dwa formaty.

### Format 1: tabela Markdown (`.md`) — 7 kolumn

Najprostszy sposób: skopiuj układ z [`data/szablon-paczki.md`](data/szablon-paczki.md). Kolumny (kolejność stała):

| Kolumna | Zawartość |
|---|---|
| 1 | Nazwa systemu / techniki |
| 2 | Autorzy / źródło / tradycja |
| 3 | Epoka / okres (dowolny opis, np. „XVI wiek (Renesans)", „ok. 2100 p.n.e.") |
| 4 | Opis |
| 5 | Techniki i kluczowe pojęcia |
| 6 | Zastosowania |
| 7 | Referencje |

Epokę i tradycję aplikacja **przypisze automatycznie** na podstawie tekstu (słowa kluczowe: „Egipt", „Chiny", „wedyjska", „psychologiczna", „renesans", „hermetyczna" itd.), a rok na osi czasu oszacuje z opisu okresu. Możesz też jawnie nadpisać klasyfikację, używając formatu JSON.

### Format 2: JSON (`.json`) — pełna kontrola

```json
{
  "packageName": "Alchemia i Kabała",
  "nodes": [
    {
      "name": "Kabała",
      "authors": "Tradycja żydowska / chrześcijańska kabała",
      "period": "XII–XVI wiek",
      "epoch": "renesans",
      "year": 1450,
      "tradition": "ezoteryczna",
      "description": "…",
      "techniques": "…",
      "applications": "…",
      "references": "[1]"
    }
  ]
}
```

Dozwolone wartości:

- `epoch`: `prehistoria` | `starozytnosc` | `hellenizm` | `sredniowiecze` | `renesans` | `barok` | `xix` | `xx` | `xxi`
- `tradition`: `archaiczna` | `chinska` | `wedyjska` | `mesoameryka` | `mezopotamska` | `egipska` | `persko-arabska` | `grecko-rzymska` | `psychologiczna` | `ezoteryczna` | `statystyczna`
- `year`: liczba (ujemna = p.n.e.) — pozycja na osi czasu

Pola `epoch`, `year`, `tradition` są opcjonalne — bez nich zadziała automatyczna klasyfikacja jak w przypadku `.md`.

### Zasady scalania

- Węzły o **identycznej nazwie** (ignorując wielkość liter i polskie znaki) są deduplikowane — pierwsza paczka wygrywa.
- Wszystkie węzły trafiają do wspólnego drzewa i osi czasu; w karcie węzła widać, z której paczki pochodzi.
- Paczki zapisują się w `localStorage` przeglądarki (przycisk **„⬇ Eksport"** pozwala pobrać scalone dane JSON, np. do wersjonowania w repo).

## Konwersja offline (opcjonalnie)

Do wstępnego przetworzenia tabeli `.md` na JSON służy konwerter Python (ten sam, który wygenerował paczkę bazową):

```bash
python3 tools/md_to_json.py moja-paczka.md data/moja-paczka.json --nazwa "Moja paczka" --id moja-paczka
```

## Struktura projektu

```
ezoteryka-encyklopedia/
├── index.html              # struktura aplikacji
├── styles.css              # styl (ciemny, „mistyczny")
├── app.js                  # logika: drzewo, oś czasu, katalog, import/eksport
├── data/
│   ├── astrologia-rdzen.json   # paczka bazowa (228 systemów)
│   └── szablon-paczki.md       # szablon nowej paczki
└── tools/
    └── md_to_json.py       # konwerter MD → JSON z auto-klasyfikacją
```

## Uwaga merytoryczna

Dane pochodzą z przesłanego zestawienia „Systemy i Techniki Astrologiczne według Autorów" i mają charakter encyklopedyczno-historyczny; część dat (szczególnie prehistoryczne i cykle yuga) odzwierciedla twierdzenia źródeł tradycyjnych, nie ustalenia nauki akademickiej.
