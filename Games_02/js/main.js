/* main.js — bootstrap, input handling, game state machine. No ES modules. */
(function (global) {
  const FP = global.FlowPath;
  const { LEVELS, UI, Telemetry } = FP;
  const $ = id => document.getElementById(id);

  const state = {
    idx: 0,
    grid: null,
    tool: 'carve',     // 'carve' | 'erase'
    dragging: false,
    animating: false,
  };

  function loadLevel(idx, showIntro) {
    state.idx = idx;
    const level = LEVELS[idx];
    const canvas = $('map');
    state.grid = new FP.Grid(canvas, level);
    UI.setHud(level, idx, LEVELS.length);
    UI.setLive(0, 100, 0);
    UI.setBreakdown({ length: 0, pump: 0, line: 0, reuse: 0, flat: 0, total: 0 });
    UI.weatherNames(level);
    UI.message('Carve a channel from 💧 to 🌱, then press “Test flow”.', '');
    state.grid.draw();
    $('btn-prev').disabled = idx === 0;
    $('btn-next').disabled = idx >= LEVELS.length - 1;
    if (showIntro) UI.showModal(level, idx, LEVELS.length, () => {});
  }

  // ---- live cost preview (single weather step 0, no fail-checks) ----
  function livePreview() {
    if (state.animating) return;
    const g = state.grid;
    const res = FP.runTest(g);
    g.contamExtra = 0;
    const s0 = res.steps[0];
    UI.setBreakdown(s0.breakdown);
    UI.setLive(res.maxCost, res.worstQuality, res.pass ? res.stars : 0);
    g.draw();
  }

  // ---- input: carve / erase by dragging ----
  function applyTool(x, y) {
    const g = state.grid;
    if (!g.inBounds(x, y)) return;
    if (state.tool === 'carve') g.carve(x, y); else g.erase(x, y);
  }

  function bindCanvas() {
    const c = $('map');
    const handle = e => {
      const p = state.grid.pixelToTile(e.clientX, e.clientY);
      applyTool(p.x, p.y);
      state.grid.draw();
    };
    c.addEventListener('mousedown', e => {
      if (state.animating) return;
      if (e.button === 2) state.tool = 'erase'; // right-drag erases
      state.dragging = true; handle(e); e.preventDefault();
    });
    c.addEventListener('mousemove', e => { if (state.dragging) handle(e); });
    global.addEventListener('mouseup', () => {
      if (state.dragging) { state.dragging = false; if ($('tool-erase').classList.contains('active')) state.tool = 'erase'; else state.tool = 'carve'; livePreview(); }
    });
    c.addEventListener('contextmenu', e => e.preventDefault());

    // touch
    c.addEventListener('touchstart', e => { state.dragging = true; const t = e.touches[0]; const p = state.grid.pixelToTile(t.clientX, t.clientY); applyTool(p.x, p.y); state.grid.draw(); e.preventDefault(); }, { passive: false });
    c.addEventListener('touchmove', e => { if (!state.dragging) return; const t = e.touches[0]; const p = state.grid.pixelToTile(t.clientX, t.clientY); applyTool(p.x, p.y); state.grid.draw(); e.preventDefault(); }, { passive: false });
    c.addEventListener('touchend', () => { state.dragging = false; livePreview(); });

    // keyboard alternative (accessibility): arrow keys move a cursor, space carves
    state.cursor = { x: LEVELS[0].source0[0], y: LEVELS[0].source0[1] };
    c.addEventListener('keydown', e => {
      const cu = state.cursor;
      if (e.key === 'ArrowRight') cu.x = Math.min(FP.W - 1, cu.x + 1);
      else if (e.key === 'ArrowLeft') cu.x = Math.max(0, cu.x - 1);
      else if (e.key === 'ArrowDown') cu.y = Math.min(FP.H - 1, cu.y + 1);
      else if (e.key === 'ArrowUp') cu.y = Math.max(0, cu.y - 1);
      else if (e.key === ' ' || e.key === 'Enter') { applyTool(cu.x, cu.y); livePreview(); }
      else if (e.key.toLowerCase() === 'x') { state.grid.erase(cu.x, cu.y); livePreview(); }
      else return;
      e.preventDefault();
      state.grid.draw();
      // draw cursor highlight
      const ctx = state.grid.ctx, ts = state.grid.ts;
      ctx.strokeStyle = '#ffd54a'; ctx.lineWidth = 3;
      ctx.strokeRect(cu.x * ts + 2, cu.y * ts + 2, ts - 4, ts - 4);
    });
  }

  // ---- Test flow with weather animation ----
  function runTestAnimated() {
    if (state.animating) return;
    const g = state.grid, level = LEVELS[state.idx];
    const result = FP.runTest(g);

    const rec = Telemetry.log(level.id, level.place, g, result);
    UI.logCount(Telemetry.count());

    state.animating = true;
    let step = 0;
    const playStep = () => {
      if (step >= result.steps.length) {
        state.animating = false;
        g.contamExtra = 0; g.flowTiles.clear(); g.draw();
        UI.setLive(result.maxCost, result.worstQuality, result.pass ? result.stars : 0);
        UI.message(result.pass
          ? `Solved in all ${result.steps.length} season(s)! ${'★'.repeat(result.stars)}`
          : result.reasons[0], result.pass ? 'good' : 'bad');
        UI.showResult(level, state.idx, LEVELS.length, result,
          () => { if (state.idx + 1 < LEVELS.length) loadLevel(state.idx + 1, true); else finishGame(); },
          () => {});
        return;
      }
      const s = result.steps[step];
      g.contamExtra = level.weather[step].contamBoost;
      g.flowTiles = s.reached;
      g.draw();
      UI.weather(result.steps, step);
      UI.setBreakdown(s.breakdown);
      UI.setLive(s.breakdown.total, s.quality, 0);
      UI.message(`${s.icon} ${s.weather}: ${s.delivered ? 'reaching all farms' : 'NOT reaching all farms'}, quality ${s.quality}.`,
        s.delivered && s.quality >= level.qualityThreshold ? 'good' : 'bad');
      step++;
      setTimeout(playStep, 950);
    };
    playStep();
  }

  function finishGame() {
    UI.message('🎉 You finished all six basins! Export your attempt log for the study.', 'good');
    $('modal-title').textContent = 'All six basins complete 🎉';
    $('modal-place').textContent = '';
    $('modal-body').innerHTML = `You designed sustainable irrigation for Banaue, California, the Mekong, the Indus, the Nile and the Murray–Darling. <b>${Telemetry.count()} attempts</b> were logged.`;
    $('modal-fact').innerHTML = 'Remember: the shortest path is rarely the cheapest — elevation, pumping, pollution and reuse all matter.';
    $('modal-source').textContent = '';
    $('modal-objectives').innerHTML = '';
    const go = $('modal-go'); go.textContent = 'Export attempts ⬇';
    go.onclick = () => { $('modal').classList.add('hidden'); Telemetry.exportJSON(); };
    $('modal').classList.remove('hidden');
  }

  function bindButtons() {
    $('btn-test').onclick = runTestAnimated;
    $('btn-clear').onclick = () => { state.grid.clear(); state.grid.draw(); livePreview(); UI.message('Cleared. Carve a new channel.', ''); };
    $('btn-prev').onclick = () => { if (state.idx > 0) loadLevel(state.idx - 1, true); };
    $('btn-next').onclick = () => { if (state.idx < LEVELS.length - 1) loadLevel(state.idx + 1, true); };
    $('btn-export').onclick = () => Telemetry.exportJSON();
    $('tool-carve').onclick = () => { state.tool = 'carve'; $('tool-carve').classList.add('active'); $('tool-erase').classList.remove('active'); };
    $('tool-erase').onclick = () => { state.tool = 'erase'; $('tool-erase').classList.add('active'); $('tool-carve').classList.remove('active'); };
  }

  function init() {
    bindCanvas();
    bindButtons();
    UI.logCount(Telemetry.count());
    loadLevel(0, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
