/* =====================================================================
   Civic Pulse — main.js
   Phase flow + input handlers. Owns the turn state machine:
   budget -> event -> (triage) -> aftermath -> next turn ... -> gameover.
   Also records telemetry per turn.
   ===================================================================== */
const Main = {
  // snapshot of meters at the start of a turn, for telemetry deltas
  _turnStart: null,

  start() {
    const s = Game.init();
    this.beginTurn(s);
    UI.frame(s);
    this.hideModal();
  },

  restart() { this.start(); },

  // ---- begin a turn: decay, fresh allocations, show budget phase ----
  beginTurn(s) {
    if (s.turn > 1) Engine.applyDecay(s);
    Game.resetAlloc();
    this._turnStart = JSON.parse(JSON.stringify(s.meters));
    s.phase = "budget";
    UI.renderBudget(s);
    UI.frame(s);
    if (window.FX) { const ev = Game.eventForTurn(s.turn); FX.setSeason(ev && ev.season); }
  },

  // ---- budget allocation ----
  alloc(item, dir) {
    const s = Game.state;
    const step = BALANCE.allocStep * dir;
    const next = (s.alloc[item] || 0) + step;
    if (next < 0) return;
    if (dir > 0 && Game.available(s) < BALANCE.allocStep) return;
    s.alloc[item] = next;
    UI.renderBudget(s);
    UI.frame(s);
  },

  resetBudget() { const s = Game.state; Game.resetAlloc(); UI.renderBudget(s); UI.frame(s); },

  lockBudget() {
    const s = Game.state;
    this._allocSnapshot = JSON.parse(JSON.stringify(s.alloc));
    Engine.applyBudget(s);
    s.phase = "event";
    s.currentEvent = Game.eventForTurn(s.turn);
    s.lastOutcome = null;
    UI.renderEvent(s, s.currentEvent);
    UI.frame(s);
    if (window.FX && s.currentEvent && s.currentEvent.major) { FX.shake(); FX.flash("bad"); }
  },

  // ---- quiet season: no shock, straight to end-of-turn ----
  afterQuiet() {
    const s = Game.state;
    this.recordTurn(s, s.currentEvent, null, null);
    this.endTurn(s);
  },

  toTriage() {
    const s = Game.state;
    s.phase = "triage";
    UI.renderTriage(s, s.currentEvent);
  },

  choose(i) {
    const s = Game.state;
    const ev = s.currentEvent;
    const outcome = Engine.resolveShock(s, ev, i);
    this.recordTurn(s, ev, i, outcome);
    s.phase = "aftermath";
    UI.renderAftermath(s, outcome);
    UI.frame(s);
    if (window.FX) {
      if (outcome.perfect) FX.flash("good");
      else if (outcome.phys >= 25 || outcome.chaos >= 18) { FX.shake(); FX.flash("bad"); }
    }
  },

  nextTurn() { this.endTurn(Game.state); },

  // ---- close the turn: check win/lose, advance or end ----
  endTurn(s) {
    const ended = Engine.checkEnd(s);
    if (ended) {
      Telemetry.recordEnd({
        result: s.result, gold: s.gold, score: Engine.finalScore(s),
        finalMeters: s.meters, shocksSurvived: s.shocksSurvived,
        perfectAbsorptions: s.perfectAbsorptions, budget: Math.round(s.budget),
      });
      s.phase = "gameover";
      UI.renderGameOver(s);
      UI.frame(s);
      if (window.FX && s.gold) FX.confetti();
      return;
    }
    s.turn++;
    this.beginTurn(s);
  },

  // ---- telemetry: one row per turn ----
  recordTurn(s, ev, choiceIndex, outcome) {
    const deltas = {};
    for (const k in s.meters) deltas[k] = round2(s.meters[k] - (this._turnStart[k] ?? s.meters[k]));
    Telemetry.recordTurn({
      turn: s.turn, year: Game.year(s), quarter: Game.quarter(s),
      event: ev ? { type: ev.type, title: ev.title, major: ev.major } : null,
      allocations: this._allocSnapshot || {},
      triageChoice: (ev && ev.triage && choiceIndex != null) ? ev.triage[choiceIndex].label : null,
      community: (ev && ev.triage && choiceIndex != null) ? ev.triage[choiceIndex].community : null,
      outcome: outcome ? {
        phys: outcome.phys, chaos: outcome.chaos, recovery: outcome.recovery,
        approvalShift: outcome.approvalShift, perfect: outcome.perfect,
      } : null,
      metersAfter: JSON.parse(JSON.stringify(s.meters)),
      metersDelta: deltas,
      budgetAfter: round2(s.budget),
      compositeSocial: round2(Game.composite(s)),
    });
  },

  // ---- intro modal ----
  showModal() { const m = UI.el("modal"); if (m) m.style.display = "flex"; },
  hideModal() { const m = UI.el("modal"); if (m) m.style.display = "none"; },
};

function round2(x) { return Math.round(x * 10) / 10; }

window.addEventListener("DOMContentLoaded", () => {
  // wire the intro "Begin term" button, then start on demand
  const begin = document.getElementById("beginBtn");
  if (begin) begin.addEventListener("click", () => Main.start());
  // initialize a state so the HUD isn't blank behind the modal
  Game.init();
  UI.frame(Game.state);
});
