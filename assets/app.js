const COURSE = {"lessons":[{"id":"1-1","unit":1,"n":1,"title":"Dare to educate Afghan girls","speaker":"Shabana Basij-Rasikh","strategy":"S1","capstone":false,"built":true},{"id":"1-2","unit":1,"n":2,"title":"Reimagining & adapting traditions is the key for cultural longevity","speaker":"Kelvin Tran","strategy":"S2","capstone":false,"built":true},{"id":"1-3","unit":1,"n":3,"title":"How culture drives behaviours","speaker":"Julien S. Bourrelle","strategy":"S3","capstone":false,"built":true},{"id":"1-4","unit":1,"n":4,"title":"Don't insist on English!","speaker":"Patricia Ryan","strategy":"S4","capstone":false,"built":true},{"id":"1-5","unit":1,"n":5,"title":"The magic washing machine","speaker":"Hans Rosling","strategy":"S5","capstone":false,"built":true},{"id":"1-6","unit":1,"n":6,"title":"What does my headscarf mean to you?","speaker":"Yassmin Abdel-Magied","strategy":null,"capstone":true,"built":true},{"id":"2-1","unit":2,"n":1,"title":"The power of believing that you can improve","speaker":"Carol Dweck","strategy":"S6","capstone":false,"built":true},{"id":"2-2","unit":2,"n":2,"title":"Grit: The power of passion and perseverance","speaker":"Angela Lee Duckworth","strategy":"S7","capstone":false,"built":true},{"id":"2-3","unit":2,"n":3,"title":"How to become a memory master","speaker":"Idriz Zogaj","strategy":"S8","capstone":false,"built":true},{"id":"2-4","unit":2,"n":4,"title":"The brain-changing benefits of exercise","speaker":"Wendy Suzuki","strategy":"S9","capstone":false,"built":true},{"id":"2-5","unit":2,"n":5,"title":"After watching this, your brain will not be the same","speaker":"Lara Boyd","strategy":"S10","capstone":false,"built":true},{"id":"2-6","unit":2,"n":6,"title":"How reliable is your memory?","speaker":"Elizabeth Loftus","strategy":"S11","capstone":true,"built":true},{"id":"3-1","unit":3,"n":1,"title":"How to transform sinking cities into landscapes that fight floods","speaker":"Kotchakorn Voraakhom","strategy":"S12","capstone":false,"built":true},{"id":"3-2","unit":3,"n":2,"title":"Public transport can save our cities","speaker":"Sharath Mahendran","strategy":"S13","capstone":false,"built":true},{"id":"3-3","unit":3,"n":3,"title":"How to revitalize a neighborhood without gentrification","speaker":"Bree Jones","strategy":"S14","capstone":false,"built":true},{"id":"3-4","unit":3,"n":4,"title":"New York's streets? Not so mean any more","speaker":"Janette Sadik-Khan","strategy":"S14","capstone":false,"built":true},{"id":"3-5","unit":3,"n":5,"title":"My architectural philosophy? Bring the community into the process","speaker":"Alejandro Aravena","strategy":"S15","capstone":false,"built":true},{"id":"3-6","unit":3,"n":6,"title":"7 principles for building better cities","speaker":"Peter Calthorpe","strategy":"S16","capstone":true,"built":true}],"steps":["Get ready","Learn the strategy","Listen 1: Main idea","Listen 2: Strategy practice","Listen 3: Check and decode","Academic words","Respond and reflect"]};
/* EIL313 Listening Lab: store, helpers, toast. (COURSE is injected by the build.) */
"use strict";
const KEY = "eil313-listening-v1";
const Store = {
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { this.data = {}; }
    this.data.lessons ||= {};
    this.data.words ||= {};
    return this.data;
  },
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* private mode: progress not saved */ } },
  lesson(id) { return (this.data.lessons[id] ||= { visited: [], ex: {}, notes: {}, sc: {} }); },
};
Store.load();

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const ICON = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  half: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/></svg>',
  done: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="M7.5 12.5l3 3 6-6.5" stroke="#fff"/></svg>',
  circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/></svg>',
};
function mmss(t) { const s = Math.max(0, Math.round(t)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function escHTML(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

let toastTimer;
function toast(msg) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 4000);
}

/** Lesson status from saved data: "done" | "doing" | "new" */
function lessonStatus(id) {
  const L = Store.data.lessons[id];
  if (!L) return "new";
  if (L.done) return "done";
  return (L.visited && L.visited.length) ? "doing" : "new";
}

/* The video player: one YouTube IFrame player per lesson, driven by clip buttons. */
const Player = {
  yt: null, ready: false, stopAt: null, activeBtn: null, timer: null, queue: null,
  init() {
    const el = $("#player");
    if (!el) return;
    this.el = el;
    window.onYouTubeIframeAPIReady = () => this.create();
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => this.fail();
    document.head.appendChild(s);
    this.failTimer = setTimeout(() => { if (!this.ready) this.fail(); }, 12000);
    $$(".speed button").forEach((b) => b.addEventListener("click", () => this.rate(parseFloat(b.dataset.rate))));
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".clip");
      if (b) this.playClip(parseFloat(b.dataset.start), parseFloat(b.dataset.end), b);
      const tl = e.target.closest(".tr-line");
      if (tl) this.playClip(parseFloat(tl.dataset.t), null, null);
    });
  },
  create() {
    if (location.protocol === "file:") return this.fail("file");
    this.yt = new YT.Player("player", {
      videoId: this.el.dataset.yt,
      playerVars: { rel: 0, playsinline: 1, modestbranding: 1, cc_load_policy: 0, start: Math.floor(parseFloat(this.el.dataset.start) || 0), origin: location.origin },
      events: {
        onReady: () => { this.ready = true; clearTimeout(this.failTimer); const r = parseFloat(localStorage.getItem("eil313-rate") || "1"); this.rate(r, true); if (this.queue) { const q = this.queue; this.queue = null; this.playClip(...q); } },
        onStateChange: (e) => { if (e.data === 0 || e.data === 2) this.clearActive(); },
        onError: (e) => { console.warn("YouTube player error", e.data); this.fail(); },
      },
    });
    this.timer = setInterval(() => this.tick(), 250);
  },
  fail(why) {
    const fb = $(".vp-fallback");
    if (fb) { fb.hidden = false; if (why === "file") fb.querySelector("p").insertAdjacentHTML("afterbegin", "<b>Videos can't play when the site is opened as a file.</b> "); }
  },
  rate(r, quiet) {
    $$(".speed button").forEach((b) => b.setAttribute("aria-pressed", String(parseFloat(b.dataset.rate) === r)));
    localStorage.setItem("eil313-rate", String(r));
    if (this.ready) this.yt.setPlaybackRate(r);
    if (!quiet) toast(`Speed: ${r}×`);
  },
  playClip(start, end, btn) {
    if (!this.ready) { this.queue = [start, end, btn]; if (!this.yt) toast("The video is still loading…"); return; }
    if (btn && btn === this.activeBtn && this.yt.getPlayerState() === 1) { this.yt.pauseVideo(); this.clearActive(); return; }
    this.clearActive();
    this.stopAt = end;
    this.activeBtn = btn;
    if (btn) btn.classList.add("playing");
    this.yt.seekTo(start, true);
    this.yt.playVideo();
    const vp = $("[data-video-panel]");
    if (vp && vp.classList.contains("collapsed")) Lesson.toggleVideo(false);
    if (vp) { const r = vp.getBoundingClientRect(); if (r.bottom < 60 || r.top > window.innerHeight - 80) vp.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" }); }
  },
  clearActive() { if (this.activeBtn) this.activeBtn.classList.remove("playing"); this.activeBtn = null; this.stopAt = null; },
  pause() { if (this.ready) { try { this.yt.pauseVideo(); } catch { /* not ready */ } } this.clearActive(); },
  tick() {
    if (!this.ready || typeof this.yt.getCurrentTime !== "function") return;
    const t = this.yt.getCurrentTime();
    if (this.stopAt != null && t >= this.stopAt) { this.yt.pauseVideo(); this.clearActive(); }
    const now = $(".vp-now");
    if (now) now.textContent = mmss(t);
    Transcript.follow(t);
  },
};

/* Interactive transcript (Listen 3): highlight the current line and keep it in view. */
const Transcript = {
  lines: null, cur: -1,
  follow(t) {
    const box = $("[data-transcript]");
    if (!box || !box.open) return;
    this.lines ||= $$(".tr-line", box).map((b) => [parseFloat(b.dataset.t), b]);
    let i = -1;
    for (let k = 0; k < this.lines.length; k++) { if (this.lines[k][0] <= t + 0.2) i = k; else break; }
    if (i === this.cur) return;
    if (this.cur >= 0) this.lines[this.cur][1].classList.remove("now");
    this.cur = i;
    if (i >= 0) {
      const b = this.lines[i][1]; b.classList.add("now");
      if ($("[data-follow]", box)?.checked) { const list = b.closest(".tr-lines"); list.scrollTop = b.parentElement.offsetTop - list.offsetTop - list.clientHeight / 3; }
    }
  },
};

/* Exercises: every type checks itself, explains, saves its state and restores it on reload. */
const Ex = {
  lid: null,
  st(ex) { return (Store.lesson(this.lid).ex[ex.id] ||= {}); },
  setScore(ex, score, total) {
    const s = this.st(ex); s.score = score; s.total = total; Store.save();
    const out = $(".ex-score", ex);
    if (out) out.textContent = total ? `${score} of ${total} correct` : "";
  },
  norm(s) { return String(s).toLowerCase().replace(/[’']/g, "'").replace(/[.,!?;:"“”]/g, "").replace(/\s+/g, " ").trim(); },
  lev(a, b) {
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  },
  replayBtn(item) {
    const r = $("template.replay", item);
    if (!r) return "";
    const [a, b] = r.innerHTML.split(",").map(Number);
    return `<button type="button" class="clip replay-btn" data-start="${a}" data-end="${b}">${ICON.play}<span>Replay this part <span class="clip-t">${mmss(a)}–${mmss(b)}</span></span></button>`;
  },
  feedback(item, ok, extra = "") {
    const fb = $(".feedback", item);
    const why = $("template.why", item)?.innerHTML || "";
    fb.className = "feedback " + (ok === true ? "ok" : ok === "almost" ? "almost" : "no");
    fb.innerHTML = `${ok === true ? ICON.check : ICON.x}<div><p><b class="lbl">${ok === true ? "Correct." : ok === "almost" ? "Almost." : "Not quite."}</b>${extra}${why ? " " + why : ""}</p>${ok === true ? "" : this.replayBtn(item)}</div>`;
    fb.hidden = false;
  },

  // ----- single choice (mc, sort) -----
  choice(ex) {
    const s = this.st(ex); s.a ||= {};
    const items = $$(".item", ex);
    const total = items.length;
    const pick = (item, idx, restoring) => {
      const k = items.indexOf(item), ans = +item.dataset.answer;
      $$(".opt", item).forEach((o) => { o.disabled = true; o.setAttribute("aria-pressed", String(+o.dataset.i === idx)); if (+o.dataset.i === ans) o.classList.add("correct"); else if (+o.dataset.i === idx) o.classList.add("wrong"); });
      const chosen = $(`.opt[data-i="${idx}"] span:last-child`, item)?.textContent || "";
      this.feedback(item, idx === ans, idx === ans ? "" : ` You chose “${escHTML(chosen.length > 70 ? chosen.slice(0, 67) + "…" : chosen)}”.`);
      if (!restoring) { s.a[k] = idx; }
      const answered = Object.keys(s.a).length;
      const score = Object.entries(s.a).filter(([kk, v]) => +items[kk].dataset.answer === v).length;
      if (answered === total) this.setScore(ex, score, total); else Store.save();
    };
    items.forEach((item) => $$(".opt", item).forEach((o) => o.addEventListener("click", () => pick(item, +o.dataset.i))));
    Object.entries(s.a).forEach(([k, v]) => items[k] && pick(items[k], v, true));
    $(".reset", ex)?.addEventListener("click", () => {
      s.a = {}; delete s.score; Store.save();
      items.forEach((item) => { $$(".opt", item).forEach((o) => { o.disabled = false; o.classList.remove("correct", "wrong"); o.setAttribute("aria-pressed", "false"); }); $(".feedback", item).hidden = true; });
      $(".ex-score", ex).textContent = "";
    });
  },

  // ----- pause and predict -----
  predict(ex) {
    const s = this.st(ex); s.a ||= {}; s.shown ||= {};
    const items = $$(".item", ex);
    const reveal = (item) => {
      const k = items.indexOf(item), ans = +item.dataset.answer, idx = s.a[k];
      $$(".opt", item).forEach((o) => { if (+o.dataset.i === ans) o.classList.add("correct"); else if (+o.dataset.i === idx) o.classList.add("wrong"); });
      this.feedback(item, idx === ans, idx === ans ? " Your prediction was right." : " That's fine: a wrong prediction still helps you listen.");
      $(".show-answer", item).hidden = true;
      s.shown[k] = 1;
      const done = Object.keys(s.shown).length;
      if (done === items.length) this.setScore(ex, Object.entries(s.a).filter(([kk, v]) => +items[kk].dataset.answer === v).length, items.length); else Store.save();
    };
    const choose = (item, idx) => {
      const k = items.indexOf(item);
      s.a[k] = idx; Store.save();
      $$(".opt", item).forEach((o) => { o.disabled = true; o.setAttribute("aria-pressed", String(+o.dataset.i === idx)); });
      $(".checkpart", item).hidden = false;
    };
    items.forEach((item, k) => {
      $$(".opt", item).forEach((o) => o.addEventListener("click", () => choose(item, +o.dataset.i)));
      $(".show-answer", item).addEventListener("click", () => reveal(item));
      $(".clip.check", item).addEventListener("click", () => { if (!s.shown[k]) setTimeout(() => $(".show-answer", item).classList.add("btn-primary"), 0); });
      if (s.a[k] != null) { choose(item, s.a[k]); if (s.shown[k]) reveal(item); }
    });
    $(".reset", ex)?.addEventListener("click", () => {
      s.a = {}; s.shown = {}; delete s.score; Store.save();
      items.forEach((item) => { $$(".opt", item).forEach((o) => { o.disabled = false; o.classList.remove("correct", "wrong"); o.setAttribute("aria-pressed", "false"); }); $(".feedback", item).hidden = true; $(".checkpart", item).hidden = true; $(".show-answer", item).hidden = false; });
      $(".ex-score", ex).textContent = "";
    });
  },

  // ----- typed gaps -----
  gap(ex) {
    const s = this.st(ex); s.v ||= {};
    const inputs = $$("input.gap", ex);
    inputs.forEach((inp, i) => { if (s.v[i] != null) inp.value = s.v[i]; inp.addEventListener("input", () => { s.v[i] = inp.value; inp.classList.remove("correct", "wrong", "almost"); Store.save(); }); inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } }); });
    const check = (quiet) => {
      let score = 0;
      $$(".item", ex).forEach((item) => {
        let allOk = true, anyAlmost = false; const fixes = [];
        $$("input.gap", item).forEach((inp) => {
          const v = this.norm(inp.value), ans = inp.dataset.ans.split("|").map((a) => this.norm(a));
          inp.classList.remove("correct", "wrong", "almost");
          if (ans.includes(v)) { inp.classList.add("correct"); score++; }
          else if (v && ans.some((a) => a.length > 3 && this.lev(v, a) === 1)) { inp.classList.add("almost"); allOk = false; anyAlmost = true; fixes.push(`check the spelling of “${escHTML(inp.value)}”`); }
          else { inp.classList.add("wrong"); allOk = false; fixes.push(`the answer is <b>${escHTML(inp.dataset.ans.split("|")[0])}</b>`); }
        });
        this.feedback(item, allOk ? true : anyAlmost && fixes.length === 1 ? "almost" : false, allOk ? "" : " " + fixes.join("; ").replace(/^./, (c) => c.toUpperCase()) + ".");
      });
      s.checked = 1;
      this.setScore(ex, score, inputs.length);
      if (!quiet) { const first = $("input.gap.wrong, input.gap.almost", ex); if (first) first.focus(); }
    };
    $(".check", ex).addEventListener("click", () => check());
    $(".show", ex).addEventListener("click", () => { inputs.forEach((inp, i) => { if (!inp.classList.contains("correct")) { inp.value = inp.dataset.ans.split("|")[0]; s.v[i] = inp.value; } }); check(true); });
    if (s.checked) check(true);
  },

  // ----- match -----
  match(ex) {
    const s = this.st(ex); s.p ||= [];
    let sel = null; let tries = s.tries || 0;
    const btn = (side, i) => $(`.mbtn[data-side="${side}"][data-i="${i}"]`, ex);
    const total = +ex.dataset.total;
    const pair = (i) => { [btn("l", i), btn("r", i)].forEach((b) => { b.classList.add("paired"); b.disabled = true; b.setAttribute("aria-pressed", "false"); }); };
    s.p.forEach(pair);
    const finish = () => {
      if (s.p.length === total) { const fb = $(".feedback", ex); fb.className = "feedback ok"; fb.innerHTML = `${ICON.check}<p><b class="lbl">All matched.</b> ${tries ? `You needed ${tries} extra ${tries === 1 ? "try" : "tries"}.` : "No mistakes!"}</p>`; fb.hidden = false; this.setScore(ex, Math.max(0, total - tries), total); }
    };
    $$(".mbtn", ex).forEach((b) => b.addEventListener("click", () => {
      if (b.disabled) return;
      if (!sel || sel.dataset.side === b.dataset.side) { if (sel) sel.setAttribute("aria-pressed", "false"); sel = b; b.setAttribute("aria-pressed", "true"); return; }
      if (sel.dataset.i === b.dataset.i) { s.p.push(+b.dataset.i); pair(+b.dataset.i); sel = null; Store.save(); finish(); }
      else { tries++; s.tries = tries; const a = sel; [a, b].forEach((x) => x.classList.add("shake")); setTimeout(() => [a, b].forEach((x) => { x.classList.remove("shake"); x.setAttribute("aria-pressed", "false"); }), 600); sel = null; Store.save(); toast("Not a match. Try again."); }
    }));
    finish();
    $(".reset", ex)?.addEventListener("click", () => { s.p = []; s.tries = 0; tries = 0; delete s.score; Store.save(); $$(".mbtn", ex).forEach((b) => { b.disabled = false; b.classList.remove("paired"); b.setAttribute("aria-pressed", "false"); }); $(".feedback", ex).hidden = true; $(".ex-score", ex).textContent = ""; });
  },

  // ----- order -----
  order(ex) {
    const s = this.st(ex);
    const list = $(".order-list", ex);
    if (s.order) s.order.forEach((i) => { const li = $(`li[data-i="${i}"]`, list); if (li) list.appendChild(li); });
    const saveOrder = () => { s.order = $$("li", list).map((li) => +li.dataset.i); Store.save(); $$("li", list).forEach((li) => li.classList.remove("correct", "wrong")); };
    list.addEventListener("click", (e) => {
      const b = e.target.closest(".obtn"); if (!b) return;
      const li = b.closest("li");
      if (b.classList.contains("up") && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
      else if (b.classList.contains("down") && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
      b.focus(); saveOrder();
    });
    $(".check", ex).addEventListener("click", () => {
      const lis = $$("li", list); let score = 0;
      lis.forEach((li, k) => { const ok = +li.dataset.i === k; li.classList.toggle("correct", ok); li.classList.toggle("wrong", !ok); if (ok) score++; });
      const fb = $(".feedback", ex), why = $("template.why", ex)?.innerHTML || "";
      const ok = score === lis.length;
      fb.className = "feedback " + (ok ? "ok" : "no");
      fb.innerHTML = `${ok ? ICON.check : ICON.x}<p><b class="lbl">${ok ? "Correct order." : `${score} of ${lis.length} in the right place.`}</b> ${ok ? why : "Lines in red are in the wrong place. Listen again and move them."}</p>`;
      fb.hidden = false; this.setScore(ex, score, lis.length);
    });
  },

  // ----- notes and writing (saved as you type) -----
  notes(ex) {
    const s = this.st(ex); s.t ||= {};
    $$("textarea.note", ex).forEach((ta) => {
      if (s.t[ta.dataset.key] != null) ta.value = s.t[ta.dataset.key];
      ta.addEventListener("input", () => { s.t[ta.dataset.key] = ta.value; Store.save(); const sv = $(".saved", ex); if (sv) sv.textContent = "Saved"; });
    });
    $$("input[type=checkbox]", ex).forEach((cb) => { cb.checked = !!s.t[cb.dataset.key]; cb.addEventListener("change", () => { s.t[cb.dataset.key] = cb.checked; Store.save(); }); });
    $(".compare", ex)?.addEventListener("click", (e) => {
      const show = $$(".nt-model", ex).some((m) => m.hidden);
      $$(".nt-model", ex).forEach((m) => (m.hidden = !show));
      const nc = $(".notes-check", ex); if (nc) nc.hidden = !show;
      e.currentTarget.lastChild.textContent = show ? "Hide the model" : "Compare with a model";
    });
  },
  write(ex) {
    this.notes(ex);
    const ta = $("textarea", ex), wc = $(".wordcount", ex), min = +ex.dataset.min, max = +ex.dataset.max;
    const upd = () => { const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0; wc.textContent = `${n} words${n && n < min ? ` (aim for at least ${min})` : n > max ? ` (try to keep it under ${max})` : ""}`; };
    ta.addEventListener("input", upd); upd();
  },

  // ----- prediction before listening (not scored) -----
  prediction(ex) {
    const L = Store.lesson(this.lid);
    const opts = $$(".opt", ex);
    const set = (i) => { opts.forEach((o) => o.setAttribute("aria-pressed", String(+o.dataset.i === i))); L.pred = i; Store.save(); Lesson.updatePredCheck(); };
    opts.forEach((o) => o.addEventListener("click", () => set(+o.dataset.i)));
    if (L.pred != null) opts.forEach((o) => o.setAttribute("aria-pressed", String(+o.dataset.i === L.pred)));
  },
  predwords(ex) {
    const L = Store.lesson(this.lid); L.pw ||= [];
    $$(".chip", ex).forEach((c) => {
      const i = +c.dataset.i;
      c.setAttribute("aria-pressed", String(L.pw.includes(i)));
      c.addEventListener("click", () => { const on = !L.pw.includes(i); L.pw = on ? [...L.pw, i] : L.pw.filter((x) => x !== i); c.setAttribute("aria-pressed", String(on)); Store.save(); Lesson.updatePredCheck(); });
    });
  },

  init(root, lid) {
    this.lid = lid;
    $$(".exercise", root).forEach((ex) => {
      const t = ex.dataset.ex;
      if (t === "mc" || t === "sort") this.choice(ex);
      else if (this[t]) this[t](ex);
      const s = Store.lesson(lid).ex[ex.id];
      if (s && s.total && $(".ex-score", ex)) $(".ex-score", ex).textContent = `${s.score} of ${s.total} correct`;
    });
    // free-standing text boxes (warm-up, discussion, reflection)
    const L = Store.lesson(lid);
    $$("textarea[data-store]", root).forEach((ta) => { const k = ta.dataset.store; if (L.notes[k] != null) ta.value = L.notes[k]; ta.addEventListener("input", () => { L.notes[k] = ta.value; Store.save(); }); });
    // self-check
    $$("[data-sc]", root).forEach((li) => {
      const k = li.dataset.sc;
      const set = (v) => { $$(".chip", li).forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.v === v))); };
      if (L.sc[k]) set(L.sc[k]);
      $$(".chip", li).forEach((c) => c.addEventListener("click", () => { L.sc[k] = c.dataset.v; set(c.dataset.v); Store.save(); }));
    });
  },
};

/* Lesson flow: one step at a time, stepper, video panel visibility, resume. */
const Lesson = {
  root: null, id: null, cur: 0, n: 7,
  init() {
    this.root = $(".lesson-layout");
    if (!this.root) return;
    this.id = this.root.dataset.lesson;
    this.n = +this.root.dataset.steps;
    const data = JSON.parse($("#lesson-data").textContent);
    this.data = data;
    // remember this lesson's words for the word bank
    data.words.forEach(([w, d]) => { Store.data.words[w] = { d, l: this.id }; });
    Store.save();
    Ex.init(this.root, this.id);
    Player.init();
    $(".steps-toggle")?.addEventListener("click", (e) => { const p = $("#steps-panel"); const open = !p.classList.contains("open"); p.classList.toggle("open", open); e.currentTarget.setAttribute("aria-expanded", String(open)); });
    $(".vp-toggle")?.addEventListener("click", () => this.toggleVideo());
    $(".finish")?.addEventListener("click", (e) => { const next = e.currentTarget.dataset.next; const L = Store.lesson(this.id); L.done = true; L.visited = [...new Set([...(L.visited || []), this.n - 1])]; Store.save(); toast("Lesson finished. Well done!"); setTimeout(() => (location.href = next), 700); });
    window.addEventListener("hashchange", () => this.fromHash(true));
    const L = Store.lesson(this.id);
    if (!/^#step-\d+$/.test(location.hash) && L.step != null && L.step > 0) { history.replaceState(null, "", `#step-${L.step + 1}`); }
    this.fromHash(false);
    this.updatePredCheck();
  },
  fromHash(focus) {
    const m = location.hash.match(/^#step-(\d+)$/);
    this.show(m ? Math.min(this.n - 1, Math.max(0, +m[1] - 1)) : 0, focus);
  },
  show(i, focus) {
    const prev = this.cur;
    this.cur = i;
    $$(".step", this.root).forEach((s) => s.classList.toggle("active", +s.dataset.step === i));
    const step = $(`.step[data-step="${i}"]`, this.root);
    const vid = step.dataset.video === "1";
    const vp = $("[data-video-panel]");
    if (vp) { vp.hidden = !vid; $(".lesson-main").classList.toggle("has-video", vid); }
    if (prev !== i) Player.pause();
    const L = Store.lesson(this.id);
    L.visited = [...new Set([...(L.visited || []), i])];
    L.step = i; Store.data.last = { id: this.id, step: i, at: Date.now() }; Store.save();
    $$(".steps-list a").forEach((a) => {
      const k = +a.dataset.step;
      if (k === i) a.setAttribute("aria-current", "step"); else a.removeAttribute("aria-current");
      a.parentElement.classList.toggle("done", L.visited.includes(k) && k !== i);
    });
    $$(".segbar i").forEach((b, k) => { b.className = k === i ? "cur" : L.visited.includes(k) ? "done" : ""; });
    const sn = $("[data-stepnum]"); if (sn) sn.textContent = i + 1;
    const nm = $("[data-stepname]"); if (nm) nm.textContent = this.data.steps[i];
    $("#steps-panel")?.classList.remove("open");
    $(".steps-toggle")?.setAttribute("aria-expanded", "false");
    if (focus) {
      const h = $("h2", step);
      window.scrollTo({ top: this.root.getBoundingClientRect().top + window.scrollY - 70, behavior: "auto" });
      h.focus({ preventScroll: true });
    }
  },
  toggleVideo(force) {
    const vp = $("[data-video-panel]"); if (!vp) return;
    const collapse = force != null ? force : !vp.classList.contains("collapsed");
    vp.classList.toggle("collapsed", collapse);
    const b = $(".vp-toggle"); b.setAttribute("aria-expanded", String(!collapse)); b.textContent = collapse ? "Show video" : "Hide"; b.setAttribute("aria-label", collapse ? "Show video" : "Hide video");
    if (collapse) Player.pause();
  },
  updatePredCheck() {
    const box = $("[data-predcheck]"); if (!box) return;
    const L = Store.lesson(this.id);
    const opts = $$("[data-ex=prediction] .opt span:last-child").map((s) => s.textContent);
    $(".pc-yours", box).textContent = L.pred != null ? `“${opts[L.pred]}”` : "(you didn't make a prediction)";
    $$(".pc-list li", box).forEach((li) => li.classList.toggle("chosen", (L.pw || []).includes(+li.dataset.i)));
  },
};

/* Home/unit status, continue card, progress page, notes page, backup. */
const Pages = {
  statuses() {
    const label = { done: "Done", doing: "In progress", new: "New" };
    $$("[data-status]").forEach((el) => {
      const id = el.dataset.status, info = COURSE.lessons.find((l) => l.id === id);
      if (!info || !info.built) return;
      const st = lessonStatus(id);
      el.className = `st st-${st}`;
      el.innerHTML = `${st === "done" ? ICON.done : st === "doing" ? ICON.half : ICON.circle}<span class="st-text">${label[st]}</span>`;
    });
    $$("[data-unitbar]").forEach((bar) => {
      const u = +bar.dataset.unitbar, ls = COURSE.lessons.filter((l) => l.unit === u), done = ls.filter((l) => lessonStatus(l.id) === "done").length;
      bar.style.width = `${(done / ls.length) * 100}%`;
      const c = $(`[data-unitcount="${u}"]`); if (c) c.textContent = `${done} of ${ls.length} lessons`;
    });
    const last = Store.data.last, card = $("[data-continue]");
    if (card && last) {
      const info = COURSE.lessons.find((l) => l.id === last.id);
      if (info) {
        card.hidden = false; $("[data-start]").hidden = true;
        $("[data-continue-title]").textContent = `${info.unit}.${info.n} ${info.title} · Step ${last.step + 1}: ${COURSE.steps[last.step]}`;
        $("[data-continue-link]").href = `lessons/${info.id}.html#step-${last.step + 1}`;
      }
    }
  },
  scores(id) {
    const ex = (Store.data.lessons[id] || {}).ex || {};
    let s = 0, t = 0; Object.values(ex).forEach((e) => { if (e.total) { s += e.score; t += e.total; } });
    return [s, t];
  },
  progress() {
    const box = $("[data-progress-table]"); if (!box) return;
    const built = COURSE.lessons.filter((l) => l.built);
    const done = built.filter((l) => lessonStatus(l.id) === "done").length;
    let S = 0, T = 0; built.forEach((l) => { const [s, t] = this.scores(l.id); S += s; T += t; });
    const sc = Object.values(Store.data.lessons).flatMap((L) => Object.values(L.sc || {}));
    $("[data-stats]").innerHTML = `<div class="stat"><b>${done} / ${COURSE.lessons.length}</b><span>lessons finished</span></div><div class="stat"><b>${T ? Math.round((S / T) * 100) + "%" : "–"}</b><span>auto-checked answers correct</span></div><div class="stat"><b>${sc.filter((v) => v === "yes").length}</b><span>can-do statements: “Yes”</span></div><div class="stat"><b>${Object.keys(Store.data.words).length}</b><span>words in your word bank</span></div>`;
    box.innerHTML = `<div class="gtable-wrap on-paper" tabindex="0" role="region" aria-label="Progress table"><table class="prog-table"><thead><tr><th>Lesson</th><th>Status</th><th>Score</th><th>Self-check</th></tr></thead><tbody>${COURSE.lessons.map((l) => {
      const st = l.built ? lessonStatus(l.id) : "soon", [s, t] = this.scores(l.id), L = Store.data.lessons[l.id] || {};
      const v = Object.values(L.sc || {}), self = v.length ? `${v.filter((x) => x === "yes").length} yes · ${v.filter((x) => x === "almost").length} almost · ${v.filter((x) => x === "no").length} not yet` : "–";
      return `<tr><td>${l.built ? `<a href="lessons/${l.id}.html">${l.unit}.${l.n} ${escHTML(l.title)}</a>` : `${l.unit}.${l.n} ${escHTML(l.title)}`}</td><td>${{ done: "Done", doing: "In progress", new: "Not started", soon: "Coming soon" }[st]}</td><td>${t ? `${s} / ${t}` : "–"}</td><td>${self}</td></tr>`;
    }).join("")}</tbody></table></div>`;
  },
  noteText() {
    // collect all saved text per lesson, labelled
    const out = [];
    COURSE.lessons.forEach((l) => {
      const L = Store.data.lessons[l.id]; if (!L) return;
      const parts = [];
      Object.entries(L.notes || {}).forEach(([k, v]) => { if (v && v.trim()) parts.push([k.split(":")[1].replace(/^discuss(\d)/, (_, n) => `Discussion question ${+n + 1}`).replace("warmup", "Warm-up ideas").replace("reflect", "Reflection"), v]); });
      Object.entries(L.ex || {}).forEach(([exId, e]) => {
        if (!e.t) return;
        const isSum = /-sum$/.test(exId);
        const texts = Object.entries(e.t).filter(([k, v]) => typeof v === "string" && v.trim());
        if (texts.length) parts.push([isSum ? "Summary" : "Notes", texts.map(([, v]) => v).join(isSum ? "\n" : "\n• ")]);
      });
      if (parts.length) out.push({ l, parts: parts.sort((a, b) => (a[0] === "Notes" ? -1 : a[0] === "Summary" ? 0 : 1) - (b[0] === "Notes" ? -1 : b[0] === "Summary" ? 0 : 1)) });
    });
    return out;
  },
  notes() {
    const box = $("[data-allnotes]"); if (!box) return;
    const wb = $("[data-wordbank]");
    const words = Object.entries(Store.data.words).sort((a, b) => a[1].l.localeCompare(b[1].l) || a[0].localeCompare(b[0]));
    if (words.length) wb.innerHTML = `<ul class="wb-list">${words.map(([w, x]) => `<li><b>${escHTML(w)}</b> <span class="muted small">(${x.l.replace("-", ".")})</span><br>${escHTML(x.d)}</li>`).join("")}</ul>`;
    const all = this.noteText();
    if (all.length) box.innerHTML = all.map(({ l, parts }) => `<article class="nb-lesson"><h3>${l.unit}.${l.n} ${escHTML(l.title)} <span class="muted small">${escHTML(l.speaker)}</span></h3><dl>${parts.map(([k, v]) => `<dt>${escHTML(k)}</dt><dd>${escHTML(k === "Notes" ? "• " + v : v)}</dd>`).join("")}</dl></article>`).join("");
    $("[data-print]")?.addEventListener("click", () => window.print());
    $("[data-download-notes]")?.addEventListener("click", () => {
      const txt = ["EIL313 Listening Lab: my notes", new Date().toLocaleDateString(), ""].concat(all.flatMap(({ l, parts }) => [`=== ${l.unit}.${l.n} ${l.title} (${l.speaker}) ===`, ...parts.flatMap(([k, v]) => [`-- ${k} --`, k === "Notes" ? "• " + v : v, ""])])).join("\n");
      this.download(txt, "eil313-notes.txt", "text/plain");
    });
  },
  download(content, name, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  },
  backup() {
    $("[data-export]")?.addEventListener("click", () => this.download(JSON.stringify(Store.data, null, 1), `eil313-progress-${new Date().toISOString().slice(0, 10)}.json`, "application/json"));
    $("[data-import]")?.addEventListener("change", async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { const d = JSON.parse(await f.text()); if (!d || typeof d.lessons !== "object") throw 0; Store.data = d; Store.save(); toast("Backup loaded."); setTimeout(() => location.reload(), 600); }
      catch { toast("That file is not a Listening Lab backup."); }
    });
    $("[data-reset]")?.addEventListener("click", () => {
      const b = $("[data-reset]");
      if (b.dataset.confirm) { localStorage.removeItem(KEY); toast("All progress deleted."); setTimeout(() => location.reload(), 600); }
      else { b.dataset.confirm = "1"; b.textContent = "Click again to delete everything"; b.classList.add("btn-secondary"); setTimeout(() => { delete b.dataset.confirm; b.textContent = "Delete all my progress"; }, 5000); }
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  Lesson.init();
  Pages.statuses();
  Pages.progress();
  Pages.notes();
  Pages.backup();
});
