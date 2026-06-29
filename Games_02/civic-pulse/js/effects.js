/* =====================================================================
   Civic Pulse — effects.js  (FX)
   Pure-decoration layer: seasonal weather particles, screen shake, color
   flashes, and win confetti. Fully self-contained and guarded — if anything
   here fails it must NOT affect game logic. Exposes window.FX.
   ===================================================================== */
const FX = (function () {
  const SEASON = { Spring: "rain", Summer: "heat", Fall: "leaves", Winter: "snow" };
  function layer() { return document.getElementById("weather"); }

  function spawn(el, cls, n, glyphs) {
    let html = "";
    for (let i = 0; i < n; i++) {
      const dur = 4 + Math.random() * 6;
      const left = Math.random() * 100;
      const delay = -Math.random() * dur;
      const glyph = glyphs ? glyphs[Math.floor(Math.random() * glyphs.length)] : "";
      const size = glyphs ? (10 + Math.random() * 16) : 0;
      const style = `left:${left}vw;animation-duration:${dur}s;animation-delay:${delay}s;` +
        (size ? `font-size:${size}px;` : "");
      html += `<div class="wx ${cls}" style="${style}">${glyph}</div>`;
    }
    el.insertAdjacentHTML("beforeend", html);
  }

  function setSeason(season) {
    const el = layer(); if (!el) return;
    const kind = SEASON[season] || "";
    el.className = "weather-layer " + kind;
    el.innerHTML = "";
    if (kind === "rain") spawn(el, "drop", 70);
    else if (kind === "snow") spawn(el, "flake", 55, ["❄", "❅", "❆", "•"]);
    else if (kind === "leaves") spawn(el, "leaf", 26, ["🍂", "🍁", "🍃"]);
    // heat = CSS shimmer overlay only (no particles)
  }

  function shake() {
    const b = document.body;
    b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
    setTimeout(() => b.classList.remove("shake"), 650);
  }

  function flash(kind) {
    const f = document.createElement("div");
    f.className = "fx-flash " + (kind || "");
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 750);
  }

  function confetti() {
    const colors = ["#f5c542", "#4ea1ff", "#36c08f", "#ff6b6b", "#c79bff", "#57d6c4"];
    for (let i = 0; i < 140; i++) {
      const p = document.createElement("div");
      p.className = "confetti";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (2 + Math.random() * 2.2) + "s";
      p.style.animationDelay = (-Math.random() * 1.5) + "s";
      p.style.width = (6 + Math.random() * 6) + "px";
      p.style.height = (8 + Math.random() * 8) + "px";
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4200);
    }
  }

  return { setSeason, shake, flash, confetti };
})();
window.FX = FX;
