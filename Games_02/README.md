# FlowPath — Sustainable Irrigation (web game)

A browser puzzle game for a research study on **learning sustainability through game design**. Players carve water channels on a bird's-eye map across six real-world river basins, balancing **path length, elevation/pumping, slope/erosion, pollution, and drainage reuse** to design the lowest-cost *sustainable* irrigation route.

Built per the approved `game-plan.md` and your answers (Q1 pumping-with-cost, Q2 real places, Q3 ages 18+, Q5 six levels, Q7 dynamic weather, Q8 telemetry).

---

## How to run

**Option A — simplest (no install):**
1. Open the folder `D:\ClaudeProjects\Games_02`.
2. Double-click **`index.html`**. It opens in your default browser and runs. (No build step, no internet needed.)

**Option B — local server** (use this if your browser blocks anything on `file://`):
- If you install Node later: `npx serve` in this folder, then open the shown URL.
- Or Python (if installed): `python -m http.server` then open `http://localhost:8000`.

The game uses **plain `<script>` tags (no ES modules)** specifically so Option A works by double-clicking.

---

## How to play
1. Read the level intro (a real place + a sourced real-world fact).
2. **Click & drag** on the map to carve a channel from the **blue source 💧** to the **green farm(s) 🌱**. Right-click-drag (or the Erase tool) removes tiles. Keyboard: arrow keys move a cursor, **Space** carves, **X** erases.
3. Watch the **cost breakdown** update live (length / pumping / lining / reuse).
4. Press **▶ Test flow**. Water animates through each **weather season**; your design must work in **every** season.
5. Win = reach all farms + water quality ≥ threshold + within budget. Earn ★–★★★ by cost efficiency. Retry freely.

---

## The six levels (each inspired by a real, documented challenge)

| # | Place | What it teaches | Verified fact (see Sources) |
|---|---|---|---|
| 1 | Banaue Rice Terraces, Philippines | Gravity / downhill flow; cost = length | Gravity-fed terraces channel water down from ~1,500 m watersheds |
| 2 | California Central Valley, USA | Pumping water uphill is costly; find the low pass | California Aqueduct lifts water 587 m over the Tehachapis (Edmonston plant) |
| 3 | Mekong Delta, Vietnam | Route around pollution; weather spreads it | Pesticides highest in canal waters; 70k–100k t/yr; floods wet season |
| 4 | Indus Basin, Pakistan | Reuse drainage; avoid flat waterlogging | Gravity system without drainage waterlogged/salinised ~4.5 M ha |
| 5 | Nile Delta, Egypt | Too flat to gravity-feed → must pump; dodge sewage | Delta too flat for gravity irrigation; drains carry effluent; salinity 250→2,700 ppm |
| 6 | Murray–Darling Basin, Australia | Capstone: tight budget, many farms, salinity | Basin Plan diverts ~20% less water for irrigation |

> **Honesty note:** levels are **stylized puzzles inspired by** each site's real documented challenge — **not literal topographic maps**. Elevation/pollutant placements are simplified for play. The fact blurbs and the table below are real and sourced.

---

## Domain accuracy & sources (verified via web search, June 2026)

**Engineering model:**
- Gravity-fed irrigation needs the source above the use point; water flows downhill — *DripWorks; BlueBarrel Systems.*
- Irrigation cost is dominated by capital + **pumping energy**, which scales with **lift (elevation) and length/friction** — *Univ. of Nebraska–Lincoln Irrigation Course Ch.13; Michigan State Extension.*
- Channels too steep erode (need lining/drop structures); too flat won't drain — *FAO water-transport structures; open-channel design manuals.*
- Agricultural pollutants (pesticides, sediment, nutrients, salts) enter water via runoff, worsened by over-irrigation — *US EPA Agricultural Runoff; USGS Agricultural Contaminants.*

**Locations:**
- Banaue — *UNESCO; Britannica (Rice Terraces of the Philippine Cordilleras).*
- California Central Valley / Aqueduct — *Wikipedia (California Aqueduct); Californians for Pesticide Reform; CA State Water Board.*
- Mekong Delta — *PubMed (pesticides in Mekong drinking water); VESDEC; UNDP flooding report.*
- Indus Basin — *ScienceDirect & Nature Scientific Reports (salinity/waterlogging in the Indus Basin).*
- Nile Delta — *IRD/ScienceDirect (Nile Delta irrigation & water quality); Wikipedia (Water resources management in Egypt).*
- Murray–Darling — *Murray–Darling Basin Authority; MDPI Water (salinity management).*

Full URLs are listed in `sources.doc` / `sources.md` in this folder.

---

## Cost & scoring model (from game-plan §3.3)
```
TotalCost = length*2 + uphillLift*4 + steepSegments*6 - drainageReused*3 + waterlogPenalty
WaterQuality = 100 - 22 per carved tile inside a pollutant radius   (must stay >= level threshold)
Pass = all farms reached AND quality OK AND cost <= budget, in EVERY weather season
Stars = cost/budget <= 0.55 -> 3,  <= 0.8 -> 2,  else 1
```
All coefficients live in `js/levels.js` (`COST` object) and each level's `budget`/`qualityThreshold` — **easy to tune**.

> **Balance caveat:** I could not playtest in a browser from this environment (no Node/automation to observe the running game). The levels are designed to be solvable with generous budgets, but **numbers may need tuning after you click through them**. Every value is a single editable number in `js/levels.js`. Tell me what feels too easy/hard and I'll rebalance.

---

## Research telemetry (Q8)
- Every **Test flow** attempt is logged: timestamp, session id, level, carved path, cost breakdown, per-season delivery/quality, pass/fail, fail reasons.
- Stored in the browser (`localStorage`) and **exported as JSON** via **⬇ Export attempts** (sidebar) or at the end. Nothing leaves the machine unless you export.
- This gives you per-player decision traces — usable as qualitative/quantitative study data (e.g., how many attempts before students discover the low-pass or the pollution detour).

---

## File structure
```
Games_02/
  index.html          # markup, HUD, panel, modal
  css/style.css       # colorblind-safe styling, layout
  js/levels.js        # six levels (real places + sourced facts) + cost constants
  js/grid.js          # tile model + canvas rendering
  js/simulation.js    # flow BFS, cost/quality, weather loop
  js/telemetry.js     # research logging + JSON export
  js/ui.js            # HUD / breakdown / modal updates
  js/main.js          # input, state machine, test animation
  game-plan.md/.doc   # the approved plan
  README.md           # this file
```

## Accessibility notes (mouse-first, with alternatives)
- Color is never the only cue: source/farm/pollutant/obstacle each have an **icon**; pollutant zones add a **hatch pattern**; elevation uses a **single-hue shade** (not a rainbow).
- **Keyboard alternative** for carving (arrows + Space/X). Live status messages use `aria-live`.
- *Not done:* a formal screen-reader pass / automated WCAG audit (no audit tooling in the build environment). The canvas game is inherently visual; if you need full non-visual play, that's a larger redesign — flag it and we can scope it.

## Known limitations / next steps
- Balance needs your playthrough (see caveat above).
- Weather is a discrete season cycle, not continuous simulation (sufficient for the learning goals; can be deepened).
- Branching to multiple farms works via the channel network; there's no explicit "split here" UI beyond carving a branching shape.
