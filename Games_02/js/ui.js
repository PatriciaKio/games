/* ui.js — DOM updates: HUD, cost breakdown, weather bar, messages, modal. */
(function (global) {
  const FP = global.FlowPath;
  const $ = id => document.getElementById(id);

  const UI = {
    setHud(level, idx, total) {
      $('hud-level').textContent = `${idx + 1} / ${total}`;
      $('hud-place').textContent = level.place.split(',')[0];
      $('hud-budget').textContent = level.budget;
    },
    setLive(cost, quality, stars) {
      $('hud-cost').textContent = cost;
      $('hud-quality').textContent = quality;
      $('hud-stars').textContent = stars ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '—';
    },
    setBreakdown(b) {
      $('c-length').textContent = b.length;
      $('c-pump').textContent = b.pump;
      $('c-line').textContent = b.line;
      $('c-reuse').textContent = '-' + b.reuse;
      $('c-total').textContent = b.total + (b.flat ? ` (incl. +${b.flat} waterlog)` : '');
    },
    weather(steps, activeIdx) {
      const bar = $('weather-bar');
      if (!steps || !steps.length) { bar.innerHTML = ''; return; }
      bar.innerHTML = '<b>Weather cycle:</b> ' + steps.map((s, i) =>
        `<span style="opacity:${i === activeIdx ? 1 : .5};font-weight:${i === activeIdx ? 700 : 400}">${s.icon} ${s.weather}</span>`
      ).join(' &nbsp;→&nbsp; ');
    },
    weatherNames(level) {
      const bar = $('weather-bar');
      bar.innerHTML = '<b>Weather cycle:</b> ' + level.weather.map(w => `${w.icon} ${w.name}`).join(' &nbsp;→&nbsp; ')
        + (level.weather.length > 1 ? ' &nbsp;<i>(your design must work in every season)</i>' : '');
    },
    message(text, kind) {
      const m = $('message');
      m.textContent = text;
      m.className = kind || '';
    },
    logCount(n) { $('log-count').textContent = `${n} attempt${n === 1 ? '' : 's'} logged.`; },

    showModal(level, idx, total, onGo) {
      $('modal-title').textContent = `Level ${idx + 1}: ${level.name}`;
      $('modal-place').textContent = level.place;
      $('modal-body').textContent = level.blurb;
      $('modal-fact').innerHTML = '🌍 <b>Real-world fact:</b> ' + level.fact;
      $('modal-source').textContent = 'Source: ' + level.source;
      $('modal-sdg').innerHTML = '🎯 <b>UN Sustainable Development Goals:</b> ' + (level.sdg || '');
      $('modal-objectives').innerHTML = '<b>Goals:</b><ul>' +
        level.objectives.map(o => `<li>${o}</li>`).join('') + '</ul>';
      $('modal').classList.remove('hidden');
      const go = $('modal-go');
      go.textContent = 'Start designing';
      go.onclick = () => { $('modal').classList.add('hidden'); onGo && onGo(); };
    },

    showResult(level, idx, total, result, onNext, onRetry) {
      $('modal-title').textContent = result.pass
        ? `✓ ${level.name} — solved!` : `✗ ${level.name} — not yet`;
      $('modal-sdg').innerHTML = '';
      $('modal-place').textContent = level.place;
      if (result.pass) {
        $('modal-body').innerHTML =
          `<span class="stars">${'★'.repeat(result.stars)}${'☆'.repeat(3 - result.stars)}</span><br>` +
          `Cost <b>${result.maxCost}</b> / ${level.budget} &nbsp;·&nbsp; worst-season quality <b>${result.worstQuality}</b> &nbsp;·&nbsp; score <b>${result.score}</b>.`;
        $('modal-fact').innerHTML = '🌍 ' + level.fact;
        $('modal-source').textContent = 'Source: ' + level.source;
        $('modal-objectives').innerHTML = '';
        const go = $('modal-go');
        go.textContent = (idx + 1 < total) ? 'Next level ▶' : 'Finish 🎉';
        go.onclick = () => { $('modal').classList.add('hidden'); onNext && onNext(); };
      } else {
        $('modal-body').innerHTML = '<b>What went wrong:</b><ul>' +
          result.reasons.map(r => `<li>${r}</li>`).join('') + '</ul>';
        $('modal-fact').innerHTML = '';
        $('modal-source').textContent = '';
        $('modal-objectives').innerHTML = '';
        const go = $('modal-go');
        go.textContent = 'Keep trying';
        go.onclick = () => { $('modal').classList.add('hidden'); onRetry && onRetry(); };
      }
      $('modal').classList.remove('hidden');
    },
  };

  FP.UI = UI;
})(window);
