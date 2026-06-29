/* =====================================================================
   Civic Pulse — balance.js
   ALL tunable numbers live here. None of these are researched constants;
   they are DESIGN KNOBS chosen for playability. The *direction* of each
   effect is evidence-based (see civic-pulse-plan.md §4), the *magnitudes*
   are not. Edit freely to retune after playtesting.
   ===================================================================== */
const BALANCE = {
  // --- economy ---
  startBudget: 130,          // abstract budget units (think "$ millions")
  incomePerTurn: 62,         // tax income each turn
  totalTurns: 16,            // 4 years x 4 seasons

  // --- win / lose ---
  impeachThreshold: 22,      // Approval below this  => impeached (lose). Cf. Bilandic 1979.
  bankruptTurnsAllowed: 2,   // consecutive turns with Budget < 0 => bankrupt (lose)
  certSocialCapital: 80,     // composite Social Capital needed for "Resilient City" gold
  certShocksSurvived: 3,     // major shocks survived needed for gold

  // --- passive drift per turn (things erode if you ignore them) ---
  decay: { bonding: 3, bridging: 3, linking: 3, hardiness: 4, approval: 2 },

  // --- composite Social Capital weighting (bonding/bridging/linking) ---
  socialWeights: { bonding: 0.40, bridging: 0.30, linking: 0.30 },

  // --- effect coefficients (max fraction each meter can remove) ---
  HARDINESS_MITIGATION: 0.70, // hardiness vs physical damage
  SOCIAL_BUFFER:        0.70, // social capital vs chaos
  RECOVERY_DISCOUNT:    0.60, // social capital vs recovery cost
  RECOVERY_RATE:        0.85, // recovery $ per unit of physical damage

  // --- approval dynamics ---
  visibleApprovalGain:   0.45, // approval gained per $ of "visible reaction" triage
  chaosApprovalLoss:     0.85, // approval lost per unit of unabsorbed chaos
  preventionApprovalGain:0.06, // tiny approval for prevention spend (it's thankless)

  // --- spending efficiency: $1 allocated -> meter points gained ---
  // keys map to line items shown in the Budget phase
  spend: {
    drainage:     { label: "Drainage & Deep Tunnel upkeep", kind: "hard",
                    desc: "Sewers, the TARP 'Deep Tunnel', grading. Raises Hardiness vs floods.",
                    gain: { hardiness: 0.55 } },
    winterops:    { label: "Winter street operations", kind: "hard",
                    desc: "Plows, salt, transit readiness. Raises Hardiness vs blizzards.",
                    gain: { hardiness: 0.45 } },
    libraries:    { label: "Libraries, parks & cooling centers", kind: "social",
                    desc: "Klinenberg's 'social infrastructure' — places that pull people into contact.",
                    gain: { bonding: 0.40, bridging: 0.30 } },
    blockclubs:   { label: "Block clubs & mutual-aid networks", kind: "social",
                    desc: "Neighbors who check on neighbors. Raises BONDING social capital.",
                    gain: { bonding: 0.70 } },
    civicprog:    { label: "Cross-community civic programs", kind: "social",
                    desc: "Ties across groups & neighborhoods. Raises BRIDGING social capital.",
                    gain: { bridging: 0.70 } },
    institutions: { label: "311, outreach & institutional access", kind: "social",
                    desc: "Trust between residents and City Hall. Raises LINKING social capital.",
                    gain: { linking: 0.70 } },
    pr:           { label: "Ribbon-cuttings & PR campaigns", kind: "trap",
                    desc: "Buys instant Approval. Builds ZERO resilience. The seductive trap.",
                    gain: { approval: 0.85 } },
    reserve:      { label: "Hold in reserve", kind: "reserve",
                    desc: "Keep the money. Useful for emergency recovery costs later.",
                    gain: { budget: 1.0 } },
  },

  // step size for the +/- budget buttons
  allocStep: 10,
};
