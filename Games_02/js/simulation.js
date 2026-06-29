/* simulation.js — "Test flow" logic. No ES modules.
   Model (see game-plan §3.2): water spreads from the source through the carved
   channel network (pumping is allowed, so connectivity reaches a sink even uphill,
   but uphill climbs accrue pumping cost). Cost & quality are computed from the
   BFS flow tree so every number is explainable in the breakdown panel. */
(function (global) {
  const FP = global.FlowPath;
  const { W, H, COST } = FP;
  const key = (x, y) => x + ',' + y;
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // One pass at a given weather step. Returns per-step result.
  function evalStep(grid, weather) {
    const level = grid.level;
    grid.contamExtra = weather.contamBoost;

    const [sx, sy] = level.source0;
    const carvedSet = new Set(grid.carved);
    carvedSet.add(key(sx, sy)); // source is implicitly part of the network

    // BFS flow tree from the source through carved tiles.
    const parent = {}; const reached = new Set(); const order = [];
    const q = [[sx, sy]]; reached.add(key(sx, sy)); parent[key(sx, sy)] = null;
    while (q.length) {
      const [x, y] = q.shift(); order.push([x, y]);
      for (const [dx, dy] of NB) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const k = key(nx, ny);
        if (!carvedSet.has(k) || reached.has(k)) continue;
        reached.add(k); parent[k] = [x, y]; q.push([nx, ny]);
      }
    }

    // Costs from the flow tree edges.
    let pumpUnits = 0, steepCount = 0, reuseCount = 0;
    order.forEach(([x, y]) => {
      const p = parent[key(x, y)];
      const t = grid.tile(x, y);
      if (t.type === 'drainage') reuseCount++;
      if (!p) return;
      const de = grid.tile(x, y).elev - grid.tile(p[0], p[1]).elev; // climb from parent -> here
      if (de > 0) pumpUnits += de;                 // uphill: pumping
      if (Math.abs(de) >= COST.steepDrop) steepCount++; // steep: needs lining
    });

    const lengthTiles = grid.carved.size; // source not counted as construction
    // Flat-run / waterlogging penalty: count carved tiles whose whole 4-neighbourhood
    // within the network is the same elevation (a stagnant flat pocket), scaled by weather.
    let flatTiles = 0;
    grid.carved.forEach(k => {
      const [x, y] = k.split(',').map(Number);
      const e = grid.tile(x, y).elev;
      let sameFlat = 0, neigh = 0;
      for (const [dx, dy] of NB) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        if (carvedSet.has(key(nx, ny))) { neigh++; if (grid.tile(nx, ny).elev === e) sameFlat++; }
      }
      if (neigh >= 2 && sameFlat === neigh) flatTiles++;
    });
    const flatPenalty = (flatTiles >= COST.flatRunLen)
      ? Math.round((flatTiles - COST.flatRunLen + 1) * COST.flatPenalty * weather.waterlog) : 0;

    // Water quality: lose points for every carved tile sitting in a contamination radius.
    let contamTiles = 0;
    grid.carved.forEach(k => {
      const [x, y] = k.split(',').map(Number);
      if (grid.contamination(x, y) > 0) contamTiles++;
    });
    const quality = Math.max(0, 100 - contamTiles * COST.contamPenalty);

    // A carved tile placed directly ON a pollutant source is a hard fail (drinking the source).
    let onPollutant = false;
    grid.carved.forEach(k => {
      const [x, y] = k.split(',').map(Number);
      if (grid.tile(x, y).type === 'pollutant') onPollutant = true;
    });

    // Delivery: water reaches a farm if the farm tile OR an adjacent tile is in the network.
    const delivered = level.sinks.every(([gx, gy]) =>
      reached.has(key(gx, gy)) || NB.some(([dx, dy]) => reached.has(key(gx + dx, gy + dy))));

    const cost = lengthTiles * COST.perTile
      + pumpUnits * COST.perLift
      + steepCount * COST.perSteep
      - reuseCount * COST.reuseCredit
      + flatPenalty;

    return {
      weather: weather.name, icon: weather.icon,
      reached, delivered, quality, onPollutant,
      breakdown: {
        length: lengthTiles * COST.perTile,
        pump: pumpUnits * COST.perLift,
        line: steepCount * COST.perSteep,
        reuse: reuseCount * COST.reuseCredit,
        flat: flatPenalty,
        total: Math.max(0, cost),
      },
      flatTiles, contamTiles, pumpUnits, steepCount, reuseCount,
    };
  }

  // Full test across the weather timeline. Level passes only if it works every step.
  function runTest(grid) {
    const level = grid.level;
    const steps = level.weather.map(w => evalStep(grid, w));
    grid.contamExtra = 0;

    const worstQuality = Math.min(...steps.map(s => s.quality));
    const maxCost = Math.max(...steps.map(s => s.breakdown.total));
    const allDelivered = steps.every(s => s.delivered);
    const anyOnPollutant = steps.some(s => s.onPollutant);

    // union of reached tiles for the flow animation
    const flowUnion = new Set();
    steps.forEach(s => s.reached.forEach(k => flowUnion.add(k)));

    let pass = true; const reasons = [];
    if (!allDelivered) { pass = false; reasons.push('Water did not reach every farm — connect them all.'); }
    if (anyOnPollutant) { pass = false; reasons.push('A channel runs straight through a pollutant source — reroute around it.'); }
    if (worstQuality < level.qualityThreshold) { pass = false; reasons.push(`Water quality fell to ${worstQuality} (need ≥ ${level.qualityThreshold}) — keep channels out of the pollutant radius, especially in wet weather.`); }
    if (maxCost > level.budget) { pass = false; reasons.push(`Cost ${maxCost} exceeds the budget ${level.budget} — shorten the path, avoid climbing, or reuse drainage.`); }

    // Score & stars (only meaningful when passing)
    let score = 0, stars = 0;
    if (pass) {
      score = Math.max(0, level.budget - maxCost) + (worstQuality - level.qualityThreshold);
      const ratio = maxCost / level.budget;
      stars = ratio <= 0.55 ? 3 : ratio <= 0.8 ? 2 : 1;
    }

    return { steps, pass, reasons, worstQuality, maxCost, allDelivered, flowUnion, score, stars };
  }

  FP.runTest = runTest;
})(window);
