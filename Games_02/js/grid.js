/* grid.js — tile model + canvas rendering (bird's-eye). No ES modules. */
(function (global) {
  const FP = global.FlowPath;
  const { W, H } = FP;

  function buildTiles(level) {
    const tiles = [];
    for (let y = 0; y < H; y++) {
      const row = [];
      for (let x = 0; x < W; x++) {
        row.push({ x, y, elev: level.elev(x, y), type: 'normal', radius: 0 });
      }
      tiles.push(row);
    }
    // place features
    (level.features || []).forEach(f => {
      if (f.type === 'pollutant') {
        tiles[f.y][f.x].type = 'pollutant';
        tiles[f.y][f.x].radius = f.radius || 1;
      } else if (f.cells) {
        f.cells.forEach(([cx, cy]) => { tiles[cy][cx].type = f.type; });
      }
    });
    // source + sinks last so they win
    const [sx, sy] = level.source0;
    tiles[sy][sx].type = 'source';
    level.sinks.forEach(([gx, gy]) => { tiles[gy][gx].type = 'sink'; });
    return tiles;
  }

  class Grid {
    constructor(canvas, level) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.level = level;
      this.tiles = buildTiles(level);
      this.ts = Math.floor(Math.min(canvas.width / W, canvas.height / H));
      this.carved = new Set();      // "x,y" keys of carved channel tiles
      this.flowTiles = new Set();   // tiles water actually reached (for animation)
      this.contamExtra = 0;         // weather contamination boost currently shown
    }

    key(x, y) { return x + ',' + y; }
    tile(x, y) { return this.tiles[y][x]; }
    inBounds(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }

    pixelToTile(px, py) {
      const r = this.canvas.getBoundingClientRect();
      const sx = (px - r.left) * (this.canvas.width / r.width);
      const sy = (py - r.top) * (this.canvas.height / r.height);
      return { x: Math.floor(sx / this.ts), y: Math.floor(sy / this.ts) };
    }

    canCarve(x, y) {
      if (!this.inBounds(x, y)) return false;
      const t = this.tile(x, y);
      return t.type !== 'obstacle';
    }

    carve(x, y) {
      if (!this.canCarve(x, y)) return;
      if (this.tile(x, y).type === 'source') return; // source is implicitly in the network; don't bill it as length
      this.carved.add(this.key(x, y));
    }
    erase(x, y) {
      const t = this.tile(x, y);
      if (t.type === 'source') return; // keep the source anchored
      this.carved.delete(this.key(x, y));
    }
    clear() { this.carved.clear(); this.flowTiles.clear(); }

    isCarvedOrSource(x, y) {
      const t = this.tile(x, y);
      return this.carved.has(this.key(x, y)) || t.type === 'source';
    }

    // is (x,y) within any pollutant radius (including current weather boost)?
    contamination(x, y) {
      let hit = 0;
      for (let yy = 0; yy < H; yy++)
        for (let xx = 0; xx < W; xx++) {
          const t = this.tiles[yy][xx];
          if (t.type === 'pollutant') {
            const r = t.radius + this.contamExtra;
            if (Math.abs(xx - x) + Math.abs(yy - y) <= r) hit++;
          }
        }
      return hit;
    }

    /* ---------------- rendering ---------------- */
    elevColor(e) {
      // single-hue sequential: dark (low) -> light (high). lightness 12%..86%
      const l = 12 + (e / 9) * 74;
      return `hsl(212 30% ${l}%)`;
    }

    draw() {
      const { ctx, ts } = this;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const t = this.tiles[y][x];
          const px = x * ts, py = y * ts;
          ctx.fillStyle = this.elevColor(t.elev);
          ctx.fillRect(px, py, ts, ts);
          ctx.strokeStyle = 'rgba(255,255,255,.05)';
          ctx.strokeRect(px + .5, py + .5, ts - 1, ts - 1);
        }
      }
      // pollutant radius shading (pattern + magenta, redundant encoding)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const t = this.tiles[y][x];
          if (t.type === 'pollutant') this.drawContam(x, y, t.radius + this.contamExtra);
        }
      // carved channels
      this.carved.forEach(k => {
        const [x, y] = k.split(',').map(Number);
        this.drawChannel(x, y, this.flowTiles.has(k));
      });
      // special tiles on top
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const t = this.tiles[y][x];
          if (t.type === 'source') this.icon(x, y, '💧', 'rgba(31,120,255,.35)');
          else if (t.type === 'sink') this.icon(x, y, '🌱', 'rgba(28,156,91,.35)');
          else if (t.type === 'pollutant') this.icon(x, y, '☣', 'rgba(192,38,168,.55)');
          else if (t.type === 'drainage' && !this.carved.has(this.key(x, y))) this.drainMark(x, y);
          else if (t.type === 'obstacle') this.icon(x, y, '⛰', 'rgba(74,64,54,.65)');
        }
    }

    drawContam(cx, cy, r) {
      const { ctx, ts } = this;
      ctx.save();
      ctx.fillStyle = 'rgba(192,38,168,.16)';
      for (let yy = 0; yy < H; yy++)
        for (let xx = 0; xx < W; xx++) {
          if (Math.abs(xx - cx) + Math.abs(yy - cy) <= r) {
            const px = xx * ts, py = yy * ts;
            ctx.fillRect(px, py, ts, ts);
            // hatch pattern for CVD safety
            ctx.strokeStyle = 'rgba(192,38,168,.35)';
            ctx.beginPath(); ctx.moveTo(px, py + ts); ctx.lineTo(px + ts, py); ctx.stroke();
          }
        }
      ctx.restore();
    }

    drawChannel(x, y, flowing) {
      const { ctx, ts } = this;
      const px = x * ts, py = y * ts;
      ctx.fillStyle = flowing ? 'rgba(54,197,255,.92)' : 'rgba(90,140,180,.85)';
      const pad = ts * 0.18;
      ctx.fillRect(px + pad, py + pad, ts - pad * 2, ts - pad * 2);
      if (flowing) {
        ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5;
        ctx.strokeRect(px + pad, py + pad, ts - pad * 2, ts - pad * 2);
      }
    }

    drainMark(x, y) {
      const { ctx, ts } = this;
      const px = x * ts, py = y * ts;
      ctx.save();
      ctx.strokeStyle = 'rgba(122,138,168,.9)'; ctx.lineWidth = 2;
      for (let i = 4; i < ts; i += 7) {
        ctx.beginPath(); ctx.moveTo(px + i, py + 3); ctx.lineTo(px + i, py + ts - 3); ctx.stroke();
      }
      ctx.restore();
    }

    icon(x, y, glyph, bg) {
      const { ctx, ts } = this;
      const px = x * ts, py = y * ts;
      ctx.save();
      ctx.fillStyle = bg; ctx.fillRect(px, py, ts, ts);
      ctx.font = `${Math.floor(ts * 0.6)}px "Segoe UI Emoji",sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(glyph, px + ts / 2, py + ts / 2 + 1);
      ctx.restore();
    }
  }

  FP.Grid = Grid;
})(window);
