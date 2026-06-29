/* =====================================================================
   Civic Pulse — state.js
   Game state container + small pure helpers (composite social capital,
   clamping, season/year math). No DOM here.
   ===================================================================== */
const Game = {
  state: null,

  init() {
    this.state = {
      turn: 1,
      budget: BALANCE.startBudget,
      meters: { bonding: 45, bridging: 40, linking: 40, hardiness: 45, approval: 55 },
      shocksSurvived: 0,
      perfectAbsorptions: 0,
      negBudgetStreak: 0,
      cityVitality: 60,
      alloc: {},            // line item -> $ allocated this turn
      phase: "budget",      // budget | event | triage | aftermath | gameover
      currentEvent: null,
      lastOutcome: null,
      gameOver: false,
      result: null,         // "impeached" | "bankrupt" | "complete"
      gold: false,
    };
    this.resetAlloc();
    Telemetry.reset();
    return this.state;
  },

  resetAlloc() {
    const a = {};
    for (const k in BALANCE.spend) if (k !== "reserve") a[k] = 0;
    this.state.alloc = a;
  },

  allocated(s) {
    let sum = 0;
    for (const k in s.alloc) sum += s.alloc[k];
    return sum;
  },

  available(s) { return s.budget - this.allocated(s); },

  // composite Social Capital (0..100) from the three sub-meters
  composite(s) {
    const w = BALANCE.socialWeights;
    return s.meters.bonding * w.bonding + s.meters.bridging * w.bridging + s.meters.linking * w.linking;
  },

  // weighted social capital for a specific event's vulnerability profile
  weightedSocial(s, ev) {
    const sw = ev.socialW;
    const total = sw.bonding + sw.bridging + sw.linking || 1;
    return (s.meters.bonding * sw.bonding +
            s.meters.bridging * sw.bridging +
            s.meters.linking * sw.linking) / total;
  },

  clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); },

  clampMeters(s) {
    for (const k in s.meters) s.meters[k] = this.clamp(s.meters[k], 0, 100);
  },

  year(s)   { return Math.floor((s.turn - 1) / 4) + 1; },
  quarter(s){ return ((s.turn - 1) % 4) + 1; },

  eventForTurn(turn) {
    return EVENTS.schedule.find(e => e.turn === turn) ||
           EVENTS.schedule[EVENTS.schedule.length - 1];
  },
};
