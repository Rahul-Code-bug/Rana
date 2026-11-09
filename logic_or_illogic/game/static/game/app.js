(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CATS = Object.fromEntries(JSON.parse($('#cats').textContent).map(c => [c.key, c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const csrf = () => (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '';
const api = async (url, body) => {
  const r = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf() }, body: JSON.stringify(body) } : {});
  const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Request failed'); return d;
};
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2400); };

let cfg = { mode: 'free', difficulty: '', category: '' }, S, q, queue = [], tid, left = 30, locked = true;
let recent = store.get('loi_recent', []);
const fresh = () => ({ points: 0, answered: 0, correct: 0, wrong: 0, creative: 0, streak: 0 });

// ---------- navigation ----------
function show(v) {
  if (!$('#view-' + v)) v = 'home';
  $$('.view').forEach(e => e.classList.toggle('active', e.id === 'view-' + v));
  $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.view === v));
  $('#nav').classList.remove('open'); scrollTo(0, 0);
  if (v === 'leaderboard') loadBoard();
}
addEventListener('hashchange', () => show(location.hash.slice(1)));
$('#burger').onclick = () => $('#nav').classList.toggle('open');
const go = v => { location.hash === '#' + v ? show(v) : (location.hash = v); };
show(location.hash.slice(1) || 'home');

// ---------- setup ----------
function showSetup() { clearInterval(tid); $('#setup').hidden = false; $('#arena').hidden = true; $('#results').hidden = true; }
$$('#modes button').forEach(b => b.onclick = () => { cfg.mode = b.dataset.mode; $$('#modes button').forEach(x => x.classList.toggle('on', x === b)); });
$('#startBtn').onclick = () => { showSetup(); go('play'); };
$('#dailyBtn').onclick = () => { setMode('daily'); startGame(); };
$$('.cat').forEach(b => b.onclick = () => { $('#category').value = b.dataset.cat; startGame(); });
$('#go').onclick = startGame;
function setMode(m) { cfg.mode = m; $$('#modes button').forEach(x => x.classList.toggle('on', x.dataset.mode === m)); }

// ---------- game ----------
async function startGame() {
  cfg.difficulty = $('#difficulty').value; cfg.category = $('#category').value;
  S = fresh(); queue = []; renderStats();
  $('#setup').hidden = true; $('#results').hidden = true; $('#arena').hidden = false;
  go('play');
  if (cfg.mode === 'daily') {
    try { queue = (await api('/api/daily')).questions; } catch (e) { toast(e.message); return showSetup(); }
  }
  nextQ();
}
async function nextQ() {
  clearInterval(tid); locked = true;
  $('#feedback').hidden = true; $('#submit').disabled = true;
  $('#qtext').innerHTML = '<span class="loader"></span>';
  try {
    if (cfg.mode === 'daily') { q = queue.shift(); if (!q) return finish(); }
    else {
      const p = new URLSearchParams({ exclude: recent.slice(-120).join(','), category: cfg.category, difficulty: cfg.difficulty });
      q = await api('/api/question?' + p);
    }
  } catch (e) { $('#qtext').textContent = e.message; return; }
  recent.push(q.id); store.set('loi_recent', recent.slice(-200));
  const c = CATS[q.category];
  $('#b-cat').textContent = c.emoji + ' ' + c.label;
  $('#b-diff').textContent = q.difficulty[0].toUpperCase() + q.difficulty.slice(1) + (q.source === 'ai' ? ' · AI' : '');
  $('#qtext').textContent = q.text;
  const card = $('#qcard'); card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
  const a = $('#answer'); a.value = ''; a.focus(); locked = false; $('#submit').disabled = false;
  if (cfg.mode === 'timer') startTimer(); else $('#timer').hidden = true;
}
function startTimer() {
  left = 30; $('#timer').hidden = false; const bar = $('#timerBar'); bar.style.width = '100%';
  tid = setInterval(() => { left--; bar.style.width = (left / 30 * 100) + '%'; if (left <= 0) { clearInterval(tid); submit(); } }, 1000);
}
async function submit() {
  if (locked) return; locked = true; clearInterval(tid); $('#submit').disabled = true;
  let r;
  try { r = await api('/api/answer', { question_id: q.id, answer: $('#answer').value, seconds_left: Math.max(left, 0), timed: cfg.mode === 'timer' }); }
  catch (e) { toast(e.message); locked = false; $('#submit').disabled = false; return; }
  S.answered++; S.points += r.points;
  if (r.verdict === 'correct') { S.correct++; S.streak++; } else if (r.verdict === 'creative') { S.creative++; S.streak++; } else { S.wrong++; S.streak = 0; }
  const f = $('#feedback'); f.className = 'feedback ' + r.verdict; f.hidden = false;
  $('#f-title').textContent = { correct: '✅ Correct!', wrong: '❌ Not quite', creative: '✨ Creative answer!' }[r.verdict];
  $('#f-text').textContent = r.feedback;
  $('#f-exp').textContent = [r.reference && 'Expected: ' + r.reference, r.explanation].filter(Boolean).join(' · ');
  $('#f-pts').textContent = r.points ? '+' + r.points + ' points' : '';
  $('#next').textContent = cfg.mode === 'daily' && !queue.length ? 'See results' : 'Next Question';
  renderStats(); f.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function renderStats() { for (const k in S) $('#s-' + k).textContent = S[k]; }
$('#submit').onclick = submit;
$('#answer').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); });
$('#next').onclick = nextQ;
$('#skip').onclick = () => { if (!locked) nextQ(); };
$('#restart').onclick = () => confirm('Restart and clear this run?') && startGame();

// ---------- results, share, leaderboard ----------
function finish() {
  clearInterval(tid); $('#arena').hidden = true; $('#results').hidden = false; saved = false;
  $('#r-score').textContent = S.points + ' points';
  $('#r-detail').textContent = `${S.answered} answered · ${S.correct} correct · ${S.creative} creative · ${S.wrong} wrong`;
  $('#name').value = store.get('loi_name', '');
}
let saved = false;
$('#finish').onclick = () => S.answered ? finish() : toast('Answer at least one question first.');
$('#again').onclick = showSetup;
$('#save').onclick = async () => {
  if (saved) return toast('Already saved!');
  const name = $('#name').value.trim() || 'Anonymous'; store.set('loi_name', name);
  try { await api('/api/score', { name, points: S.points, answered: S.answered, correct: S.correct + S.creative, mode: cfg.mode }); saved = true; toast('Saved to leaderboard!'); go('leaderboard'); }
  catch (e) { toast(e.message); }
};
$('#share').onclick = async () => {
  const text = `I scored ${S.points} points on Logic or Illogic (${S.answered} questions, ${S.correct + S.creative} good answers). Can you beat me?`;
  try { if (navigator.share) await navigator.share({ title: 'Logic or Illogic', text, url: location.origin }); else { await navigator.clipboard.writeText(text + ' ' + location.origin); toast('Copied to clipboard!'); } }
  catch { /* share cancelled */ }
};
async function loadBoard() {
  const body = $('#board'); body.innerHTML = '';
  try {
    const { scores } = await api('/api/leaderboard');
    if (!scores.length) { body.innerHTML = '<tr><td colspan="6">No scores yet. Be the first!</td></tr>'; return; }
    scores.forEach((s, i) => { const tr = document.createElement('tr');
      [i + 1, s.name, s.points, s.answered, s.correct, s.mode].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.append(td); }); body.append(tr); });
  } catch (e) { body.innerHTML = '<tr><td colspan="6">Could not load scores.</td></tr>'; }
}
})();
