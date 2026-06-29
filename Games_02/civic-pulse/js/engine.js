/* =====================================================================
   Civic Pulse — engine.js
   Pure-ish game logic: apply a budget, resolve a shock, compute the
   Hidden Ledger (the counterfactual reveal), run passive decay, and check
   win/lose. All coefficients come from BALANCE. No DOM here.
   ===================================================================== */
const Engine = {

  // ---- passive drift at the start of each new turn ----
  applyDecay(s) {
    const d = BALANCE.decay;
    s.meters.bonding   -= d.bonding;
    s.meters.bridging  -= d.bridging;
    s.meters.linking   -= d.linking;
    s.meters.hardiness -= d.hardiness;
    s.meters.approval  -= d.approval;
    Game.clampMeters(s);
  },

  // ---- BUDGET phase: convert this turn's allocations into meters ----
  applyBudget(s) {
    let preventionSpend = 0;
    for (const item in s.alloc) {
      const amount = s.alloc[item];
      if (!amount) continue;
      const def = BALANCE.spend[item];
      for (const meter in def.gain) {
        const pts = amount * def.gain[meter];
        if (meter === "approval") s.meters.approval += pts;
        else if (meter === "budget") { /* reserve: handled by leaving budget unspent */ }
        else s.meters[meter] += pts;
      }
      if (def.kind === "hard" || def.kind === "social") preventionSpend += amount;
      s.budget -= amount;
    }
    // prevention earns a *little* approval — it is largely thankless (LO4)
    s.meters.approval += preventionSpend * BALANCE.preventionApprovalGain;
    Game.clampMeters(s);
  },

  // ---- EVENT/TRIAGE phase: resolve a shock given a chosen response ----
  resolveShock(s, ev, choiceIndex) {
    const choice = ev.triage[choiceIndex] || { label: "—", cost: 0, approval: 0, chaosCut: 0, community: false };
    const h = s.meters.hardiness;
    const wSocial = Game.weightedSocial(s, ev);

    // physical damage, reduced by hardiness (only as much as this event allows)
    const phys = ev.baseSeverity *
      (1 - (h / 100) * BALANCE.HARDINESS_MITIGATION * ev.hardinessW);

    // chaos, reduced by social capital and then by the triage choice
    const chaosAfterSocial = ev.baseChaos * (1 - (wSocial / 100) * BALANCE.SOCIAL_BUFFER);
    const chaos = Math.max(0, chaosAfterSocial * (1 - choice.chaosCut));

    // recovery cost, discounted by social capital
    const recoveryFull = phys * BALANCE.RECOVERY_RATE;
    const recovery = recoveryFull * (1 - (wSocial / 100) * BALANCE.RECOVERY_DISCOUNT);

    // spend: the triage choice's cost + recovery
    const spend = choice.cost + recovery;
    s.budget -= spend;

    // approval: direct from the choice, minus fallout from unabsorbed chaos
    const approvalShift = choice.approval - chaos * BALANCE.chaosApprovalLoss;
    s.meters.approval += approvalShift;

    // a shock erodes trust/infrastructure a bit on top of decay
    s.meters.hardiness -= phys * 0.08;
    s.meters.bonding   -= chaos * 0.10;
    Game.clampMeters(s);

    // did the community absorb it on its own? (Perfect-Game path)
    const perfect = choice.community && wSocial >= 62 && chaos <= 5;
    if (perfect) s.perfectAbsorptions++;

    // city vitality eases toward resilience target, dips for this shock
    const target = 0.5 * Game.composite(s) + 0.5 * s.meters.hardiness;
    s.cityVitality = Game.clamp(s.cityVitality + (target - s.cityVitality) * 0.4 - chaos * 0.4, 0, 100);

    const ledger = this.hiddenLedger(s, ev, choice, { phys, chaos, recoveryFull, recovery, wSocial, h, approvalShift });

    if (ev.major) s.shocksSurvived++;

    const outcome = {
      event: ev, choice, phys: round(phys), chaos: round(chaos),
      recovery: round(recovery), spend: round(spend),
      approvalShift: round(approvalShift), perfect, ledger,
    };
    s.lastOutcome = outcome;
    return outcome;
  },

  // ---- the counterfactual reveal — where the learning happens (LO1/LO2/LO6) ----
  hiddenLedger(s, ev, choice, m) {
    const L = [];
    const prevented = ev.baseSeverity * ev.hardinessW * BALANCE.HARDINESS_MITIGATION * (m.h / 100);
    if (prevented > 1)
      L.push({ tone: "good", text: `Hardiness absorbed ~${round(prevented)} damage. Concrete you bought in calmer seasons paid off today.` });
    if (m.h < 35 && (ev.type === "flood" || ev.type === "blizzard"))
      L.push({ tone: "bad", text: `Hardiness was only ${round(m.h)}. Skimping on infrastructure was cheap then and expensive now — classic short-term "efficiency."` });

    const recoverySaved = m.recoveryFull - m.recovery;
    if (recoverySaved > 1)
      L.push({ tone: "good", text: `Social capital cut recovery cost by ~$${round(recoverySaved)}. Trust is cheaper than concrete.` });
    if (m.wSocial < 35 && ev.baseChaos > 0)
      L.push({ tone: "bad", text: `Weak social ties (${round(m.wSocial)}) let chaos run to ${round(m.chaos)}. A connected neighborhood would have caught much of this itself.` });

    if (choice.community && m.wSocial >= 62 && m.chaos <= 5)
      L.push({ tone: "perfect", text: `Oakhaven recovered on its own before you had to act. This is the real win — resilience, not rescue.` });
    if (choice.approval < 0)
      L.push({ tone: "bad", text: `Deflecting cost you ${Math.abs(choice.approval)} approval. Visible inaction is how mayors fall.` });
    if (choice.cost > 25 && !choice.community)
      L.push({ tone: "warn", text: `The big visible response won approval now — but it cost $${choice.cost}. Prevention would have been cheaper than this rescue.` });
    return L;
  },

  // ---- win/lose check after each turn ----
  checkEnd(s) {
    if (s.budget < 0) s.negBudgetStreak++; else s.negBudgetStreak = 0;

    if (s.meters.approval < BALANCE.impeachThreshold) {
      s.gameOver = true; s.result = "impeached"; return true;
    }
    if (s.negBudgetStreak >= BALANCE.bankruptTurnsAllowed) {
      s.gameOver = true; s.result = "bankrupt"; return true;
    }
    if (s.turn >= BALANCE.totalTurns) {
      s.gameOver = true; s.result = "complete";
      s.gold = Game.composite(s) > BALANCE.certSocialCapital &&
               s.shocksSurvived >= BALANCE.certShocksSurvived;
      return true;
    }
    return false;
  },

  finalScore(s) {
    const comp = Game.composite(s);
    return Math.round(
      comp * 4 + s.meters.hardiness * 2 + s.meters.approval * 2 +
      s.shocksSurvived * 25 + s.perfectAbsorptions * 40 +
      Math.max(0, s.budget) * 0.5
    );
  },
};

function round(x) { return Math.round(x); }
