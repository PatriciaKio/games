/* telemetry.js — research logging (Q8: yes).
   Records every Test attempt so player decisions can be analysed as study data.
   Stored in-memory + localStorage; exportable as a JSON file. No data leaves the
   machine unless the user clicks Export. */
(function (global) {
  const FP = global.FlowPath;
  const STORE_KEY = 'flowpath_attempts_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  const Telemetry = {
    sessionId: 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
    attempts: load(),

    log(levelId, place, grid, result) {
      const rec = {
        sessionId: this.sessionId,
        ts: new Date().toISOString(),
        levelId, place,
        carvedTiles: grid.carved.size,
        path: Array.from(grid.carved),
        pass: result.pass,
        stars: result.stars,
        score: result.score,
        maxCost: result.maxCost,
        worstQuality: result.worstQuality,
        delivered: result.allDelivered,
        weatherSteps: result.steps.map(s => ({
          weather: s.weather, delivered: s.delivered, quality: s.quality,
          cost: s.breakdown.total, pump: s.pumpUnits, steep: s.steepCount, reuse: s.reuseCount,
        })),
        failReasons: result.reasons,
      };
      this.attempts.push(rec);
      save(this.attempts);
      return rec;
    },

    count() { return this.attempts.length; },

    exportJSON() {
      const blob = new Blob([JSON.stringify({
        exportedAt: new Date().toISOString(),
        sessionId: this.sessionId,
        attemptCount: this.attempts.length,
        attempts: this.attempts,
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flowpath-attempts-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
    },
  };

  FP.Telemetry = Telemetry;
})(window);
