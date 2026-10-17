// Chariots of Grace — inline SVG art (chariots, angels, thrones, crowns).

window.ART = {
  chariot(level, cls) {
    const colors = [
      { body: "#8a6a45", trim: "#5c4630", wheel: "#5c4630" },
      { body: "#b87333", trim: "#7a4a1f", wheel: "#7a4a1f" },
      { body: "#e0b54a", trim: "#a67c1a", wheel: "#a67c1a" },
      { body: "#f2a33a", trim: "#d1462f", wheel: "#d1462f" }
    ][level] || { body: "#8a6a45", trim: "#5c4630", wheel: "#5c4630" };
    const fire = level >= 3 ? `
      <g class="flames">
        <path d="M18 70 Q8 50 22 38 Q20 52 32 46 Q28 60 40 58 Q34 70 18 70Z" fill="#f2a33a"/>
        <path d="M24 70 Q18 56 28 48 Q28 58 36 56 Q32 66 24 70Z" fill="#ffd36b"/>
      </g>` : "";
    const mane = level >= 3 ? "#f2a33a" : "#5c4630";
    const spokes = [0, 45, 90, 135].map(a =>
      `<line x1="0" y1="-15" x2="0" y2="15" transform="rotate(${a})" stroke="${colors.trim}" stroke-width="2.5"/>`).join("");
    return `<svg class="chariot ${cls || ""}" viewBox="0 0 170 100" role="img" aria-label="${window.CHARIOTS[level].name}">
      ${fire}
      <!-- horse -->
      <path d="M104 48 Q92 54 96 72 Q100 60 106 54Z" fill="${mane}"/>
      <g fill="${level >= 3 ? "#fff3d6" : "#e9dcc4"}" stroke="#3b2e22" stroke-width="1.5" stroke-linejoin="round">
        <rect x="107" y="56" width="5" height="28" rx="2"/>
        <rect x="115" y="56" width="5" height="28" rx="2"/>
        <rect x="132" y="56" width="5" height="28" rx="2"/>
        <path d="M140 56 L146 70 L142 72 L136 60Z"/>
        <ellipse cx="124" cy="52" rx="22" ry="11"/>
        <path d="M136 48 L144 24 L152 22 L150 48Z"/>
        <path d="M144 22 Q152 18 164 32 L162 38 L154 36 L148 30Z"/>
        <path d="M146 22 L148 14 L151 21Z"/>
      </g>
      <path d="M144 22 Q138 32 137 46" fill="none" stroke="${mane}" stroke-width="4" stroke-linecap="round"/>
      <!-- reins -->
      <line x1="64" y1="44" x2="134" y2="40" stroke="#3b2e22" stroke-width="1.5"/>
      <!-- body -->
      <path d="M30 40 L74 40 L80 68 L36 68 Q26 56 30 40Z" fill="${colors.body}" stroke="${colors.trim}" stroke-width="2.5"/>
      <path d="M36 48 L72 48" stroke="${colors.trim}" stroke-width="2"/>
      <line x1="76" y1="62" x2="112" y2="62" stroke="${colors.trim}" stroke-width="3"/>
      <!-- wheel -->
      <g transform="translate(54 72)"><g class="wheel">
        <circle r="17" fill="none" stroke="${colors.wheel}" stroke-width="4"/>
        ${spokes}
        <circle r="4" fill="${colors.trim}"/>
      </g></g>
    </svg>`;
  },

  angel(cls) {
    return `<svg class="angel ${cls || ""}" viewBox="0 0 120 120" role="img" aria-label="Angel">
      <ellipse cx="60" cy="18" rx="16" ry="5" fill="none" stroke="#ffd36b" stroke-width="3"/>
      <path d="M56 50 Q20 30 8 52 Q22 50 18 66 Q34 58 32 74 Q46 62 56 64Z" fill="#f4f1ff" stroke="#c9c2ef" stroke-width="1.5"/>
      <path d="M64 50 Q100 30 112 52 Q98 50 102 66 Q86 58 88 74 Q74 62 64 64Z" fill="#f4f1ff" stroke="#c9c2ef" stroke-width="1.5"/>
      <circle cx="60" cy="36" r="11" fill="#f6d9b8"/>
      <path d="M60 46 L82 110 L38 110 Z" fill="#ffffff" stroke="#c9c2ef" stroke-width="1.5"/>
      <path d="M50 74 L70 74" stroke="#ffd36b" stroke-width="2.5"/>
    </svg>`;
  },

  throne(cls) {
    return `<svg class="throne ${cls || ""}" viewBox="0 0 240 200" role="img" aria-label="The throne of heaven, with a rainbow around it">
      <defs>
        <radialGradient id="glory" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#fff6d8"/>
          <stop offset="100%" stop-color="#fff6d8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="120" cy="90" r="100" fill="url(#glory)"/>
      <g fill="none" stroke-width="5" opacity=".85">
        <path d="M30 150 A90 90 0 0 1 210 150" stroke="#e05a5a"/>
        <path d="M36 150 A84 84 0 0 1 204 150" stroke="#f2a33a"/>
        <path d="M42 150 A78 78 0 0 1 198 150" stroke="#f5d76e"/>
        <path d="M48 150 A72 72 0 0 1 192 150" stroke="#6fcf97"/>
        <path d="M54 150 A66 66 0 0 1 186 150" stroke="#5aa9e6"/>
      </g>
      <!-- throne -->
      <path d="M90 60 Q120 40 150 60 L150 120 L90 120Z" fill="#e0b54a" stroke="#a67c1a" stroke-width="3"/>
      <path d="M100 68 Q120 56 140 68 L140 112 L100 112Z" fill="#7a2f4f"/>
      <circle cx="120" cy="54" r="6" fill="#5aa9e6" stroke="#a67c1a" stroke-width="2"/>
      <rect x="82" y="118" width="76" height="14" rx="3" fill="#e0b54a" stroke="#a67c1a" stroke-width="3"/>
      <rect x="90" y="132" width="10" height="20" fill="#a67c1a"/>
      <rect x="140" y="132" width="10" height="20" fill="#a67c1a"/>
      <!-- steps / sea of glass -->
      <rect x="62" y="152" width="116" height="8" rx="2" fill="#cfe8f7"/>
      <rect x="44" y="160" width="152" height="8" rx="2" fill="#b7dcf2"/>
      <ellipse cx="120" cy="184" rx="110" ry="10" fill="#9fd0ee" opacity=".7"/>
    </svg>`;
  },

  smallThrone() {
    return `<svg class="mini-throne" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M12 8 Q20 3 28 8 L28 26 L12 26Z" fill="#e0b54a" stroke="#a67c1a" stroke-width="1.5"/>
      <rect x="9" y="25" width="22" height="5" fill="#e0b54a" stroke="#a67c1a" stroke-width="1.5"/>
      <rect x="11" y="30" width="3" height="7" fill="#a67c1a"/><rect x="26" y="30" width="3" height="7" fill="#a67c1a"/>
    </svg>`;
  },

  crown(cls) {
    return `<svg class="crown ${cls || ""}" viewBox="0 0 60 44" aria-hidden="true">
      <path d="M4 38 L8 10 L20 24 L30 4 L40 24 L52 10 L56 38 Z" fill="#e0b54a" stroke="#a67c1a" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="4" y="34" width="52" height="7" rx="2" fill="#c9962b"/>
      <circle cx="30" cy="27" r="4" fill="#d1462f"/><circle cx="16" cy="30" r="3" fill="#5aa9e6"/><circle cx="44" cy="30" r="3" fill="#6fcf97"/>
    </svg>`;
  },

  die(n) {
    const pips = {
      1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[28, 28], [50, 50], [72, 72]],
      4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]]
    }[Math.min(n, 6)] || [];
    return `<svg class="die" viewBox="0 0 100 100" role="img" aria-label="The lot shows ${n}">
      <rect x="6" y="6" width="88" height="88" rx="16" fill="#f6ecd4" stroke="#a67c1a" stroke-width="4"/>
      ${pips.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#2b2118"/>`).join("")}
    </svg>`;
  }
};
