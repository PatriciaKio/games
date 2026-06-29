/* =====================================================================
   Civic Pulse — ui.js
   All DOM rendering. Reads Game.state, draws the HUD, the city map, the
   Town Square feed, and the per-phase panel. Buttons call Main.* handlers.
   Color is never the only cue (icons + numbers + labels) — colorblind-safe.
   ===================================================================== */
const UI = {
  el(id) { return document.getElementById(id); },

  bar(value, cls) {
    const pct = Math.max(0, Math.min(100, value));
    return `<div class="bar"><span class="${cls}" style="width:${pct}%"></span></div>`;
  },

  // ---------- HUD ----------
  renderHUD(s) {
    const comp = Math.round(Game.composite(s));
    const apprDanger = s.meters.approval < BALANCE.impeachThreshold + 10 ? "danger" : "";
    this.el("hud").innerHTML = `
      <div class="hud-left">
        <div class="turnbox">
          <div class="yr">Year ${Game.year(s)} · Q${Game.quarter(s)}</div>
          <div class="tn">Turn ${s.turn}/${BALANCE.totalTurns}</div>
        </div>
        <div class="chip budget"><span class="ic">💰</span><b>${Math.round(s.budget)}</b><small>Budget</small></div>
      </div>
      <div class="hud-meters">
        ${this.meterChip("🤝", "Bonding", s.meters.bonding, "m-bond")}
        ${this.meterChip("🌉", "Bridging", s.meters.bridging, "m-bridge")}
        ${this.meterChip("🏛️", "Linking", s.meters.linking, "m-link")}
        ${this.meterChip("📊", "Social (avg)", comp, "m-soc")}
        ${this.meterChip("🏗️", "Hardiness", s.meters.hardiness, "m-hard")}
        ${this.meterChip("🗳️", "Approval", s.meters.approval, "m-appr", apprDanger)}
      </div>`;
  },

  meterChip(ic, label, val, cls, extra = "") {
    return `<div class="chip meter ${extra}">
      <span class="ic">${ic}</span>
      <div class="mwrap"><b>${Math.round(val)}</b>${this.bar(val, cls)}</div>
      <small>${label}</small></div>`;
  },

  // ---------- City map (district vitality) ----------
  districts: [
    { name: "The Loop", note: "downtown · flood-prone" },
    { name: "Englewood", note: "thin social infrastructure" },
    { name: "Auburn Gresham", note: "strong block clubs" },
    { name: "Southeast Side", note: "old steel mills" },
    { name: "West Side", note: "repeat flooding" },
    { name: "North Lakefront", note: "transit hub" },
  ],

  renderMap(s) {
    const base = s.cityVitality;
    const offsets = [-6, -18, 12, -10, -8, 8]; // per-district character
    const cells = this.districts.map((d, i) => {
      const v = Math.max(0, Math.min(100, base + offsets[i]));
      const grade = v > 66 ? "vital" : v > 38 ? "fading" : "gray";
      const icon = v > 66 ? "🌳" : v > 38 ? "🏚️" : "⚠️";
      return `<div class="district ${grade}">
        <div class="d-ic">${icon}</div>
        <div class="d-name">${d.name}</div>
        <div class="d-note">${d.note}</div>
        <div class="d-v">vitality ${Math.round(v)}</div>
      </div>`;
    }).join("");
    this.el("map").innerHTML = `<h3>Oakhaven <small>(modeled on Chicago)</small></h3><div class="districts">${cells}</div>`;
  },

  // ---------- Town Square sentiment feed ----------
  renderTownSquare(s) {
    const comp = Game.composite(s);
    const appr = s.meters.approval;
    const posts = [];
    if (comp > 65) posts.push(["🤝", "Neighbors helping neighbors on Elm St — somebody brought a generator!"]);
    else if (comp > 40) posts.push(["🙂", "Block club meeting tonight. A few of us still show up."]);
    else posts.push(["😟", "Nobody around here knows their neighbors anymore."]);

    if (appr > 60) posts.push(["🗳️", "Say what you want about the Mayor — the city works."]);
    else if (appr > 35) posts.push(["😐", "Mayor's... fine, I guess? Hard to say what they've done."]);
    else posts.push(["😡", "Where is the Mayor?! #OakhavenFail"]);

    if (s.lastOutcome) {
      if (s.lastOutcome.perfect) posts.unshift(["✨", "We didn't wait for City Hall. We took care of each other."]);
      else if (s.lastOutcome.chaos > 20) posts.unshift(["🚨", "Looting reported downtown. This is chaos."]);
    }
    this.el("townsquare").innerHTML = `<h3>🗨️ Town Square</h3>` +
      posts.map(p => `<div class="post"><span class="p-ic">${p[0]}</span><span>${p[1]}</span></div>`).join("");
  },

  frame(s) { this.renderHUD(s); this.renderMap(s); this.renderTownSquare(s); },

  // ---------- SDG tags shown on each event card ----------
  SDG_BY_TYPE: {
    flood:    "SDG 11.5 disaster losses · 9.1 resilient infrastructure · 13.1 climate · 10 inequality",
    heat:     "SDG 3.4 save lives · 11.5 disaster deaths · 13.1 heat · 10 / 1.5 the vulnerable",
    economic: "SDG 8.5 jobs & decent work · 9.2 inclusive industry · 10 inequality · 1 poverty",
    blizzard: "SDG 16.6 accountable institutions · 11.b disaster-risk management · 9.1 infrastructure",
    quiet:    "SDG 11.b — adopt resilience policies before the storm",
  },
  sdgTag(type) {
    const t = this.SDG_BY_TYPE[type] || this.SDG_BY_TYPE.quiet;
    return `<div class="ev-sdg">🎯 <b>UN SDGs:</b> ${t}</div>`;
  },

  // ---------- responsible-budget advisor (live, updates as you allocate) ----------
  budgetAdvice(s) {
    const ev = Game.eventForTurn(s.turn);
    const tips = [];
    const seasonTip = {
      flood:    ["warn", "🌊 Flood season ahead — Drainage & Deep Tunnel (Hardiness) blunt the damage; Linking coordinates aid."],
      heat:     ["warn", "🌡️ Heat season ahead — Bonding (block clubs) + libraries/cooling centers save lives. Connection matters more than cash."],
      economic: ["warn", "🏭 Economic shock looms — Bridging & Linking (unions, colleges, 311) replace lost jobs. Keep a reserve."],
      blizzard: ["warn", "❄️ Blizzard season ahead — Winter ops (Hardiness) + Linking decide whether 'the city works' — and your Approval."],
      quiet:    ["good", "🍃 Calm season — invest ahead. Build the social capital and hardiness next year will demand."],
    }[ev ? ev.type : "quiet"];
    if (seasonTip) tips.push(seasonTip);

    const comp = Game.composite(s);
    const prSpend = s.alloc.pr || 0;
    const buildSpend = (s.alloc.drainage || 0) + (s.alloc.winterops || 0) + (s.alloc.libraries || 0) +
      (s.alloc.blockclubs || 0) + (s.alloc.civicprog || 0) + (s.alloc.institutions || 0);
    if (prSpend > 0 && prSpend >= buildSpend)
      tips.push(["bad", "⚠ You're spending as much on PR as on real resilience. PR buys Approval but ZERO buffer against the next shock."]);
    if (comp < 30)
      tips.push(["warn", "Social capital is low — chaos will run high and recovery will be costly. Fund Bonding / Bridging / Linking."]);
    if (s.meters.hardiness < 30 && ev && (ev.type === "flood" || ev.type === "blizzard"))
      tips.push(["warn", `Hardiness is only ${Math.round(s.meters.hardiness)} going into a ${ev.type} season — physical damage will hurt.`]);
    if (Game.available(s) <= 0)
      tips.push(["warn", "Everything is allocated — no reserve left for recovery. Consider holding some back."]);
    else
      tips.push(["good", "Unspent budget stays as reserve — recovery (and the cheap community path) still costs money."]);
    return tips;
  },

  // ---------- PHASE: Budget ----------
  renderBudget(s) {
    const avail = Math.round(Game.available(s));
    const rows = Object.keys(BALANCE.spend).filter(k => k !== "reserve").map(k => {
      const def = BALANCE.spend[k];
      const amt = s.alloc[k] || 0;
      const tag = { hard: "Infrastructure", social: "Social infrastructure", trap: "⚠ Vanity" }[def.kind] || "";
      return `<div class="line ${def.kind}">
        <div class="line-main">
          <div class="line-title">${def.label} <em class="tag">${tag}</em></div>
          <div class="line-desc">${def.desc}</div>
        </div>
        <div class="line-ctrl">
          <button onclick="Main.alloc('${k}',-1)" ${amt <= 0 ? "disabled" : ""}>−</button>
          <span class="amt">$${amt}</span>
          <button onclick="Main.alloc('${k}',1)" ${avail < BALANCE.allocStep ? "disabled" : ""}>+</button>
        </div></div>`;
    }).join("");
    this.el("panel").innerHTML = `
      <div class="phase-head">
        <h2>① Assess &amp; Budget <span class="phase-sub">Mitigation phase</span></h2>
        <p class="hint">Invisible prevention vs. visible vanity. Unspent funds stay as reserve for emergencies.</p>
      </div>
      <div class="availbar"><b>$${avail}</b> available to allocate</div>
      <div class="advisor">
        <div class="adv-title">💡 Budget advisor</div>
        ${this.budgetAdvice(s).map(t => `<div class="adv ${t[0]}">${t[1]}</div>`).join("")}
      </div>
      <div class="lines">${rows}</div>
      <div class="phase-actions">
        <button class="ghost" onclick="Main.resetBudget()">Reset</button>
        <button class="primary" onclick="Main.lockBudget()">Lock in budget →</button>
      </div>`;
  },

  // ---------- PHASE: Event ----------
  renderEvent(s, ev) {
    if (ev.type === "quiet") {
      this.el("panel").innerHTML = `
        <div class="phase-head"><h2>② The Season <span class="phase-sub">${ev.season}</span></h2></div>
        <div class="eventcard quiet">
          <div class="ev-title">🍃 ${ev.title}</div>
          <p>${ev.fact}</p>
          ${this.sdgTag("quiet")}
        </div>
        <div class="phase-actions"><button class="primary" onclick="Main.afterQuiet()">Continue →</button></div>`;
      return;
    }
    const icon = { flood: "🌊", heat: "🌡️", economic: "🏭", blizzard: "❄️" }[ev.type] || "⚡";
    this.el("panel").innerHTML = `
      <div class="phase-head"><h2>② The Shock <span class="phase-sub">${ev.season} · ${ev.major ? "MAJOR" : "minor"}</span></h2></div>
      <div class="eventcard ${ev.major ? "major" : ""}">
        <div class="ev-title">${icon} ${ev.title}</div>
        <p class="ev-fact">${ev.fact}</p>
        <p class="ev-src">📚 ${ev.source}</p>
        ${this.sdgTag(ev.type)}
      </div>
      <div class="phase-actions"><button class="primary" onclick="Main.toTriage()">Respond →</button></div>`;
  },

  // ---------- PHASE: Triage ----------
  renderTriage(s, ev) {
    const choices = ev.triage.map((c, i) => `
      <button class="choice ${c.community ? "community" : c.approval < 0 ? "deflect" : "visible"}" onclick="Main.choose(${i})">
        <div class="c-label">${c.label}</div>
        <div class="c-desc">${c.desc}</div>
        <div class="c-meta">cost $${c.cost} · approval ${c.approval >= 0 ? "+" : ""}${c.approval}</div>
      </button>`).join("");
    this.el("panel").innerHTML = `
      <div class="phase-head"><h2>③ Triage <span class="phase-sub">Response phase</span></h2>
        <p class="hint">Spend to look decisive, or trust the community to carry it. Your social capital decides how well the cheap path works.</p>
      </div>
      <div class="choices">${choices}</div>`;
  },

  // ---------- PHASE: Aftermath ----------
  renderAftermath(s, o) {
    const ledger = o.ledger.map(l => `<li class="led ${l.tone}">${l.text}</li>`).join("") ||
      `<li class="led good">A calm aftermath. Your preparation held.</li>`;
    this.el("panel").innerHTML = `
      <div class="phase-head"><h2>④ The Aftermath <span class="phase-sub">Recovery phase</span></h2></div>
      <div class="aftergrid">
        <div class="stat"><span>Physical damage</span><b>${o.phys}</b></div>
        <div class="stat"><span>Chaos</span><b>${o.chaos}</b></div>
        <div class="stat"><span>Recovery cost</span><b>$${o.recovery}</b></div>
        <div class="stat"><span>Approval shift</span><b>${o.approvalShift >= 0 ? "+" : ""}${o.approvalShift}</b></div>
      </div>
      ${o.perfect ? `<div class="perfect-banner">✨ Perfect absorption — the community recovered before you had to act.</div>` : ""}
      <div class="ledger">
        <h3>🧾 The Hidden Ledger</h3>
        <ul>${ledger}</ul>
      </div>
      <div class="phase-actions"><button class="primary" onclick="Main.nextTurn()">${s.turn >= BALANCE.totalTurns ? "Finish term" : "Next season →"}</button></div>`;
  },

  // ---------- Game over ----------
  renderGameOver(s) {
    const score = Engine.finalScore(s);
    let title, blurb, cls;
    if (s.result === "impeached") {
      cls = "lose"; title = "🗳️ Impeached";
      blurb = `Approval fell to ${Math.round(s.meters.approval)}. Like Mayor Bilandic after the Blizzard of '79, the city decided you weren't the one who made it work.`;
    } else if (s.result === "bankrupt") {
      cls = "lose"; title = "💸 Bankrupt";
      blurb = `Oakhaven ran out of money for two straight seasons. You couldn't buy your way out — and you hadn't built the trust to avoid needing to.`;
    } else if (s.gold) {
      cls = "gold"; title = "🏅 Resilient City — Gold";
      blurb = `You finished the term with social capital above ${BALANCE.certSocialCapital} and survived ${s.shocksSurvived} major shocks. You proved the thesis: a connected city catches itself.`;
    } else {
      cls = "win"; title = "🏁 Term Complete";
      blurb = `You served four years and survived ${s.shocksSurvived} major shock(s). Not a gold-standard Resilient City — but Oakhaven is still standing.`;
    }
    this.el("panel").innerHTML = `
      <div class="gameover ${cls}">
        <h2>${title}</h2>
        <p>${blurb}</p>
        <div class="aftergrid">
          <div class="stat"><span>Final score</span><b>${score}</b></div>
          <div class="stat"><span>Social capital (avg)</span><b>${Math.round(Game.composite(s))}</b></div>
          <div class="stat"><span>Major shocks survived</span><b>${s.shocksSurvived}</b></div>
          <div class="stat"><span>Perfect absorptions</span><b>${s.perfectAbsorptions}</b></div>
        </div>
        <div class="phase-actions">
          <button class="ghost" onclick="Telemetry.exportJSON()">⬇ Export research data (${Telemetry.count()} turns)</button>
          <button class="primary" onclick="Main.restart()">Play again</button>
        </div>
        <p class="takeaway">A "perfect game" isn't one without disasters — it's one where the community picks itself back up before the Mayor has to tell it to.</p>
      </div>`;
  },
};
