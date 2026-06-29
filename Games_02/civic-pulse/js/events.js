/* =====================================================================
   Civic Pulse — events.js
   The 16-turn shock schedule for OAKHAVEN-as-Chicago. Every event card
   carries a REAL, sourced Chicago fact (see README "Sources"). Severities
   and chaos values are tunable design knobs; the facts are real.

   Per event:
     turn, season, type, title, fact, source, major
     baseSeverity  - raw physical damage if you were totally unprepared
     baseChaos     - raw social disorder if you had zero social capital
     hardinessW    - how much Hardiness mitigates this event's PHYSICAL damage (0..1)
     socialW       - how the 3 social-capital types buffer this event's CHAOS
     triage[]      - 2-3 response choices:
        label, desc, cost, approval (direct approval delta from the *choice*),
        chaosCut (0..1 extra chaos removed), community (true => the "let the
        neighborhood carry it" path that earns the Perfect-Game badge)
   ===================================================================== */
// ---- helper: a "quiet" turn (no major shock, just drift + budgeting) ----
// Standalone (hoisted) so it can be used inside the EVENTS literal below
// without referencing EVENTS before it is initialized.
function quietTurn(turn, season, note) {
  return {
    turn, season, type: "quiet", title: "A quiet season",
    fact: note, source: "", major: false,
    baseSeverity: 0, baseChaos: 0, hardinessW: 0,
    socialW: { bonding: 0, bridging: 0, linking: 0 }, triage: [],
  };
}

const EVENTS = {

  schedule: [
    // ============================ YEAR 1 (tutorial) ============================
    { turn: 1, season: "Spring", type: "flood", title: "Spring rains test the sewers",
      fact: "Chicago's combined sewers back up in heavy rain, sending stormwater and sewage into basements; the 'Deep Tunnel' (TARP) was built specifically to capture these overflows.",
      source: "MWRD — Tunnel and Reservoir Plan (TARP)", major: false,
      baseSeverity: 22, baseChaos: 10, hardinessW: 0.8,
      socialW: { bonding: 0.4, bridging: 0.2, linking: 0.4 },
      triage: [
        { label: "Emergency pump crews", desc: "Visible, costly, reassuring.", cost: 20, approval: 6, chaosCut: 0.5, community: false },
        { label: "Neighbors sandbag together", desc: "Lean on block clubs. Cheap if bonding is high.", cost: 4, approval: 1, chaosCut: 0.3, community: true },
      ] },

    { turn: 2, season: "Summer", type: "heat", title: "An early heat advisory",
      fact: "Heat is Chicago's deadliest weather hazard; the city now opens cooling centers in libraries and senior sites as a first response.",
      source: "City of Chicago / Scientific American", major: false,
      baseSeverity: 18, baseChaos: 14, hardinessW: 0.2,
      socialW: { bonding: 0.6, bridging: 0.3, linking: 0.3 },
      triage: [
        { label: "Open cooling centers", desc: "Use libraries & senior centers.", cost: 12, approval: 4, chaosCut: 0.4, community: false },
        { label: "Block-club check-ins", desc: "Neighbors knock on elderly doors.", cost: 3, approval: 1, chaosCut: 0.35, community: true },
      ] },

    quietTurn(3, "Fall", "A calm autumn. No shock — a chance to invest before Year 2 gets harder."),

    { turn: 4, season: "Winter", type: "blizzard", title: "First real snow",
      fact: "Chicago voters judge mayors on snow: clearing the side streets, not just the arterials, is the political test.",
      source: "WTTW / Chicago Magazine", major: false,
      baseSeverity: 16, baseChaos: 10, hardinessW: 0.85,
      socialW: { bonding: 0.4, bridging: 0.2, linking: 0.4 },
      triage: [
        { label: "Full plow mobilization", desc: "Every street. Expensive, popular.", cost: 18, approval: 7, chaosCut: 0.5, community: false },
        { label: "Arterials only + volunteers", desc: "Cheaper; residents dig out side streets.", cost: 6, approval: 0, chaosCut: 0.3, community: true },
      ] },

    // ============================ YEAR 2 ============================
    { turn: 5, season: "Spring", type: "flood", title: "A 100-year storm",
      fact: "The April 2013 floods brought a federal disaster declaration for Cook County: suburban Cook received $83.6M in federal CDBG-DR recovery funds, and area flood losses ran ~$1.8B in grants, loans and payouts (2004–2014) — concentrated in lower-income West & South side tracts.",
      source: "Cook County CDBG-DR; WTTW; phys.org", major: true,
      baseSeverity: 48, baseChaos: 26, hardinessW: 0.85,
      socialW: { bonding: 0.4, bridging: 0.3, linking: 0.5 },
      triage: [
        { label: "Citywide emergency response", desc: "Pumps, shelters, payouts. Costly & visible.", cost: 40, approval: 10, chaosCut: 0.6, community: false },
        { label: "Targeted aid to hardest-hit wards", desc: "Lean on linking + local orgs.", cost: 18, approval: 3, chaosCut: 0.45, community: true },
        { label: "Tell them to file with insurance", desc: "Deflect. Cheap. Risky to your standing.", cost: 2, approval: -10, chaosCut: 0.1, community: false },
      ] },

    { turn: 6, season: "Summer", type: "heat", title: "A muggy stretch",
      fact: "After 1995, Chicago built a heat-emergency plan — but a 2025 review found vulnerable residents still at risk 30 years on.",
      source: "Axios Chicago", major: false,
      baseSeverity: 20, baseChaos: 16, hardinessW: 0.2,
      socialW: { bonding: 0.6, bridging: 0.3, linking: 0.3 },
      triage: [
        { label: "Open cooling centers", desc: "Standard response.", cost: 12, approval: 3, chaosCut: 0.4, community: false },
        { label: "Neighbor check-in network", desc: "Bonding does the work.", cost: 3, approval: 1, chaosCut: 0.35, community: true },
      ] },

    { turn: 7, season: "Fall", type: "economic", title: "The steel mill announces closure",
      fact: "On Jan 9, 1992, U.S. Steel announced South Works would close (it shut that April). A mill that employed up to ~20,000 at its peak — about 10,000 by the late 1970s — ended with fewer than 700 workers, gutting the Southeast Side.",
      source: "Wikipedia: South Works; Forgotten Chicago", major: true,
      baseSeverity: 44, baseChaos: 30, hardinessW: 0.1,
      socialW: { bonding: 0.3, bridging: 0.6, linking: 0.6 },
      triage: [
        { label: "Subsidize an incoming employer", desc: "Big public package. Visible jobs play.", cost: 38, approval: 9, chaosCut: 0.5, community: false },
        { label: "Retraining via unions & colleges", desc: "Bridging + linking networks place workers.", cost: 16, approval: 2, chaosCut: 0.45, community: true },
        { label: "Wait for the market to recover", desc: "Do nothing. Deindustrialization deepens.", cost: 0, approval: -8, chaosCut: 0.0, community: false },
      ] },

    { turn: 8, season: "Winter", type: "blizzard", title: "A heavy snowfall",
      fact: "Snow ops are unforgiving: stranded buses and unplowed side streets turn weather into a referendum on competence.",
      source: "WTTW: Legendary Blizzards", major: false,
      baseSeverity: 20, baseChaos: 12, hardinessW: 0.85,
      socialW: { bonding: 0.4, bridging: 0.2, linking: 0.4 },
      triage: [
        { label: "Full plow mobilization", desc: "Costly, popular.", cost: 20, approval: 7, chaosCut: 0.5, community: false },
        { label: "Arterials + neighbor dig-outs", desc: "Cheaper; relies on bonding.", cost: 7, approval: 0, chaosCut: 0.3, community: true },
      ] },

    // ============================ YEAR 3 ============================
    { turn: 9, season: "Spring", type: "flood", title: "Storms overwhelm the Deep Tunnel",
      fact: "Despite ~$3.8B and ~109 miles of tunnels, the Deep Tunnel (TARP) still can't handle the heaviest climate-driven storms and overflows to the river.",
      source: "phys.org; MWRD", major: false,
      baseSeverity: 30, baseChaos: 18, hardinessW: 0.85,
      socialW: { bonding: 0.4, bridging: 0.3, linking: 0.5 },
      triage: [
        { label: "Emergency response", desc: "Pumps & shelters.", cost: 24, approval: 6, chaosCut: 0.5, community: false },
        { label: "Ward-level mutual aid", desc: "Local orgs + linking.", cost: 9, approval: 1, chaosCut: 0.4, community: true },
      ] },

    { turn: 10, season: "Summer", type: "heat", title: "THE HEAT WAVE",
      fact: "July 1995: 739 heat deaths in five days. Englewood's death rate was 33/100,000; near-identical Auburn Gresham's was 3/100,000 — the difference was social infrastructure.",
      source: "Klinenberg, 'Heat Wave'; Wikipedia; CNU", major: true,
      baseSeverity: 40, baseChaos: 40, hardinessW: 0.15,
      socialW: { bonding: 0.8, bridging: 0.4, linking: 0.3 },
      triage: [
        { label: "Mass AC & cooling-center blitz", desc: "Throw money at it. Visible, expensive.", cost: 36, approval: 9, chaosCut: 0.5, community: false },
        { label: "Mobilize block clubs & churches", desc: "The Auburn Gresham model. Bonding saves lives.", cost: 8, approval: 2, chaosCut: 0.5, community: true },
        { label: "Issue a heat advisory only", desc: "Words, not contact. People die alone.", cost: 1, approval: -12, chaosCut: 0.05, community: false },
      ] },

    quietTurn(11, "Fall", "The city exhales after the heat wave. Spend now; Year 4 will test everything."),

    { turn: 12, season: "Winter", type: "blizzard", title: "Deep freeze",
      fact: "Repeated big snows test whether prevention (pre-positioned crews) beats reaction (digging out after).",
      source: "Chicago History Today", major: false,
      baseSeverity: 22, baseChaos: 12, hardinessW: 0.85,
      socialW: { bonding: 0.4, bridging: 0.2, linking: 0.4 },
      triage: [
        { label: "Full plow mobilization", desc: "Costly, popular.", cost: 22, approval: 7, chaosCut: 0.5, community: false },
        { label: "Arterials + volunteers", desc: "Relies on bonding.", cost: 8, approval: 0, chaosCut: 0.3, community: true },
      ] },

    // ============================ YEAR 4 (capstone) ============================
    { turn: 13, season: "Spring", type: "flood", title: "Another major flood",
      fact: "Urban flooding now recurs yearly in the same low-lying wards; resilience is about who can recover, not whether it floods.",
      source: "MWRD; Chicago Sun-Times", major: false,
      baseSeverity: 34, baseChaos: 20, hardinessW: 0.85,
      socialW: { bonding: 0.4, bridging: 0.3, linking: 0.5 },
      triage: [
        { label: "Emergency response", desc: "Pumps & shelters.", cost: 26, approval: 6, chaosCut: 0.5, community: false },
        { label: "Ward mutual aid", desc: "Local + linking.", cost: 10, approval: 1, chaosCut: 0.4, community: true },
      ] },

    { turn: 14, season: "Summer", type: "heat", title: "A dangerous heat dome",
      fact: "Climate projections put more 1995-scale heat events ahead; the cities that fare best invest in social infrastructure beforehand.",
      source: "Scientific American", major: false,
      baseSeverity: 28, baseChaos: 24, hardinessW: 0.15,
      socialW: { bonding: 0.7, bridging: 0.4, linking: 0.3 },
      triage: [
        { label: "Cooling-center blitz", desc: "Visible.", cost: 22, approval: 6, chaosCut: 0.45, community: false },
        { label: "Block-club mobilization", desc: "Bonding.", cost: 6, approval: 2, chaosCut: 0.45, community: true },
      ] },

    { turn: 15, season: "Fall", type: "economic", title: "An economic aftershock",
      fact: "When an anchor industry leaves, the damage compounds for years; bridging and linking ties decide whether workers land on their feet.",
      source: "The Conversation; Belt Magazine", major: false,
      baseSeverity: 30, baseChaos: 22, hardinessW: 0.1,
      socialW: { bonding: 0.3, bridging: 0.6, linking: 0.6 },
      triage: [
        { label: "Public jobs package", desc: "Visible spending.", cost: 28, approval: 7, chaosCut: 0.45, community: false },
        { label: "Union & college retraining", desc: "Bridging + linking.", cost: 12, approval: 2, chaosCut: 0.45, community: true },
      ] },

    { turn: 16, season: "Winter", type: "blizzard", title: "THE BLIZZARD (election eve)",
      fact: "Jan 1979: a botched snow response cost Mayor Michael Bilandic re-election; Jane Byrne's ad asked, 'Is this the city that works?' Your term ends here — on the snow.",
      source: "Chicago Magazine; WTTW", major: true,
      baseSeverity: 42, baseChaos: 30, hardinessW: 0.85,
      socialW: { bonding: 0.4, bridging: 0.3, linking: 0.5 },
      triage: [
        { label: "Total mobilization", desc: "Spare nothing. Approval on the line.", cost: 40, approval: 12, chaosCut: 0.6, community: false },
        { label: "Smart triage + neighbor dig-outs", desc: "If bonding is high, the city digs itself out.", cost: 14, approval: 3, chaosCut: 0.5, community: true },
        { label: "'Tell it to a judge'", desc: "Bilandic's real deflection. Career suicide.", cost: 2, approval: -16, chaosCut: 0.05, community: false },
      ] },
  ],
};

// Turns 3 and 11 are deliberately quiet "budget-and-breathe" seasons.
