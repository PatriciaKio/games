# Civic Pulse — Steward of the Storm

A browser management sim for a research study on **learning sustainability / social infrastructure through game design**. You are the Mayor of **Oakhaven** (a stylized stand-in for **Chicago**) across a **4-year term = 16 seasons**. Each season runs the real disaster-management cycle — **Assess & Budget → Shock → Triage → Aftermath** — and the central lesson is mechanically true, not flavor text: **short-term financial "efficiency" creates long-term vulnerability, and social capital is real infrastructure.**

Built per `../civic-pulse-plan.md` and the resolved decisions (real Chicago events on a seasonal cycle; 3 social-capital sub-meters; Approval/impeachment; telemetry on; 16 turns; 18+).

---

## How to run
**Simplest (no install):** open `D:\ClaudeProjects\Games_02\civic-pulse\` and **double-click `index.html`** — it runs in your browser. Plain `<script>` tags, no framework, no build step, no internet needed.

**If your browser blocks `file://`:** run a static server in this folder and open the shown URL:
- `python -m http.server` → http://localhost:8000
- or `npx serve`

---

## How to play
1. **Assess & Budget** — allocate this season's funds with +/− across line items. Some build **Hardiness** (infrastructure), some build **Social Capital** (Bonding / Bridging / Linking), and one — **PR / ribbon-cuttings** — buys instant **Approval** but *zero* resilience (the trap). Unspent money stays as reserve.
2. **The Shock** — a real, sourced Chicago event fires (or a quiet season).
3. **Triage** — choose a response: a costly visible rescue, or trust the community to carry it (cheap, but only works if your social capital is high).
4. **The Aftermath** — see damage, chaos, recovery cost, approval shift, and **the Hidden Ledger** — the counterfactual that quantifies what your earlier cuts actually cost.

**Lose:** Approval below the impeach line (the Bilandic ending) **or** bankrupt for two straight seasons.
**Win:** finish the term. **Gold "Resilient City"** = composite Social Capital > 80 **and** ≥ 3 major shocks survived.
**The real win** (Perfect Absorption badge): a shock where the community **self-recovered before you had to act**.

---

## The 16-season schedule & event sources

All events are **real, sourced Chicago facts**; severities/chaos are tunable design knobs. Verification detail and URLs are in **`civic-pulse-sources.md`**.

| Turn | Season | Event | Real fact (abbrev.) | Source |
|---|---|---|---|---|
| 1 | Spring | Sewers back up | Combined sewers overflow into basements; Deep Tunnel built to capture it | MWRD (TARP) |
| 2 | Summer | Heat advisory | Heat is Chicago's deadliest weather hazard; cooling centers as first response | City of Chicago / WTTW |
| 3 | Fall | *(quiet)* | Budget-and-breathe season | — |
| 4 | Winter | First snow | Mayors are judged on clearing **side** streets, not just arterials | WTTW / Chicago Mag |
| 5 | Spring | 100-year storm (**major**) | April 2013 floods → federal disaster declaration; **$83.6M** CDBG-DR to suburban Cook; ~**$1.8B** losses 2004–14 | Cook County / WTTW / phys.org |
| 6 | Summer | Muggy stretch | Post-1995 heat plan exists, but a 2025 review found residents still at risk | Axios Chicago |
| 7 | Fall | Steel mill closes (**major**) | Jan 9 1992 U.S. Steel **South Works** closure; ~20,000 peak → <700 at close | Wikipedia / Forgotten Chicago |
| 8 | Winter | Heavy snow | Stranded buses + unplowed streets become a referendum on competence | WTTW |
| 9 | Spring | Deep Tunnel overwhelmed | ~**$3.8B**, ~109 mi of tunnels still can't handle the worst storms | phys.org / MWRD |
| 10 | Summer | **THE HEAT WAVE** (**major**) | July 1995: **739** deaths; Englewood **33/100k** vs Auburn Gresham **3/100k** — social infrastructure | Klinenberg, *Heat Wave*; CNU |
| 11 | Fall | *(quiet)* | The city exhales | — |
| 12 | Winter | Deep freeze | Prevention (pre-positioned crews) vs reaction (dig out after) | Chicago history |
| 13 | Spring | Major flood | Urban flooding now recurs yearly in the same low wards | MWRD |
| 14 | Summer | Heat dome | Climate projections → more 1995-scale heat; invest beforehand | Scientific American |
| 15 | Fall | Economic aftershock | Anchor-industry loss compounds for years; bridging/linking decide who recovers | The Conversation |
| 16 | Winter | **THE BLIZZARD** (**major**) | Jan 1979: botched snow response cost Mayor **Bilandic** re-election; Byrne's "Is this the city that works?" | Chicago Mag / WTTW |

> **Fact-check note (important):** an earlier draft of this game asserted "insurers paid **$647M** on 72,864 Cook County claims" for the 2013 flood. **I could not verify that figure** in any source, so it was **removed** and replaced with verified figures ($83.6M federal CDBG-DR; ~$1.8B 2004–14 losses). See `civic-pulse-sources.md`.

---

## Cost / scoring model (all knobs in `js/balance.js`)
```
PhysicalDamage = baseSeverity * (1 - Hardiness/100 * HARDINESS_MITIGATION * event.hardinessW)
Chaos          = baseChaos    * (1 - weightedSocial/100 * SOCIAL_BUFFER) * (1 - triage.chaosCut)
RecoveryCost   = PhysicalDamage * RECOVERY_RATE * (1 - weightedSocial/100 * RECOVERY_DISCOUNT)
ApprovalShift  = triage.approval - Chaos * chaosApprovalLoss
PerfectAbsorption = community-triage chosen AND weightedSocial >= 62 AND residual Chaos <= 5
FinalScore     = f(composite social, hardiness, approval, shocks survived, perfect absorptions, budget)
```
- `weightedSocial` blends Bonding/Bridging/Linking using **per-event weights** (heat leans on bonding; blizzard/flood on linking; economic on bridging) — the evidence-based *direction*.

> **Balance caveat (read this):** **every number in `balance.js` and the events' severity/chaos values is an invented design knob**, chosen for playability — **not** a real measurement. Only the *direction* of effects is evidence-based (prevention pays back severalfold; social capital lowers recovery cost & buffers chaos). The numbers **need human playtest tuning**. I could not fully playtest in this environment (see below).

---

## Telemetry (research data)
Per-turn logging is **on**: each turn records allocations, the event, the triage choice (incl. whether it was the community path), meter deltas, outcomes, and budget. Stored in `localStorage`; **export as JSON** from the end screen (nothing leaves the machine unless you export). This yields per-player decision traces — e.g., how many turns before a player stops over-funding visible PR.

---

## Accessibility
- **Colorblind-safe:** every meter and state pairs color with an **icon + number + label**; map decay uses brightness/grayscale + a warning pulse, not hue alone.
- **Motion:** a `prefers-reduced-motion` media query disables weather particles, shake, flash, and confetti for users who request reduced motion.
- **Contrast:** dark theme targeting WCAG 2.1 AA for text.
- *Not done:* keyboard-only play of the budget steppers is partial (buttons are focusable, but there's no full keyboard map yet), and there's **no automated WCAG audit / screen-reader pass** in this build environment. Flag if you need full keyboard/AT support — that's a focused follow-up.

## Graphics / "fun" layer
`js/effects.js` adds **seasonal weather** (rain/snow/falling leaves/heat shimmer), **screen-shake + red flash** on major shocks and heavy damage, a **green flash** on community self-recovery, and **confetti** on a gold win. It's purely decorative and guarded — if it ever errors it cannot affect game logic.

## File structure
```
civic-pulse/
  index.html
  css/style.css
  js/balance.js     # ALL tunable knobs (edit here to retune)
  js/events.js      # the 16 sourced Chicago events
  js/state.js       # state + helpers (composite social capital, season math)
  js/engine.js      # phase resolution, Hidden Ledger, win/lose
  js/ui.js          # all DOM rendering
  js/telemetry.js   # per-turn logging + JSON export
  js/effects.js     # weather/shake/flash/confetti (decoration only)
  js/main.js        # phase state machine + input
  README.md, civic-pulse-sources.md
```

## Verification status / what still needs a human
- **Code:** reviewed for consistency across modules; the logic layer (balance/state/engine/events) is internally coherent. I **could not execute it** in this environment (no Node/headless to observe the running DOM), so:
- **Needs a human playtest:** (1) confirm a full 16-turn run completes and both lose conditions trigger; (2) **balance tuning** — whether the prevention strategy actually out-scores the PR strategy, and whether gold is achievable but not trivial; (3) the weather/confetti effects render as intended across browsers.
