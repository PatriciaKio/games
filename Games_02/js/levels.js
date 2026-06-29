/* levels.js — six levels, each a stylized puzzle INSPIRED BY a real place and a
   real, documented water/irrigation challenge. Geography is simplified for play;
   the fact blurbs are sourced (see README.md "Domain accuracy & sources").

   Tile types: 'normal' | 'source' | 'sink' | 'pollutant' | 'drainage' | 'obstacle'
   Elevation: integer 0..9 (abstract units, NOT metres). Higher = water flows away from it.

   Each level provides elev(x,y) and a feature list; grid.js builds the tile array. */

(function (global) {
  const W = 16, H = 12;
  const clampE = v => Math.max(0, Math.min(9, Math.round(v)));

  // Weather timelines (Q7: dynamic). Each step modifies the world during Test:
  //   supply      = relative water available at source (affects flat-stall risk)
  //   contamBoost = tiles ADDED to every pollutant radius this step (runoff spreads pollution)
  //   waterlog    = multiplier on flat-segment penalty (wet seasons waterlog flat land)
  const WX = {
    steady:   [{ name: 'Steady flow', icon: '🌤️', supply: 1.0, contamBoost: 0, waterlog: 1.0 }],
    drywet:   [
      { name: 'Dry season',  icon: '☀️', supply: 0.7, contamBoost: 0, waterlog: 0.6 },
      { name: 'Wet season',  icon: '🌧️', supply: 1.2, contamBoost: 1, waterlog: 1.3 },
    ],
    monsoon:  [
      { name: 'Dry season',     icon: '☀️', supply: 0.7, contamBoost: 0, waterlog: 0.7 },
      { name: 'Monsoon rains',  icon: '🌧️', supply: 1.3, contamBoost: 1, waterlog: 1.4 },
      { name: 'Flood pulse',    icon: '🌊', supply: 1.5, contamBoost: 1, waterlog: 1.6 },
    ],
    drought:  [
      { name: 'Allocation cut', icon: '📉', supply: 0.6, contamBoost: 0, waterlog: 0.8 },
      { name: 'Drought',        icon: '🏜️', supply: 0.5, contamBoost: 1, waterlog: 0.7 },
    ],
  };

  const LEVELS = [
    /* ---------------------------------------------------------------- L1 */
    {
      id: 1, name: 'Mountain Terraces', place: 'Banaue Rice Terraces, Philippines',
      blurb: 'Carve a channel so water flows DOWNHILL from the mountain spring to the rice terraces below. Shorter channels cost less. There are no pollutants here — just learn the carve → test → refine loop.',
      fact: 'The Ifugao people built gravity-fed terraces that channel water from forested watersheds up to ~1,500 m elevation down the slopes via canals and bamboo aqueducts — water moves entirely by gravity.',
      source: 'UNESCO / Britannica — Rice Terraces of the Philippine Cordilleras.',
      objectives: ['Carve a channel from source to farm', 'Keep water flowing downhill', 'Minimise channel length to lower cost'],
      // High at top (mountain), low at bottom (terraces step down)
      elev: (x, y) => clampE(9 - (y / (H - 1)) * 8 - (x % 4 === 0 ? 0.4 : 0)),
      source0: [2, 0], sinks: [[12, 11]],
      features: [
        { type: 'obstacle', cells: [[7, 4], [7, 5], [8, 5]] }, // rock outcrop
      ],
      sdg: 'SDG 6.4 water-use efficiency · 7.3 energy (gravity = no pumping) · 2.4 sustainable food · 11.4 cultural heritage',
      budget: 60, qualityThreshold: 80, weather: WX.steady, allowBranching: false,
    },

    /* ---------------------------------------------------------------- L2 */
    {
      id: 2, name: 'Pumping Over the Ridge', place: 'California Central Valley, USA',
      blurb: 'A mountain ridge sits between the river (left) and the farms (right). You CAN carve straight over the ridge — but lifting water uphill costs pumping energy. Look for a lower pass to keep costs down.',
      fact: 'The California Aqueduct pumps water UPHILL: the Edmonston Pumping Plant lifts it 1,926 ft (587 m) over the Tehachapi Mountains. Pumping energy is a dominant cost of moving irrigation water.',
      source: 'Wikipedia — California Aqueduct; Univ. of Nebraska–Lincoln Irrigation Course Ch.13 (pumping energy cost).',
      objectives: ['Reach the farms across the terrain', 'Notice pumping cost when you climb', 'Find the low pass to cut pumping cost'],
      // Low basin on both sides, a high N–S ridge near x=8 with a low pass at y≈8
      elev: (x, y) => {
        const ridge = Math.max(0, 6 - Math.abs(x - 8) * 2.2);     // ridge bump
        const pass = (Math.abs(y - 8) <= 1) ? -4 : 0;             // a gap (low pass)
        return clampE(2 + ridge + pass);
      },
      source0: [1, 6], sinks: [[14, 6]],
      features: [
        { type: 'pollutant', x: 4, y: 3, radius: 1 }, // a pesticide field to also avoid
      ],
      sdg: 'SDG 7.3 pumping energy · 6.4 water-use efficiency · 13.1 climate/emissions · 9.1 resilient infrastructure',
      budget: 95, qualityThreshold: 75, weather: WX.steady, allowBranching: false,
    },

    /* ---------------------------------------------------------------- L3 */
    {
      id: 3, name: 'Clean Water Through the Delta', place: 'Mekong Delta, Vietnam',
      blurb: 'Flat delta, criss-crossed by canals. Pesticide pollution is worst in the canal water, so route AROUND the contaminated zones. Watch the seasons — monsoon rains spread pollution further.',
      fact: 'Pesticide use in the Mekong Delta rose to 70,000–100,000 tonnes/year (2019–21), and measured concentrations are HIGHEST in canal waters. The delta floods in the wet season and salinises in the dry season.',
      source: 'PubMed (pesticides in Mekong drinking-water sources); VESDEC; UNDP flooding report.',
      objectives: ['Deliver water to both farms', 'Route around pesticide zones', 'Stay clean even when monsoon spreads pollution'],
      elev: (x, y) => clampE(2.4 - (x / (W - 1)) * 1.6 + (y % 5 === 0 ? 0.3 : 0)), // very gentle slope L→R
      source0: [0, 6], sinks: [[15, 2], [15, 9]],
      features: [
        { type: 'pollutant', x: 6, y: 3, radius: 1 },
        { type: 'pollutant', x: 8, y: 7, radius: 1 },
        { type: 'pollutant', x: 11, y: 5, radius: 1 },
        { type: 'drainage', cells: [[3, 6], [4, 6], [5, 6]] }, // an old canal segment to reuse
      ],
      sdg: 'SDG 6.3 water quality & pollution · 12.4 chemical/pesticide management · 13.1 climate adaptation · 3.9 health',
      budget: 150, qualityThreshold: 75, weather: WX.monsoon, allowBranching: true,
    },

    /* ---------------------------------------------------------------- L4 */
    {
      id: 4, name: 'Reuse the Old Canals', place: 'Indus Basin, Punjab, Pakistan',
      blurb: 'This huge gravity system was built WITHOUT enough drainage, causing waterlogging and salty soils. Reuse the existing drainage channels (they give a cost credit) and avoid leaving long flat unlined runs that waterlog.',
      fact: 'The Indus gravity irrigation system, built without drainage, raised the water table to within ~1.5 m of the surface, waterlogging and salinising ~4.5 million hectares. Unlined canals leak; reuse and lining help.',
      source: 'ScienceDirect / Nature Scientific Reports — salinity & waterlogging in the Indus Basin.',
      objectives: ['Deliver water to both farms', 'Reuse existing drainage for credit', 'Avoid long flat waterlogging runs'],
      elev: (x, y) => clampE(2.2 - (x / (W - 1)) * 1.4), // flat, faint slope
      source0: [0, 5], sinks: [[15, 3], [15, 9]],
      features: [
        { type: 'drainage', cells: [[3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [7, 4], [7, 6]] },
        { type: 'pollutant', x: 10, y: 6, radius: 1 }, // saline seep
        { type: 'obstacle', cells: [[9, 2], [9, 10]] },
      ],
      sdg: 'SDG 6.5 integrated water management · 15.3 land degradation/salinity · 12.5 reuse · 2.4 productive soils',
      budget: 170, qualityThreshold: 78, weather: WX.drywet, allowBranching: true,
    },

    /* ---------------------------------------------------------------- L5 */
    {
      id: 5, name: 'Too Flat to Flow', place: 'Nile Delta, Egypt',
      blurb: 'The delta is so flat that gravity alone can barely move water — long flat runs stall and need pumping. Sewage and industrial pollution sit in the drains. Balance pumping cost against clean delivery.',
      fact: 'Because the Nile Delta is so flat, direct gravity irrigation is usually NOT possible, so farmers pump. Drains carry industrial effluent and untreated sewage, and salinity rises from ~250 ppm upstream to ~2,700 ppm at the delta.',
      source: 'IRD / ScienceDirect — Nile Delta irrigation & water quality; Wikipedia — Water resources management in Egypt.',
      objectives: ['Deliver water across very flat land', 'Accept some pumping where gravity stalls', 'Route around sewage/industrial pollution'],
      elev: (x, y) => clampE(2 - (y / (H - 1)) * 1.0), // nearly flat, very faint fall to the south
      source0: [1, 0], sinks: [[14, 11]],
      features: [
        { type: 'pollutant', x: 7, y: 4, radius: 2 },  // big effluent drain
        { type: 'pollutant', x: 11, y: 8, radius: 1 },
        { type: 'obstacle', cells: [[4, 7], [5, 7], [10, 3]] },
        { type: 'drainage', cells: [[2, 0], [2, 1], [2, 2]] },
      ],
      sdg: 'SDG 6.2 sanitation/wastewater · 6.3 water quality · 7.3 pumping energy · 11.6 urban wastewater',
      budget: 200, qualityThreshold: 80, weather: WX.drywet, allowBranching: true,
    },

    /* ---------------------------------------------------------------- L6 */
    {
      id: 6, name: 'Share a Shrinking River', place: 'Murray–Darling Basin, Australia',
      blurb: 'Capstone. Water is over-allocated and the budget was cut — deliver to THREE farms on a tight budget, dodge saline seeps, reuse old channels, and survive a drought cycle. Everything you learned, at once.',
      fact: 'Two-thirds of Australia’s irrigation water is used in the Murray–Darling Basin. Under the Basin Plan, ~20% LESS water is diverted for irrigation to restore the environment — forcing efficient, low-cost design.',
      source: 'Murray–Darling Basin Authority; MDPI (Water) — salinity management in the Basin.',
      objectives: ['Deliver to all three farms', 'Stay within the cut budget', 'Avoid salinity and reuse channels under drought'],
      elev: (x, y) => clampE(4 - (x / (W - 1)) * 2 + Math.sin(y / 2) * 1.2),
      source0: [0, 6], sinks: [[15, 1], [15, 6], [15, 11]],
      features: [
        { type: 'pollutant', x: 5, y: 3, radius: 1 },
        { type: 'pollutant', x: 8, y: 8, radius: 1 },
        { type: 'pollutant', x: 11, y: 4, radius: 1 },
        { type: 'drainage', cells: [[2, 6], [3, 6], [4, 6], [4, 7]] },
        { type: 'obstacle', cells: [[7, 0], [7, 1], [9, 11], [12, 6]] },
      ],
      sdg: 'SDG 6.4 water scarcity · 6.5/6.6 IWRM & water ecosystems · 13.1 drought resilience · 17 cooperation',
      budget: 210, qualityThreshold: 82, weather: WX.drought, allowBranching: true,
    },
  ];

  // Cost coefficients (game-balance numbers, not currency — see plan §3.3 / §4 A4)
  const COST = {
    perTile: 2,     // construction cost per carved channel tile (length)
    perLift: 4,     // pumping cost per unit of uphill elevation climbed
    perSteep: 6,    // lining cost per too-steep segment
    reuseCredit: 3, // credit per reused drainage tile
    steepDrop: 3,   // |Δelevation| >= this between adjacent tiles = "too steep" (erosion)
    flatPenalty: 1, // gentle surcharge per excess flat tile (waterlogging nudge, not a budget-buster)
    flatRunLen: 5,  // free allowance: only flat tiles beyond this many are surcharged
    contamPenalty: 22, // water-quality points lost per carved tile inside a pollutant radius
  };

  global.FlowPath = global.FlowPath || {};
  global.FlowPath.W = W;
  global.FlowPath.H = H;
  global.FlowPath.LEVELS = LEVELS;
  global.FlowPath.COST = COST;
})(window);
