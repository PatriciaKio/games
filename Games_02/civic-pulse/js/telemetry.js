/* =====================================================================
   Civic Pulse — telemetry.js
   Research logging (enabled per your Q8 = yes). Records one entry per turn:
   allocations, the event, the triage choice, meter deltas, and outcomes.
   Stored in localStorage and exportable as JSON. Nothing leaves the machine
   unless you click "Export". Gives per-player decision traces for the study.
   ===================================================================== */
const Telemetry = (() => {
  const KEY = "civicPulse.telemetry.v1";
  let sessionId = "sess-" + Date.now() + "-" + Math.floor(Math.random() * 1e6);
  let log = [];

  function reset() {
    sessionId = "sess-" + Date.now() + "-" + Math.floor(Math.random() * 1e6);
    log = [];
  }

  // record a completed turn
  function recordTurn(entry) {
    log.push(Object.assign({ sessionId, ts: new Date().toISOString() }, entry));
    try { localStorage.setItem(KEY, JSON.stringify(log)); } catch (e) { /* private mode */ }
  }

  function recordEnd(summary) {
    log.push(Object.assign({ sessionId, ts: new Date().toISOString(), kind: "END" }, summary));
    try { localStorage.setItem(KEY, JSON.stringify(log)); } catch (e) {}
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "civic-pulse-telemetry-" + sessionId + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function count() { return log.filter(e => e.kind !== "END").length; }

  return { reset, recordTurn, recordEnd, exportJSON, count, get sessionId() { return sessionId; } };
})();
