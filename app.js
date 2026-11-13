/* ============================================================
   Arbor Arcanum — Chronologiczna Encyklopedia Ezoteryki
   Vanilla JS, bez zależności. Dane: paczki .md / .json.
   ============================================================ */
"use strict";

/* ---------------- epoki i tradycje (spójne z tools/md_to_json.py) --------- */
const EPOCHS = [
  { id: "prehistoria",   name: "Prehistoria i Megality",        order: 0 },
  { id: "starozytnosc",  name: "Starożytność",                  order: 1 },
  { id: "hellenizm",     name: "Hellenizm i Antyk Rzymski",     order: 2 },
  { id: "sredniowiecze", name: "Średniowiecze i Świat Arabski", order: 3 },
  { id: "renesans",      name: "Renesans",                      order: 4 },
  { id: "barok",         name: "XVII–XVIII wiek",               order: 5 },
  { id: "xix",           name: "XIX wiek",                      order: 6 },
  { id: "xx",            name: "XX wiek",                       order: 7 },
  { id: "xxi",           name: "XXI wiek / Współczesność",      order: 8 },
];
const EPOCH_BY_ID = Object.fromEntries(EPOCHS.map(e => [e.id, e]));

const TRADITIONS = [
  { id: "archaiczna",      name: "Tradycje Pradziejowe",              color: "#9c8f7f" },
  { id: "chinska",         name: "Tradycja Chińska",                  color: "#e05a4e" },
  { id: "wedyjska",        name: "Tradycja Wedyjska (Indie)",         color: "#e09a3c" },
  { id: "mesoameryka",     name: "Tradycje Mesoameryki",              color: "#c8b93e" },
  { id: "mezopotamska",    name: "Tradycja Mezopotamska",             color: "#8fbf5f" },
  { id: "egipska",         name: "Tradycja Egipska",                  color: "#4ec9a5" },
  { id: "persko-arabska",  name: "Tradycja Persko-Arabska",           color: "#4aa8d8" },
  { id: "grecko-rzymska",  name: "Tradycja Grecko-Rzymska",           color: "#6d8fe0" },
  { id: "psychologiczna",  name: "Astrologia Psychologiczna",         color: "#a06de0" },
  { id: "ezoteryczna",     name: "Ezoteryka i Hermetyzm",             color: "#d84a9e" },
  { id: "statystyczna",    name: "Astrologia Statystyczna / Naukowa", color: "#5fbfb0" },
];
const TRADITION_BY_ID = Object.fromEntries(TRADITIONS.map(t => [t.id, t]));

const EPOCH_TESTS = [
  ["prehistoria", ["paleolit", "megalit", "prehistor", "stonehenge", "neolit"]],
  ["xxi", ["xxi wiek", "xxi w", "xxi/xxii"]],
  ["xx", ["xx wiek", "xx w", "xx/xxi", "wspolczesn", "nowoczesn", "nowozytn",
          "lata 19", "lata 20", "lata 30", "lata 40", "lata 50", "lata 60",
          "lata 70", "lata 80", "lata 90", "epoka wiktoria"]],
  ["xix", ["xix wiek", "xix w", "xix/xx"]],
  ["barok", ["xvii wiek", "xvii w", "xviii wiek", "xviii w", "barok", "xvii/xviii"]],
  ["renesans", ["renesans", "xv wiek", "xv w", "xvi wiek", "xvi w", "xv/xvi"]],
  ["sredniowiecze", ["sredniowiecz", "arabsk", "persko-arabsk", "persko arabsk",
                     "islam", "bagdad", "sasanid", "zloty wiek"]],
  ["hellenizm", ["hellenist", "rzymsk", "rzym", "bizanty", "ptolemejsk",
                 "ptolemeusz", "tetrabiblos", "aleksandria", "antyk",
                 "pozna starozytn", "pozna antyk"]],
  ["starozytnosc", ["starozytn", "babilon", "chaldej", "egip", "wedy", "sumer",
                    "asyryjsk", "mezopotam"]],
];

const TRADITION_TESTS = [
  ["archaiczna", ["paleolit", "megalit", "prehistor", "stonehenge", "archaicz", "druid", "celt", "megalithic", "neolit"]],
  ["chinska", ["chinsk", "taoist", "i ching", "feng shui", "qi men", "huang ti", "fohi", "ming shu", "zwierzat", "trigram"]],
  ["wedyjska", ["indyjsk", "wedyjsk", "vedic", "jyotish", "hindusk", "nakszatr", "nakshatra", "dasha", "mahadasa",
                "veda", "rahu", "ketu", "navamsha", "krishnamurti", "siddhanta", "gann", "indii", "indie ", " indii"]],
  ["mesoameryka", ["majow", "mesoamer", "aztek", "tzolkin"]],
  ["mezopotamska", ["babilon", "mezopotam", "chaldej", "asyryjsk", "sumer", "enuma", "sargon", "nabu", "omen"]],
  ["egipska", ["egip", "piramid", "imhotep", "dekan", "sphinx", "mazzaroth"]],
  ["persko-arabska", ["arabsk", "persk", "islam", "bagdad", "sasanid", "albumasar", "abu ma'shar", "abu maszar",
                      "firdaria", "nabatej", "nabatcz"]],
  ["grecko-rzymska", ["grec", "hellenist", "rzym", "rzymsk", "ptolemeusz", "ptolomejsk", "aleksandria", "hermes",
                      "pitagoras", "maniliusz", "nechepso", "petosiris", "berossus", "doroteusz", "antioch",
                      "hefajstion", "porfir", "wap", "zodiakaln"]],
  ["psychologiczna", ["psychologic", "jungow", "archetyp", "humanist", "kosmopsycholog", "depth", "ewolucyjn",
                      "transformacyjn", "terapi", "kliniczn", "huber", "samoświadom", "samoswiadom", "empower", "duchow"]],
  ["ezoteryczna", ["hermetycz", "ezoterycz", "esoterycz", "okultyst", "magiczn", "kaba", "teurgi", "teosof",
                   "misteryjn", "misterijn", "rytualn", "dywinacj", "geomancj", "wicca", "nigromancj", "spirytual",
                   "karmiczn", "reinkarnacj", "initiacyjn", "inicjacyjn"]],
  ["statystyczna", ["statystyc", "naukow", "gauquelin", "kosmobiolog", "efekt marsa", "badan", "epidemiolog",
                    "algorytmiczn", "cyfrowy", "ai "]],
];

/* ---------------- narzędzia tekstowe -------------------------------------- */
function norm(s) {
  return (s || "").toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l").replace(/Ł/g, "l");
}
function stripParens(s) { return (s || "").replace(/\([^)]*\)/g, " "); }
function slug(s) {
  return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "node";
}
function esc(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function yearLabel(y) {
  if (y < 0) return `${Math.abs(y)} p.n.e.`;
  return `${y} n.e.`;
}

/* ---------------- klasyfikacja (port z konwertera Python) ------------------ */
function detectEpoch(text) {
  const t = norm(text), main = norm(stripParens(text));
  const matches = [];
  [[0, main], [1, t]].forEach(([fieldPos, field]) => {
    for (const [epochId, keys] of EPOCH_TESTS) {
      for (const k of keys) {
        const pos = field.indexOf(k);
        if (pos >= 0) { matches.push([fieldPos, pos, epochId]); break; }
      }
    }
  });
  if (matches.length) {
    matches.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return matches[0][2];
  }
  return null;
}
function epochFromYear(year) {
  if (year >= 2001) return "xxi";
  if (year >= 1900) return "xx";
  if (year >= 1800) return "xix";
  if (year >= 1600) return "barok";
  if (year >= 1400) return "renesans";
  if (year >= 501) return "sredniowiecze";
  if (year >= -500) return "hellenizm";
  return "starozytnosc";
}
const ROMAN = { i:1, ii:2, iii:3, iv:4, v:5, vi:6, vii:7, viii:8, ix:9, x:10, xi:11, xii:12,
  xiii:13, xiv:14, xv:15, xvi:16, xvii:17, xviii:18, xix:19, xx:20, xxi:21 };
const CENTURY_RE = /\b([ivxlv]+)\s*(?:wiek|w\.?)(?!\w)/i;
const YEAR_RE = /(\d[\d\u00a0\s\u202f]*)\s*(r\.?)?\s*(p\.?\s*n\.?\s*e\.?|n\.?\s*e\.?)?/gi;
const LATA_RE = /lata\s+(\d)0/i;

function estimateYear(period, name) {
  const src = `${name || ""} ${period || ""}`.trim();
  const t = norm(src);
  const mLata = LATA_RE.exec(t);
  if (mLata) {
    const dec = parseInt(mLata[1], 10);
    const ctx = t.slice(mLata.index + mLata[0].length, mLata.index + mLata[0].length + 40);
    return (ctx.includes("xxi") ? 2000 : 1900) + dec * 10;
  }
  const hasBce = t.includes("p.n.e") || t.includes("pne");
  const candidates = [];
  YEAR_RE.lastIndex = 0;
  let m;
  while ((m = YEAR_RE.exec(src))) {
    const digits = parseInt(m[1].replace(/\D/g, ""), 10);
    if (!(digits >= 1 && digits <= 500000)) continue;
    const era = norm(m[3] || "");
    const after = norm(src.slice(m.index + m[0].length, m.index + m[0].length + 8)).trim();
    const isBce = era.includes("p.n.e") || after.startsWith("p.n.e") || after.includes("lat temu") || after.includes("temu");
    const isCe = (era.includes("n.e") && !era.includes("p.n.e")) || after.startsWith("n.e");
    if (isBce) candidates.push([0, -Math.min(digits, 10000)]);
    else if (isCe) candidates.push([0, Math.min(digits, 2100)]);
    else if (digits >= 1000 && digits <= 2100) candidates.push([1, hasBce ? -digits : digits]);
    else if (digits > 2100) candidates.push([2, hasBce ? -Math.min(digits, 10000) : digits]);
  }
  if (candidates.length) {
    candidates.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return candidates[0][1];
  }
  const mC = CENTURY_RE.exec(period || "");
  if (mC) {
    const c = ROMAN[mC[1].toLowerCase()];
    if (c) {
      const year = (c - 1) * 100 + 50;
      const ctx = norm((period || "").slice(Math.max(0, mC.index - 15), mC.index + mC[0].length + 5));
      return ctx.includes("p.n.e") ? -year : year;
    }
  }
  return null;
}
function detectTradition(name, period, description) {
  for (const field of [name, period, description]) {
    const t = norm(field);
    if (!t) continue;
    for (const [trId, keys] of TRADITION_TESTS) {
      for (const k of keys) if (t.includes(k)) return trId;
    }
  }
  return "grecko-rzymska";
}

/* ---------------- parsowanie paczek .md ----------------------------------- */
function parseMarkdownTable(text) {
  const rows = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue;
    const cells = line.replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
    if (cells.length !== 7 || /^[-\s]+$/.test(cells[0])) continue;
    if (norm(cells[0]).startsWith("nazwa") || norm(cells[1]).startsWith("autor")) continue;
    rows.push(cells);
  }
  return rows;
}
function mdToPackage(text, packageName, packageId) {
  const rows = parseMarkdownTable(text);
  if (!rows.length) throw new Error("Nie znaleziono tabeli 7-kolumnowej w pliku .md");
  const nodes = rows.map((cells, i) => {
    const [name, authors, period, description, techniques, applications, references] = cells;
    let epoch = detectEpoch(`${period} ${name}`);
    const year = estimateYear(period, name) ?? 1950;
    if (!epoch) epoch = epochFromYear(year);
    const tradition = detectTradition(name, period, description);
    return {
      id: `${packageId}-${slug(name)}-${i}`,
      name, authors, period, epoch, year, tradition,
      description, techniques, applications, references,
      packageId,
    };
  });
  return { packageId, packageName, nodes };
}
function normalizeJsonPackage(json, packageId, packageName) {
  if (!Array.isArray(json.nodes)) throw new Error("Plik JSON nie zawiera tablicy 'nodes'.");
  const nodes = json.nodes.map((n, i) => {
    if (!n || !n.name) throw new Error(`Węzeł #${i} nie ma pola 'name'.`);
    let epoch = n.epoch || detectEpoch(`${n.period || ""} ${n.name}`) || epochFromYear(n.year ?? 1950);
    const year = Number.isFinite(n.year) ? n.year : (estimateYear(n.period, n.name) ?? 1950);
    const tradition = n.tradition || detectTradition(n.name, n.period, n.description);
    return {
      id: n.id || `${packageId}-${slug(n.name)}-${i}`,
      name: String(n.name),
      authors: n.authors || "—",
      period: n.period || "—",
      epoch,
      epochName: EPOCH_BY_ID[epoch] ? EPOCH_BY_ID[epoch].name : epoch,
      year, tradition,
      description: n.description || "",
      techniques: n.techniques || "",
      applications: n.applications || "",
      references: n.references || "",
      packageId,
    };
  });
  return { packageId, packageName: packageName || json.packageName || "Paczka JSON", nodes };
}

/* ---------------- stan aplikacji ------------------------------------------ */
const LS_KEY = "arbor-arcana-packages-v1";
const state = {
  packages: [],          // [{packageId, packageName, base:boolean, nodes}]
  nodes: [],             // scalone węzły
  query: "",
  view: "tree",
  filters: { epoch: "", tradition: "", pkg: "" },
  selectedId: null,
  expanded: new Set(),   // klucze "epoch:tradition"
  rootExpanded: true,
};

function loadExtraPackages() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}
function saveExtraPackages(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list.filter(p => !p.base)));
}

function rebuild() {
  const seen = new Set();
  state.nodes = [];
  for (const pkg of state.packages) {
    for (const n of pkg.nodes) {
      const key = norm(n.name).replace(/\s+/g, " ").trim();
      if (seen.has(key)) continue;
      seen.add(key);
      n.epochName = (EPOCH_BY_ID[n.epoch] || {}).name || n.epoch;
      n.traditionName = (TRADITION_BY_ID[n.tradition] || {}).name || n.tradition;
      n.traditionColor = (TRADITION_BY_ID[n.tradition] || {}).color || "#888";
      state.nodes.push(n);
    }
  }
  state.nodes.sort((a, b) => a.year - b.year);
}

function matchesQuery(n, q) {
  if (!q) return true;
  const hay = norm([n.name, n.authors, n.description, n.techniques, n.applications, n.period, n.epochName, n.traditionName].join(" "));
  return q.split(/\s+/).every(w => hay.includes(w));
}
function visibleNodes() {
  const { epoch, tradition, pkg } = state.filters;
  return state.nodes.filter(n =>
    (!epoch || n.epoch === epoch) &&
    (!tradition || n.tradition === tradition) &&
    (!pkg || n.packageId === pkg) &&
    matchesQuery(n, norm(state.query).trim())
  );
}

/* ---------------- budowa drzewa ------------------------------------------- */
function buildTree(nodes) {
  const byEpoch = new Map();
  for (const n of nodes) {
    if (!byEpoch.has(n.epoch)) byEpoch.set(n.epoch, []);
    byEpoch.get(n.epoch).push(n);
  }
  return EPOCHS
    .filter(e => byEpoch.has(e.id))
    .map(e => {
      const byTrad = new Map();
      for (const n of byEpoch.get(e.id)) {
        if (!byTrad.has(n.tradition)) byTrad.set(n.tradition, []);
        byTrad.get(n.tradition).push(n);
      }
      const traditions = [...byTrad.entries()]
        .map(([trId, list]) => ({
          id: trId,
          name: (TRADITION_BY_ID[trId] || { name: trId }).name,
          color: (TRADITION_BY_ID[trId] || { color: "#888" }).color,
          nodes: list.sort((a, b) => a.year - b.year),
        }))
        .sort((a, b) => b.nodes.length - a.nodes.length);
      return { id: e.id, name: e.name, order: e.order, traditions, total: byEpoch.get(e.id).length };
    });
}

/* ---------------- renderowanie: drzewo ------------------------------------ */
function highlight(text) {
  const q = norm(state.query).trim();
  const html = esc(text);
  if (!q) return html;
  const words = q.split(/\s+/).filter(w => w.length > 2);
  if (!words.length) return html;
  // podświetl na oryginalnym tekście (bez rozróżniania wielkości/diacrytyków uproszczone)
  let out = esc(text);
  for (const w of words) {
    const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    out = out.replace(re, "<mark>$1</mark>");
  }
  return out;
}

function renderTree() {
  const root = document.getElementById("treeRoot");
  const nodes = visibleNodes();
  const tree = buildTree(nodes);
  const rootEl = document.createElement("div");
  rootEl.className = "tree-inner";

  const rootNode = document.createElement("div");
  rootNode.className = "tree-root";
  rootNode.textContent = "✦ Źródła Ezoteryki i Astrologii";
  rootEl.appendChild(rootNode);

  if (!state.rootExpanded) { root.innerHTML = ""; root.appendChild(rootEl); return; }

  const ul = document.createElement("ul");
  ul.className = "tree-children";

  tree.forEach((epoch, idx) => {
    const li = document.createElement("li");
    li.className = "tree-node" + (idx === tree.length - 1 ? " last" : "");
    const epochKey = `epoch:${epoch.id}`;
    const open = state.expanded.has(epochKey);

    const row = document.createElement("div");
    row.className = "node-row epoch-row";
    row.innerHTML = `
      <span class="caret ${open ? "open" : ""}" data-caret="${epochKey}">▶</span>
      <span class="epoch-band" style="background:linear-gradient(180deg,var(--gold),transparent)"></span>
      <span class="node-label">${esc(epoch.name)}</span>
      <span class="count-badge">${epoch.total}</span>`;
    row.querySelector(".caret").addEventListener("click", e => { e.stopPropagation(); toggleKey(epochKey); });
    row.addEventListener("click", () => toggleKey(epochKey));
    li.appendChild(row);

    if (open) {
      const ulT = document.createElement("ul");
      ulT.className = "tree-children";
      epoch.traditions.forEach((trad, tIdx) => {
        const liT = document.createElement("li");
        liT.className = "tree-node" + (tIdx === epoch.traditions.length - 1 ? " last" : "");
        const tradKey = `trad:${epoch.id}:${trad.id}`;
        const openT = state.expanded.has(tradKey);
        const rowT = document.createElement("div");
        rowT.className = "node-row trad-row";
        rowT.innerHTML = `
          <span class="caret ${openT ? "open" : ""}" data-caret="${tradKey}">▶</span>
          <span class="trad-dot" style="background:${trad.color};color:${trad.color}"></span>
          <span>
            <span class="node-label">${esc(trad.name)}</span>
            <div class="node-sub">${esc(epoch.name)}</div>
          </span>
          <span class="count-badge">${trad.nodes.length}</span>`;
        rowT.querySelector(".caret").addEventListener("click", e => { e.stopPropagation(); toggleKey(tradKey); });
        rowT.addEventListener("click", () => toggleKey(tradKey));
        liT.appendChild(rowT);

        if (openT) {
          const ulL = document.createElement("ul");
          ulL.className = "tree-children";
          trad.nodes.forEach((n, nIdx) => {
            const liL = document.createElement("li");
            liL.className = "tree-node" + (nIdx === trad.nodes.length - 1 ? " last" : "");
            const rowL = document.createElement("div");
            rowL.className = "node-row leaf-row" + (n.id === state.selectedId ? " selected" : "");
            rowL.dataset.id = n.id;
            rowL.innerHTML = `
              <span class="caret leaf">▶</span>
              <span class="epoch-band" style="background:${n.traditionColor}"></span>
              <span>
                <span class="node-label">${highlight(n.name)}</span>
                <div class="node-sub">${esc(n.authors)}</div>
              </span>
              <span class="year-badge">${yearLabel(n.year)}</span>`;
            rowL.addEventListener("click", () => selectNode(n.id));
            liL.appendChild(rowL);
            ulL.appendChild(liL);
          });
          liT.appendChild(ulL);
        }
        ulT.appendChild(liT);
      });
      li.appendChild(ulT);
    }
    ul.appendChild(li);
  });

  rootEl.appendChild(ul);
  root.innerHTML = "";
  root.appendChild(rootEl);
}

function toggleKey(key) {
  if (state.expanded.has(key)) state.expanded.delete(key);
  else state.expanded.add(key);
  renderTree();
}

/* ---------------- oś czasu ------------------------------------------------- */
const TL_ANCHORS = [
  [-10000, 0], [-3000, 0.10], [-500, 0.24], [500, 0.40],
  [1500, 0.56], [1800, 0.72], [2020, 1.0],
];
function tlX(year, width) {
  const y = Math.max(-10000, Math.min(2100, year));
  for (let i = 0; i < TL_ANCHORS.length - 1; i++) {
    const [y0, x0] = TL_ANCHORS[i], [y1, x1] = TL_ANCHORS[i + 1];
    if (y <= y1) return 80 + (x0 + (y - y0) / (y1 - y0) * (x1 - x0)) * (width - 120);
  }
  return width - 40;
}

function renderTimeline() {
  const svg = document.getElementById("timelineSvg");
  const nodes = visibleNodes();
  const NS = "http://www.w3.org/2000/svg";

  const traditionsPresent = [];
  for (const n of nodes) {
    if (!traditionsPresent.some(t => t.id === n.tradition)) {
      traditionsPresent.push({ id: n.tradition, name: n.traditionName, color: n.traditionColor });
    }
  }
  traditionsPresent.sort((a, b) =>
    (EPOCHS.find(e => e.id === nodes.find(n => n.tradition === a.id).epoch)?.order ?? 0) -
    (EPOCHS.find(e => e.id === nodes.find(n => n.tradition === b.id).epoch)?.order ?? 0));

  const laneH = 92, topPad = 74, bottomPad = 46;
  const width = 3400;
  const height = topPad + traditionsPresent.length * laneH + bottomPad;
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = "";

  const epochSpans = EPOCHS.map(e => {
    const ys = nodes.filter(n => n.epoch === e.id).map(n => n.year);
    if (!ys.length) return null;
    return { name: e.name, min: Math.min(...ys), max: Math.max(...ys) };
  }).filter(Boolean);

  for (const span of epochSpans) {
    const rect = document.createElementNS(NS, "rect");
    const x0 = tlX(span.min, width), x1 = tlX(span.max, width);
    rect.setAttribute("x", x0); rect.setAttribute("y", 8);
    rect.setAttribute("width", Math.max(2, x1 - x0)); rect.setAttribute("height", height - bottomPad + 20);
    rect.setAttribute("class", "tl-epoch-band"); rect.setAttribute("rx", 10);
    svg.appendChild(rect);
    const label = document.createElementNS(NS, "text");
    label.setAttribute("x", x0 + 6); label.setAttribute("y", 26);
    label.setAttribute("class", "tl-epoch-label");
    label.textContent = span.name;
    svg.appendChild(label);
  }

  const axisY = height - bottomPad + 6;
  const axis = document.createElementNS(NS, "line");
  axis.setAttribute("x1", 40); axis.setAttribute("x2", width - 20);
  axis.setAttribute("y1", axisY); axis.setAttribute("y2", axisY);
  axis.setAttribute("class", "tl-axis");
  svg.appendChild(axis);
  for (const year of [-10000, -5000, -3000, -2000, -1000, -500, 1, 500, 1000, 1500, 1700, 1800, 1900, 1950, 2000, 2050]) {
    const x = tlX(year, width);
    const tick = document.createElementNS(NS, "line");
    tick.setAttribute("x1", x); tick.setAttribute("x2", x);
    tick.setAttribute("y1", axisY); tick.setAttribute("y2", axisY + 7);
    tick.setAttribute("class", "tl-axis");
    svg.appendChild(tick);
    const label = document.createElementNS(NS, "text");
    label.setAttribute("x", x); label.setAttribute("y", axisY + 22);
    label.setAttribute("text-anchor", "middle"); label.setAttribute("class", "tl-tick");
    label.textContent = year <= 0 ? `${Math.abs(year)} p.n.e.` : `${year}`;
    svg.appendChild(label);
  }

  const laneById = new Map();
  traditionsPresent.forEach((t, i) => {
    const y = topPad + i * laneH;
    laneById.set(t.id, y);
    const label = document.createElementNS(NS, "text");
    label.setAttribute("x", 12); label.setAttribute("y", y + 26);
    label.setAttribute("class", "tl-lane-label");
    label.textContent = t.name;
    svg.appendChild(label);
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", 12); line.setAttribute("x2", width - 20);
    line.setAttribute("y1", y + 34); line.setAttribute("y2", y + 34);
    line.setAttribute("stroke", t.color); line.setAttribute("stroke-opacity", ".18");
    svg.appendChild(line);
  });

  const byTrad = new Map();
  for (const n of nodes) {
    if (!byTrad.has(n.tradition)) byTrad.set(n.tradition, []);
    byTrad.get(n.tradition).push(n);
  }
  for (const [trId, list] of byTrad) {
    list.sort((a, b) => a.year - b.year);
    const laneY = laneById.get(trId);
    const color = (TRADITION_BY_ID[trId] || {}).color || "#888";
    if (list.length > 1) {
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", `M ${tlX(list[0].year, width)} ${laneY + 34}` +
        list.slice(1).map(n => ` L ${tlX(n.year, width)} ${laneY + 34}`).join(""));
      path.setAttribute("class", "tl-flow"); path.setAttribute("stroke", color);
      svg.appendChild(path);
    }
    list.forEach((n, i) => {
      const x = tlX(n.year, width), y = laneY + 34 + (i % 2 ? -14 : 14);
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "tl-node");
      g.dataset.id = n.id;
      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("cx", x); circle.setAttribute("cy", y); circle.setAttribute("r", 7);
      circle.setAttribute("fill", color);
      circle.setAttribute("stroke", n.id === state.selectedId ? "#f0cf8e" : "#0b0a14");
      circle.setAttribute("stroke-width", n.id === state.selectedId ? 2.5 : 1.5);
      const title = document.createElementNS(NS, "title");
      title.textContent = `${n.name}\n${n.authors}\n${n.period}`;
      g.appendChild(circle); g.appendChild(title);
      svg.appendChild(g);
      g.addEventListener("click", () => selectNode(n.id));
      if (i % 2 === 0 || list.length <= 6) {
        const label = document.createElementNS(NS, "text");
        label.setAttribute("x", x + 10); label.setAttribute("y", y + 4);
        label.setAttribute("class", "tl-label" + (state.query ? " hit" : ""));
        label.textContent = n.name.length > 34 ? n.name.slice(0, 33) + "…" : n.name;
        svg.appendChild(label);
      }
    });
  }
  renderLegend(traditionsPresent);
}
function renderLegend(traditions) {
  const el = document.getElementById("timelineLegend");
  el.innerHTML = traditions.map(t =>
    `<span class="legend-item"><span class="legend-swatch" style="background:${t.color}"></span>${esc(t.name)}</span>`).join("");
}

/* ---------------- katalog -------------------------------------------------- */
function renderCatalog() {
  const grid = document.getElementById("catalogGrid");
  const nodes = visibleNodes();
  document.getElementById("catalogCount").textContent = `${nodes.length} z ${state.nodes.length} systemów`;
  grid.innerHTML = "";
  for (const n of nodes) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = n.id;
    card.innerHTML = `
      <div class="card-head">
        <span class="card-title">${highlight(n.name)}</span>
        <span class="card-year">${yearLabel(n.year)}</span>
      </div>
      <div class="badge-row">
        <span class="badge"><span class="trad-dot" style="background:${n.traditionColor};color:${n.traditionColor}"></span>${esc(n.traditionName)}</span>
        <span class="badge">${esc(n.epochName)}</span>
      </div>
      <div class="card-desc">${esc(n.description)}</div>
      <div class="node-sub">${esc(n.authors)}</div>`;
    card.addEventListener("click", () => selectNode(n.id));
    grid.appendChild(card);
  }
}

/* ---------------- panel szczegółów ---------------------------------------- */
function selectNode(id) {
  state.selectedId = id;
  const n = state.nodes.find(x => x.id === id);
  if (!n) return;
  document.getElementById("drawerEpoch").textContent = `${n.epochName} · ${yearLabel(n.year)}`;
  document.getElementById("drawerTitle").textContent = n.name;
  document.getElementById("drawerBadges").innerHTML = `
    <span class="badge"><span class="trad-dot" style="background:${n.traditionColor};color:${n.traditionColor}"></span>${esc(n.traditionName)}</span>
    <span class="badge">${esc((state.packages.find(p => p.packageId === n.packageId) || {}).packageName || n.packageId)}</span>`;
  const section = (title, body) => body ? `<div class="drawer-section"><h3>${title}</h3><p>${esc(body)}</p></div>` : "";
  document.getElementById("drawerBody").innerHTML = `
    <div class="drawer-section"><h3>Opis</h3><p>${esc(n.description) || "—"}</p></div>
    ${section("Autorzy / źródło", n.authors)}
    ${section("Epoka / okres", n.period)}
    ${section("Techniki i kluczowe pojęcia", n.techniques)}
    ${section("Zastosowania", n.applications)}
    <div class="drawer-section"><h3>Referencje</h3><p class="refs">${esc(n.references) || "—"}</p></div>`;
  document.getElementById("drawer").classList.add("open");
  document.getElementById("drawer").setAttribute("aria-hidden", "false");
  document.querySelectorAll(".node-row.selected, .card.selected").forEach(el => el.classList.remove("selected"));
  document.querySelectorAll(`[data-id="${CSS.escape(id)}"]`).forEach(el => el.classList.add("selected"));
}
function closeDrawer() {
  document.getElementById("drawer").classList.remove("open");
  document.getElementById("drawer").setAttribute("aria-hidden", "true");
}

/* ---------------- statystyki i filtry -------------------------------------- */
function renderStats() {
  const nodes = visibleNodes();
  const epochs = new Set(nodes.map(n => n.epoch)).size;
  const trads = new Set(nodes.map(n => n.tradition)).size;
  document.getElementById("stats").textContent =
    `${nodes.length} systemów · ${epochs} epok · ${trads} strumieni`;
}

function populateFilters() {
  const selEpoch = document.getElementById("filterEpoch");
  const selTrad = document.getElementById("filterTradition");
  const selPkg = document.getElementById("filterPackage");
  const keep = (sel, val) => { sel.dataset.keep = val; };
  keep(selEpoch, state.filters.epoch); keep(selTrad, state.filters.tradition); keep(selPkg, state.filters.pkg);
  selEpoch.innerHTML = '<option value="">Wszystkie epoki</option>' +
    EPOCHS.map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join("");
  const trads = [...new Set(state.nodes.map(n => n.tradition))];
  selTrad.innerHTML = '<option value="">Wszystkie tradycje</option>' +
    trads.map(t => `<option value="${t}">${esc((TRADITION_BY_ID[t] || {}).name || t)}</option>`).join("");
  selPkg.innerHTML = '<option value="">Wszystkie paczki</option>' +
    state.packages.map(p => `<option value="${esc(p.packageId)}">${esc(p.packageName)}</option>`).join("");
  selEpoch.value = state.filters.epoch; selTrad.value = state.filters.tradition; selPkg.value = state.filters.pkg;
}

/* ---------------- render główny -------------------------------------------- */
function renderAll() {
  renderStats();
  populateFilters();
  const q = norm(state.query).trim();
  const hasFilter = q || state.filters.epoch || state.filters.tradition || state.filters.pkg;
  if (hasFilter && state.view === "tree") {
    for (const n of visibleNodes()) {
      state.expanded.add(`epoch:${n.epoch}`);
      state.expanded.add(`trad:${n.epoch}:${n.tradition}`);
    }
  }
  renderTree();
  renderTimeline();
  renderCatalog();
  const empty = document.getElementById("emptyState");
  empty.hidden = !(hasFilter && visibleNodes().length === 0);
  document.getElementById("pkgCount").textContent = state.packages.length;
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.view === view));
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${view}`));
}

function toast(msg, ms = 3200) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.hidden = true; }, ms);
}

/* ---------------- paczki danych -------------------------------------------- */
function addPackage(pkg, base = false) {
  pkg.base = base;
  state.packages.push(pkg);
  if (!base) {
    const extras = loadExtraPackages().filter(p => p.packageId !== pkg.packageId);
    extras.push(pkg);
    saveExtraPackages(extras);
  }
  rebuild();
  renderAll();
}
function renderPackageModal() {
  const list = document.getElementById("packageList");
  list.innerHTML = "";
  for (const p of state.packages) {
    const item = document.createElement("div");
    item.className = "package-item";
    item.innerHTML = `
      <div>
        <div class="pkg-name">${esc(p.packageName)}</div>
        <div class="pkg-meta">${p.nodes.length} węzłów · id: ${esc(p.packageId)}</div>
      </div>
      ${p.base ? '<span class="badge badge-base">baza</span>'
               : `<button class="btn btn-danger" data-remove="${esc(p.packageId)}">Usuń</button>`}`;
    const btn = item.querySelector("[data-remove]");
    if (btn) btn.addEventListener("click", () => {
      state.packages = state.packages.filter(x => x.packageId !== p.packageId);
      saveExtraPackages(state.packages);
      rebuild(); renderAll(); renderPackageModal();
      toast(`Usunięto paczkę: ${p.packageName}`);
    });
    list.appendChild(item);
  }
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result);
      let pkg;
      const baseName = file.name.replace(/\.(md|markdown|json)$/i, "");
      const pkgId = `pkg-${slug(baseName)}-${Date.now().toString(36)}`;
      if (/\.json$/i.test(file.name)) {
        pkg = normalizeJsonPackage(JSON.parse(text), pkgId, baseName);
      } else {
        pkg = mdToPackage(text, baseName, pkgId);
      }
      addPackage(pkg);
      renderPackageModal();
      toast(`Wczytano paczkę „${pkg.packageName}": ${pkg.nodes.length} nowych węzłów`);
      const modal = document.getElementById("modalPackages");
      if (!modal.hidden) renderPackageModal();
    } catch (err) {
      toast(`Błąd importu: ${err.message}`, 6000);
    }
  };
  reader.readAsText(file, "utf-8");
}

function exportAll() {
  const out = {
    format: "arbor-arcana-encyclopedia/v1",
    exportedAt: new Date().toISOString(),
    packages: state.packages.map(p => ({ packageId: p.packageId, packageName: p.packageName, nodes: p.nodes })),
  };
  const blob = new Blob([JSON.stringify(out, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "arbor-arcana-encyklopedia.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Wyeksportowano scalone dane JSON");
}

/* ---------------- zdarzenia ------------------------------------------------- */
function initEvents() {
  document.querySelectorAll(".tab").forEach(t =>
    t.addEventListener("click", () => setView(t.dataset.view)));

  const search = document.getElementById("globalSearch");
  const clearBtn = document.getElementById("searchClear");
  search.addEventListener("input", () => {
    state.query = search.value;
    clearBtn.hidden = !search.value;
    renderAll();
  });
  clearBtn.addEventListener("click", () => {
    search.value = ""; state.query = ""; clearBtn.hidden = true; renderAll();
  });

  document.getElementById("filterEpoch").addEventListener("change", e => { state.filters.epoch = e.target.value; renderAll(); });
  document.getElementById("filterTradition").addEventListener("change", e => { state.filters.tradition = e.target.value; renderAll(); });
  document.getElementById("filterPackage").addEventListener("change", e => { state.filters.pkg = e.target.value; renderAll(); });

  document.getElementById("btnExpandAll").addEventListener("click", () => {
    state.rootExpanded = true;
    for (const n of state.nodes) {
      state.expanded.add(`epoch:${n.epoch}`);
      state.expanded.add(`trad:${n.epoch}:${n.tradition}`);
    }
    renderTree();
  });
  document.getElementById("btnCollapseAll").addEventListener("click", () => {
    state.expanded.clear(); state.rootExpanded = true; renderTree();
  });

  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeDrawer(); hideModal(); }
  });

  const fileInput = document.getElementById("fileInput");
  document.getElementById("btnAddPackage").addEventListener("click", () => fileInput.click());
  document.getElementById("btnAddPackage2").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
    fileInput.value = "";
  });

  document.getElementById("btnExport").addEventListener("click", exportAll);

  const modal = document.getElementById("modalPackages");
  const hideModal = () => { modal.hidden = true; };
  window.hideModal = hideModal;
  document.getElementById("btnPackages").addEventListener("click", () => { renderPackageModal(); modal.hidden = false; });
  document.getElementById("modalClose").addEventListener("click", hideModal);
  modal.addEventListener("click", e => { if (e.target === modal) hideModal(); });

  document.getElementById("btnResetPackages").addEventListener("click", () => {
    state.packages = state.packages.filter(p => p.base);
    saveExtraPackages([]);
    rebuild(); renderAll(); renderPackageModal();
    toast("Przywrócono dane bazowe");
  });
}

/* ---------------- start ------------------------------------------------------ */
async function init() {
  initEvents();
  try {
    const res = await fetch("data/astrologia-rdzen.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const base = normalizeJsonPackage(
      { nodes: json.nodes, packageName: json.packageName },
      json.packageId || "astrologia-rdzen",
      json.packageName || "Systemy i Techniki Astrologiczne"
    );
    addPackage(base, true);
  } catch (err) {
    toast(`Nie udało się wczytać danych bazowych: ${err.message}. Uruchom aplikację przez serwer HTTP (np. python3 -m http.server).`, 8000);
  }
  for (const extra of loadExtraPackages()) {
    try { addPackage(normalizeJsonPackage(extra, extra.packageId, extra.packageName), true); }
    catch { /* pomiń uszkodzoną paczkę */ }
  }
  renderAll();
}
init();
