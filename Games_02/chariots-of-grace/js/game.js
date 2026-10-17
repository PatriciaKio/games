// Chariots of Grace — game engine and UI.
(function () {
  const SAVE_KEY = "chariots-of-grace-save";
  const BEST_KEY = "chariots-of-grace-best";
  const stage = document.getElementById("stage");
  const hud = document.getElementById("hud");
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let S; // game state

  function freshState() {
    return { stop: 0, virtue: 50, faith: 50, talents: 5, crowns: 0, angels: 1, burdens: [], chariot: 0, record: {}, forgivenCount: 0, wisdomUsed: false };
  }

  // ---------- storage (best-effort; game works without it) ----------
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
  function load() { try { const v = localStorage.getItem(SAVE_KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
  function getBest() { try { return parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0; } catch (e) { return 0; } }
  function setBest(v) { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) {} }

  // ---------- helpers ----------
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function el(html) { stage.innerHTML = html; window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); }
  function on(id, fn) { const b = document.getElementById(id); if (b) b.addEventListener("click", fn); }

  // Apply stat changes; returns list of human-readable change chips.
  function apply(d) {
    const chips = [];
    const add = (key, amt, icon, label) => {
      if (!amt) return;
      S[key] += amt;
      chips.push(`<span class="chip ${amt > 0 ? "up" : "down"}">${icon} ${amt > 0 ? "+" : ""}${amt} ${label}</span>`);
    };
    add("virtue", d.virtue, "❤️", "virtue");
    add("faith", d.faith, "✝️", "faith");
    add("talents", d.talents, "🪙", "talents");
    add("crowns", d.crowns, "👑", d.crowns === 1 ? "crown" : "crowns");
    add("angels", d.angels, "👼", d.angels === 1 ? "angel" : "angels");
    S.virtue = clamp(S.virtue, 0, 100);
    S.faith = clamp(S.faith, 0, 100);
    S.talents = Math.max(0, S.talents);
    S.angels = Math.max(0, S.angels);
    renderHUD();
    return chips.join(" ");
  }

  function bar(label, icon, v, cls) {
    return `<div class="stat bar-stat"><span class="label">${icon} ${label}</span>
      <div class="bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-label="${label}"><div class="fill ${cls}" style="width:${v}%"></div></div>
      <span class="val">${v}</span></div>`;
  }

  function renderHUD() {
    if (!S) { hud.innerHTML = ""; return; }
    hud.innerHTML = `
      ${bar("Virtue", "❤️", S.virtue, "virtue")}
      ${bar("Faith", "✝️", S.faith, "faith")}
      <div class="stat"><span class="label">🪙 Talents</span><span class="val big">${S.talents}</span></div>
      <div class="stat"><span class="label">👑 Crowns</span><span class="val big">${S.crowns}</span></div>
      <div class="stat"><span class="label">👼 Angels</span><span class="val big">${S.angels}</span></div>
      <div class="stat"><span class="label">🪨 Burdens</span><span class="val big">${S.burdens.length}</span></div>`;
    renderLaw();
  }

  function renderLaw() {
    const list = document.getElementById("law-list");
    list.innerHTML = window.COMMANDMENTS.map(c => {
      const r = S && S.record[c.n];
      const badge = !r ? "" :
        r === "righteous" ? `<span class="rec kept">✔ Kept</span>` :
        r === "compromise" ? `<span class="rec half">≈ Half-hearted</span>` :
        r === "forgiven" ? `<span class="rec forgiven">🕊️ Broken — forgiven</span>` :
        `<span class="rec broke">🪨 Broken</span>`;
      return `<li><div class="law-head"><b>${c.short}</b> ${badge}</div>
        <div class="law-text">“${esc(c.text)}” <span class="ref">${c.ref}</span></div>
        <div class="law-meaning">${esc(c.meaning)}</div></li>`;
    }).join("");
  }

  // ---------- screens ----------
  function intro() {
    const saved = load();
    const best = getBest();
    S = null; renderHUD();
    el(`<div class="intro">
      <div class="intro-art">${ART.angel("float")}${ART.chariot(3, "drive")}${ART.angel("float delay")}</div>
      <h1>Chariots of Grace</h1>
      <p class="lede">Ride from Babylon to the throne of heaven. At every stop you'll hear a Bible story, then face a real-life choice that tests one of the Ten Commandments.</p>
      <ul class="intro-list">
        <li>👑 Faithful choices earn crowns</li>
        <li>🪨 Wrong choices add burdens — but repentance always brings forgiveness</li>
        <li>🎲 Cast the lot for unexpected moments of grace</li>
        <li>👼 Angels guide and guard you on the road</li>
      </ul>
      ${best ? `<p class="hint">Your best journey: <b>${best}</b> points</p>` : ""}
      <div class="btn-row center">
        ${saved && saved.stop > 0 ? `<button id="btn-resume" class="primary">Continue journey (stop ${saved.stop + 1})</button>` : ""}
        <button id="btn-new" class="${saved && saved.stop > 0 ? "" : "primary"}">Begin a new journey</button>
      </div></div>`);
    on("btn-resume", () => { S = saved; renderHUD(); map(); });
    on("btn-new", () => { S = freshState(); save(); renderHUD(); map(); });
  }

  function mapSVG() {
    const n = window.JOURNEY.length + 1; // +1 for the throne
    const W = 1000, H = 230;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const x = 50 + i * ((W - 100) / (n - 1));
      const y = 140 + Math.sin(i * 0.9) * 50;
      pts.push([x, y]);
    }
    const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(0) + " " + p[1].toFixed(0)).join(" ");
    const nodes = pts.map((p, i) => {
      const isThrone = i === n - 1;
      const done = i < S.stop, here = i === S.stop;
      const stop = window.JOURNEY[i];
      const icon = isThrone ? "🪑" : stop.type === "forgive" ? "🕊️" : stop.type === "temple" ? "🪙" : (stop.cmd);
      return `<g class="node ${done ? "done" : ""} ${here ? "here" : ""}">
        <title>${isThrone ? "The Throne Room" : esc(stop.place + " — " + stop.title)}</title>
        <circle cx="${p[0]}" cy="${p[1]}" r="${isThrone ? 24 : 18}"/>
        <text x="${p[0]}" y="${p[1] + 6}" text-anchor="middle">${icon}</text></g>`;
    }).join("");
    const cur = pts[Math.min(S.stop, n - 1)];
    return `<svg class="map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Journey map: stop ${S.stop + 1} of ${n}">
      <path d="${path}" class="road"/>
      ${nodes}
      <g transform="translate(${cur[0] - 60} ${cur[1] - 86}) scale(0.7)">${ART.chariot(S.chariot).replace("<svg ", '<svg width="170" height="100" ')}</g>
    </svg>`;
  }

  function map() {
    save();
    if (S.stop >= window.JOURNEY.length) return ascension();
    const stop = window.JOURNEY[S.stop];
    const next = window.CHARIOTS[S.chariot + 1];
    const label = stop.type === "chapter" ? `Commandment ${stop.cmd}: ${window.COMMANDMENTS[stop.cmd - 1].short}` :
      stop.type === "forgive" ? "A story of forgiveness" : "A story of giving";
    el(`<div class="map-wrap">${mapSVG()}</div>
      <div class="next-card">
        <div class="eyebrow">Stop ${S.stop + 1} of ${window.JOURNEY.length} · ${esc(stop.place)}</div>
        <h2>${esc(stop.title)}</h2>
        <p class="hint">${esc(label)}</p>
        <div class="btn-row"><button id="btn-go" class="primary">🛞 Ride on</button></div>
      </div>
      <div class="stable">
        <div class="stable-art">${ART.chariot(S.chariot)}</div>
        <div><b>Your chariot: ${window.CHARIOTS[S.chariot].name}</b>
          <p class="hint">${window.CHARIOTS[S.chariot].desc}</p>
          ${S.burdens.length ? `<p class="hint">🪨 Carrying ${S.burdens.length} burden${S.burdens.length > 1 ? "s" : ""}: ${S.burdens.map(esc).join(", ")}. Forgiving others lifts a burden — and at the throne, every burden can be laid down.</p>` : ""}
          ${next ? `<button id="btn-upgrade" ${S.talents < next.cost ? "disabled" : ""}>Upgrade to ${next.name} — 🪙 ${next.cost}</button>
            <p class="hint">${next.desc}</p>` : `<p class="hint">🔥 You ride the finest chariot in all the land.</p>`}
        </div>
      </div>`);
    on("btn-go", () => story(stop));
    on("btn-upgrade", () => {
      if (!next || S.talents < next.cost) return;
      S.talents -= next.cost; S.chariot++; renderHUD(); map();
    });
  }

  function story(stop) {
    const cmd = stop.cmd ? window.COMMANDMENTS[stop.cmd - 1] : null;
    el(`<article class="scroll">
      <div class="eyebrow">${esc(stop.place)} · ${esc(stop.ref)}</div>
      <h2>${esc(stop.title)}</h2>
      ${cmd ? `<div class="tablet"><span>Commandment ${cmd.n}</span>“${esc(cmd.text)}”</div>` : ""}
      <p class="story-text">${esc(stop.story)}</p>
      <blockquote>“${esc(stop.verse.text)}” <cite>— ${esc(stop.verse.ref)} (KJV)</cite></blockquote>
      <div class="btn-row"><button id="btn-choice" class="primary">Your life choice →</button></div>
    </article>`);
    on("btn-choice", () => stop.type === "temple" ? temple(stop) : choice(stop));
  }

  function choice(stop) {
    S.wisdomUsed = false;
    // Shuffle choice order so the "right answer" isn't always first.
    const order = stop.choices.map((c, i) => i).sort(() => Math.random() - 0.5);
    const draw = () => {
      el(`<div class="choice-screen">
        <div class="eyebrow">Life choice · ${stop.cmd ? "Commandment " + stop.cmd : esc(stop.title)}</div>
        <p class="prompt">${esc(stop.prompt)}</p>
        <div class="choices">
          ${order.map(i => `<button class="choice ${S.wisdomUsed && stop.choices[i].kind === "righteous" ? "lit" : ""}" data-i="${i}">
            ${S.wisdomUsed && stop.choices[i].kind === "righteous" ? "<span class='angel-tag'>👼 The angel points here</span>" : ""}
            ${esc(stop.choices[i].text)}</button>`).join("")}
        </div>
        <div class="btn-row">
          <button id="btn-wisdom" ${S.angels < 1 || S.wisdomUsed ? "disabled" : ""}>👼 Ask an angel for wisdom (${S.angels})</button>
        </div>
        <p class="hint">“If any of you lack wisdom, let him ask of God.” — James 1:5</p>
      </div>`);
      stage.querySelectorAll(".choice").forEach(b => b.addEventListener("click", () => outcome(stop, stop.choices[+b.dataset.i])));
      on("btn-wisdom", () => { if (S.angels < 1) return; S.angels--; S.wisdomUsed = true; renderHUD(); draw(); });
    };
    draw();
  }

  function outcome(stop, c) {
    const d = { virtue: c.virtue, faith: c.faith, talents: c.talents };
    if (c.kind === "righteous") { d.crowns = 1; d.talents += window.CHARIOTS[S.chariot].bonus; }
    const chips = apply(d);
    if (stop.cmd) S.record[stop.cmd] = c.kind;
    let extra = "";
    if (c.forgives && S.burdens.length) {
      const lifted = S.burdens.shift();
      extra = `<p class="grace-note">🕊️ Because you forgave, your own burden — <b>${esc(lifted)}</b> — has been lifted.</p>`;
      if (S.record) Object.keys(S.record).forEach(k => { if (S.record[k] === "sin" && window.COMMANDMENTS[k - 1].short === lifted) S.record[k] = "forgiven"; });
    }
    if (c.kind === "sin") S.burdens.push(stop.cmd ? window.COMMANDMENTS[stop.cmd - 1].short : stop.type === "forgive" ? "Holding a grudge" : stop.title);
    renderHUD();
    const head = c.kind === "righteous" ? "✨ A faithful choice" : c.kind === "compromise" ? "⚖️ A half-hearted choice" : "🪨 A choice that weighs on you";
    el(`<div class="outcome ${c.kind}">
      <h2>${head}</h2>
      ${c.kind === "righteous" ? `<div class="crown-pop">${ART.crown("pop")}</div>` : ""}
      <p>${esc(c.outcome)}</p>
      <div class="chips">${chips}</div>
      ${extra}
      <div class="btn-row"><button id="btn-next" class="primary">${c.kind === "sin" ? "Continue →" : "Cast the lot 🎲"}</button></div>
    </div>`);
    on("btn-next", () => c.kind === "sin" ? repent(stop) : grace());
  }

  function repent(stop) {
    el(`<div class="repent">
      <div class="eyebrow">Luke 15 · The Prodigal Son</div>
      <h2>The Road Home</h2>
      <p>A young man took his inheritance, wasted it, and ended up feeding pigs. When he finally came to his senses and walked home, his father saw him from far away — and <b>ran</b> to embrace him. He didn't wait for an apology speech. He threw a feast.</p>
      <p class="prompt">You're carrying a burden from that choice. What will you do?</p>
      <div class="choices">
        <button class="choice" id="btn-confess">🙏 Confess, apologize to the person I hurt, and make it right.</button>
        <button class="choice" id="btn-walk">🚶 Walk on and try to forget about it.</button>
      </div>
    </div>`);
    on("btn-confess", () => {
      S.burdens.pop();
      if (stop.cmd) S.record[stop.cmd] = "forgiven";
      S.forgivenCount++;
      const cost = Math.min(2, S.talents);
      const chips = apply({ virtue: 6, faith: 5, talents: -cost });
      el(`<div class="outcome forgiven">
        <h2>🕊️ Forgiven</h2>
        <div class="angel-pop">${ART.angel("float")}</div>
        <p>Your burden is lifted. Making amends cost you a little${cost ? " (restitution, like Zacchaeus)" : ""} — but the Father's arms were already open.</p>
        <blockquote>“If we confess our sins, he is faithful and just to forgive us our sins.” <cite>— 1 John 1:9 (KJV)</cite></blockquote>
        <div class="chips">${chips}</div>
        <div class="btn-row"><button id="btn-next" class="primary">Cast the lot 🎲</button></div>
      </div>`);
      on("btn-next", grace);
    });
    on("btn-walk", () => {
      el(`<div class="outcome sin">
        <h2>🪨 The burden stays</h2>
        <p>You carry it with you. The road home is always open — forgiving someone else can lift a burden, and at the throne you'll have one more chance to lay them all down.</p>
        <div class="btn-row"><button id="btn-next" class="primary">Cast the lot 🎲</button></div>
      </div>`);
      on("btn-next", grace);
    });
  }

  function temple(stop) {
    const t = S.talents;
    const generous = Math.max(1, Math.ceil(t / 2));
    el(`<div class="choice-screen">
      <div class="eyebrow">The temple treasury</div>
      <p class="prompt">${esc(stop.prompt)} You have 🪙 ${t}.</p>
      <div class="choices">
        ${t > 0 ? `<button class="choice" id="g-big">💛 Give generously — ${t <= 2 ? "everything I have" : "half of what I have"} (🪙 ${Math.min(generous, t)})</button>` : ""}
        ${t > 2 ? `<button class="choice" id="g-small">🙂 Give a single coin (🪙 1)</button>` : ""}
        <button class="choice" id="g-none">🙈 Walk past — I might need it later.</button>
      </div>
      <p class="hint">“Give, and it shall be given unto you; good measure, pressed down, and shaken together.” — Luke 6:38</p>
    </div>`);
    const finish = (kind, amt) => {
      let d = { talents: -amt };
      let msg;
      if (kind === "righteous") { d.virtue = 12; d.faith = 8; d.crowns = 1; msg = "Like the widow, you gave from the heart. Jesus noticed — and so did a family who ate well tonight."; }
      else if (kind === "compromise") { d.virtue = 3; d.faith = 1; msg = "A small gift is still a gift. But you held most of it back."; }
      else { d.virtue = -4; d.faith = -2; msg = "You kept your talents. The coins feel heavier than they did a minute ago."; }
      const chips = apply(d);
      // "Pressed down and shaken together": generous givers may be repaid.
      let back = "";
      if (kind === "righteous" && Math.random() < 0.5) {
        const r = amt + 2;
        back = `<p class="grace-note">🎁 Good measure, pressed down! A stranger repays your kindness: ${apply({ talents: r })}</p>`;
      }
      el(`<div class="outcome ${kind}">
        <h2>${kind === "righteous" ? "💛 A cheerful giver" : kind === "compromise" ? "🙂 A small gift" : "🙈 Walking past"}</h2>
        ${kind === "righteous" ? `<div class="crown-pop">${ART.crown("pop")}</div>` : ""}
        <p>${msg}</p>
        <div class="chips">${chips}</div>${back}
        <p class="hint">Want to give for real? The <a href="#" id="to-donate">Donate</a> tab supports keeping this game free for every family.</p>
        <div class="btn-row"><button id="btn-next" class="primary">Cast the lot 🎲</button></div>
      </div>`);
      on("to-donate", e => { e.preventDefault(); showTab("donate"); });
      on("btn-next", grace);
    };
    on("g-big", () => finish("righteous", Math.min(generous, t)));
    on("g-small", () => finish("compromise", 1));
    on("g-none", () => finish("none", 0));
  }

  function grace() {
    el(`<div class="grace">
      <div class="eyebrow">A Moment of Grace</div>
      <h2>Cast the lot</h2>
      <p class="hint">“The lot is cast into the lap; but the whole disposing thereof is of the LORD.” — Proverbs 16:33</p>
      <div id="die-box" class="die-box">${ART.die(1)}</div>
      ${S.faith >= 70 ? `<p class="hint">✝️ Your strong faith adds +1 to the roll.</p>` : `<p class="hint">Reach 70 faith to add +1 to every roll.</p>`}
      <div class="btn-row center"><button id="btn-roll" class="primary">🎲 Cast the lot</button></div>
      <div id="grace-result" aria-live="polite"></div>
    </div>`);
    on("btn-roll", () => {
      const btn = document.getElementById("btn-roll");
      btn.disabled = true;
      const box = document.getElementById("die-box");
      const roll = 1 + Math.floor(Math.random() * 6);
      const total = Math.min(7, roll + (S.faith >= 70 ? 1 : 0));
      let ticks = reduceMotion ? 0 : 10;
      const spin = () => {
        if (ticks-- > 0) { box.innerHTML = ART.die(1 + Math.floor(Math.random() * 6)); box.classList.add("rolling"); setTimeout(spin, 70); return; }
        box.classList.remove("rolling");
        box.innerHTML = ART.die(roll);
        showGrace(total);
      };
      spin();
    });
  }

  function showGrace(total) {
    const g = window.GRACE_OUTCOMES[total];
    let d = { talents: g.talents || 0, faith: g.faith || 0, angels: g.angel || 0, crowns: g.crown || 0 };
    let note = "";
    if (g.trial && S.angels > 0) {
      d.talents = 0; d.angels = -1;
      note = `<p class="grace-note">👼 An angel stood guard — you lost nothing, though your faith still grew. (The angel returned to heaven.)</p>`;
    }
    let chariotNote = "";
    if (g.chariot && S.chariot < window.CHARIOTS.length - 1) {
      S.chariot++;
      chariotNote = `<p class="grace-note">🔥 Your chariot is transformed into a <b>${window.CHARIOTS[S.chariot].name}</b>!</p>`;
    } else if (g.chariot) {
      d.talents += 5;
    }
    const chips = apply(d);
    document.getElementById("grace-result").innerHTML = `
      <div class="grace-card">
        <div class="big-icon">${g.icon}</div>
        <h3>${g.title}</h3>
        ${total === 5 || total === 7 ? `<div class="angel-pop">${ART.angel("float")}</div>` : ""}
        <p>${g.text} <span class="ref">${g.ref}</span></p>
        ${note}${chariotNote}
        <div class="chips">${chips || "<span class='chip'>Peace on the road</span>"}</div>
        <div class="btn-row center"><button id="btn-onward" class="primary">Onward 🛞</button></div>
      </div>`;
    document.getElementById("grace-result").scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    on("btn-onward", () => { S.stop++; save(); map(); });
  }

  // ---------- finale ----------
  function ascension() {
    el(`<div class="ascend">
      <div class="eyebrow">2 Kings 2:11</div>
      <h2>A Chariot of Fire</h2>
      <div class="sky">${ART.chariot(3, "rise")}</div>
      <p>As Elijah walked with Elisha, a chariot of fire and horses of fire appeared, and Elijah went up by a whirlwind into heaven. Now your journey, too, rises toward the throne.</p>
      <div class="btn-row center"><button id="btn-throne" class="primary">Enter the throne room 🪑</button></div>
    </div>`);
    on("btn-throne", throneRoom);
  }

  function throneRoom() {
    const b = S.burdens.length;
    el(`<div class="throne-room">
      <div class="eyebrow">Revelation 4</div>
      <h2>The Throne Room</h2>
      <div class="throne-art">${ART.throne()}</div>
      <div class="elders" aria-label="Twenty-four elders on thrones">${Array.from({ length: 24 }, () => ART.smallThrone()).join("")}</div>
      <p>A throne stood in heaven, with a rainbow around it like an emerald. Around it were twenty-four thrones, and on them sat elders in white, wearing crowns of gold.</p>
      ${b ? `<p class="prompt">You are still carrying 🪨 ${b} burden${b > 1 ? "s" : ""}: ${S.burdens.map(esc).join(", ")}.</p>
        <div class="btn-row center"><button id="btn-lay" class="primary">🙏 Lay my burdens down</button></div>`
        : `<p class="prompt">You arrive with no burdens. Your hands are free to hold your crowns.</p>
        <div class="btn-row center"><button id="btn-cast" class="primary">👑 Cast my crowns before the throne</button></div>`}
    </div>`);
    on("btn-lay", () => {
      Object.keys(S.record).forEach(k => { if (S.record[k] === "sin") S.record[k] = "forgiven"; });
      S.forgivenCount += S.burdens.length;
      S.burdens = []; renderHUD();
      el(`<div class="outcome forgiven">
        <h2>🕊️ All is forgiven</h2>
        <div class="angel-pop">${ART.angel("float")}</div>
        <p>Every burden falls away. Grace was never something you earned — it was a gift all along.</p>
        <blockquote>“Come unto me, all ye that labour and are heavy laden, and I will give you rest.” <cite>— Matthew 11:28 (KJV)</cite></blockquote>
        <div class="btn-row center"><button id="btn-cast" class="primary">👑 Cast my crowns before the throne</button></div>
      </div>`);
      on("btn-cast", castCrowns);
    });
    on("btn-cast", castCrowns);
  }

  function castCrowns() {
    const n = S.crowns;
    el(`<div class="throne-room">
      <div class="throne-art">${ART.throne()}</div>
      <div class="crown-row">${Array.from({ length: n }, (_, i) => `<span class="cast" style="animation-delay:${i * 0.18}s">${ART.crown()}</span>`).join("") || "<p class='hint'>No crowns this time — and still you're welcomed in.</p>"}</div>
      <blockquote>“The four and twenty elders … cast their crowns before the throne, saying, Thou art worthy, O Lord.” <cite>— Revelation 4:10–11 (KJV)</cite></blockquote>
      <div class="btn-row center"><button id="btn-end" class="primary">See your journey</button></div>
    </div>`);
    on("btn-end", ending);
  }

  function ending() {
    const kept = Object.values(S.record).filter(v => v === "righteous").length;
    const score = S.crowns * 100 + S.virtue + S.faith + S.talents + S.forgivenCount * 10;
    const best = getBest();
    if (score > best) setBest(score);
    const title =
      S.crowns >= 11 ? { t: "Good and Faithful Servant", v: "Well done, thou good and faithful servant.", r: "Matthew 25:21" } :
      S.crowns >= 8 ? { t: "Light of the World", v: "Ye are the light of the world.", r: "Matthew 5:14" } :
      S.crowns >= 4 ? { t: "Pilgrim on the Way", v: "I press toward the mark.", r: "Philippians 3:14" } :
      { t: "Prodigal Welcomed Home", v: "This my son was dead, and is alive again; he was lost, and is found.", r: "Luke 15:24" };
    clearSave();
    el(`<div class="ending">
      <div class="eyebrow">Your journey is complete</div>
      ${ART.crown("big")}
      <h2>${title.t}</h2>
      <blockquote>“${title.v}” <cite>— ${title.r} (KJV)</cite></blockquote>
      <blockquote>“To him that overcometh will I grant to sit with me in my throne.” <cite>— Revelation 3:21 (KJV)</cite></blockquote>
      <div class="summary">
        <div><b>${S.crowns}</b><span>👑 Crowns</span></div>
        <div><b>${kept}/10</b><span>📜 Commandments kept</span></div>
        <div><b>${S.forgivenCount}</b><span>🕊️ Times forgiven</span></div>
        <div><b>${S.virtue}</b><span>❤️ Virtue</span></div>
        <div><b>${S.faith}</b><span>✝️ Faith</span></div>
        <div><b>${score}</b><span>⭐ Score${score > best ? " (new best!)" : ""}</span></div>
      </div>
      <p class="hint">See how you did on each commandment in the <a href="#" id="to-law">Commandments</a> tab.</p>
      <div class="btn-row center">
        <button id="btn-again" class="primary">Ride again</button>
        <a class="btn-link" href="https://ko-fi.com/gigglebyte1010" target="_blank" rel="noopener">💛 Pay it forward — donate</a>
      </div>
    </div>`);
    on("to-law", e => { e.preventDefault(); showTab("law"); });
    on("btn-again", () => { S = freshState(); save(); renderHUD(); map(); });
  }

  // ---------- tabs ----------
  function showTab(name) {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + name));
    window.scrollTo(0, 0);
  }
  document.querySelectorAll(".nav-tab").forEach(t => t.addEventListener("click", () => showTab(t.dataset.tab)));

  renderLaw();
  intro();
})();
