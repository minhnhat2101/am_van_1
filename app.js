(function () {
  "use strict";
  var POINTS = 100;
  var app = document.getElementById("app");
  var S = null; // trạng thái lượt chơi

  /* ---------- tiện ích ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  // Số sao cao nhất mỗi bài: học sinh đăng nhập lấy từ Supabase (theo từng em); khách lưu trên máy.
  var serverBest = {};
  function best(id) {
    if (student()) return serverBest[id] || -1;
    var v = parseInt(store("tv_guest_best_" + id), 10); return isNaN(v) ? -1 : v;
  }
  function setBest(id, stars) {
    if (stars <= best(id)) return;
    if (student()) serverBest[id] = stars; else store("tv_guest_best_" + id, String(stars));
  }
  /* ---------- tài khoản học sinh (Supabase) ---------- */
  var SESSION_KEY = "tv_student";
  function student() { try { return JSON.parse(store(SESSION_KEY)) || null; } catch (e) { return null; } }
  function setStudent(v) { try { if (v) localStorage.setItem(SESSION_KEY, JSON.stringify(v)); else localStorage.removeItem(SESSION_KEY); } catch (e) { /* bỏ qua */ } }
  function rpc(fn, body) {
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return Promise.reject(new Error("no-config"));
    return fetch(window.SUPABASE_URL + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: window.SUPABASE_ANON_KEY, Authorization: "Bearer " + window.SUPABASE_ANON_KEY },
      body: JSON.stringify(body)
    }).then(function (r) { if (!r.ok) throw new Error("http-" + r.status); return r.json(); });
  }
  function fullWord(t, a) { var w = t; a.forEach(function (x) { w = w.replace("_", x); }); return w; }
  function gapWord(t) { return t.replace(/_/g, "…"); }

  var SNOWMAN = '<svg class="snowman" viewBox="0 0 80 96" aria-hidden="true">' +
    '<circle cx="40" cy="66" r="26" fill="#fff" stroke="#9fc4e3" stroke-width="3"/>' +
    '<circle cx="40" cy="32" r="18" fill="#fff" stroke="#9fc4e3" stroke-width="3"/>' +
    '<rect x="26" y="8" width="28" height="12" rx="3" fill="#17335a"/><rect x="21" y="18" width="38" height="5" rx="2.5" fill="#17335a"/>' +
    '<rect x="26" y="15" width="28" height="3" fill="#e5484d"/>' +
    '<circle cx="34" cy="29" r="2.4" fill="#17335a"/><circle cx="46" cy="29" r="2.4" fill="#17335a"/>' +
    '<path d="M40 34 L54 38 L40 40 Z" fill="#f29a2e"/>' +
    '<circle cx="40" cy="58" r="2.6" fill="#17335a"/><circle cx="40" cy="68" r="2.6" fill="#17335a"/><circle cx="40" cy="78" r="2.6" fill="#17335a"/>' +
    '<path d="M16 58 L2 48 M64 58 L78 48" stroke="#7a4b24" stroke-width="3" stroke-linecap="round"/></svg>';

  /* ---------- âm thanh & giọng đọc ---------- */
  var audio = { ctx: null, on: store("tv_sound") !== "off" };
  function tone(freqs, dur, type) {
    if (!audio.on) return;
    try {
      if (!audio.ctx) audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
      var ctx = audio.ctx, t = ctx.currentTime;
      freqs.forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type || "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * dur);
        g.gain.exponentialRampToValueAtTime(0.18, t + i * dur + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (i + 1) * dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(t + i * dur); o.stop(t + (i + 1) * dur + 0.02);
      });
    } catch (e) { /* trình duyệt không hỗ trợ */ }
  }
  var sfx = {
    ok: function () { tone([660, 880], 0.12); },
    pop: function () { tone([740], 0.08); },
    no: function () { tone([220, 180], 0.16, "triangle"); },
    win: function () { tone([523, 659, 784, 1047], 0.14); }
  };
  function speak(text) {
    if (!audio.on || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "vi-VN"; u.rate = 0.8;
      window.speechSynthesis.speak(u);
    } catch (e) { /* bỏ qua */ }
  }

  /* ---------- tuyết rơi ---------- */
  (function snow() {
    var c = document.getElementById("snow");
    if (!c || !c.getContext || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var x = c.getContext("2d"), W = 0, H = 0, flakes = [];
    function size() { W = c.width = innerWidth; H = c.height = innerHeight; }
    size(); addEventListener("resize", size);
    for (var i = 0; i < 40; i++) flakes.push({ x: Math.random() * 2000, y: Math.random() * 1200, r: 1.5 + Math.random() * 2.5, v: 0.3 + Math.random() * 0.6 });
    (function tick() {
      x.clearRect(0, 0, W, H); x.fillStyle = "rgba(255,255,255,.85)";
      flakes.forEach(function (f) {
        f.y += f.v; f.x += Math.sin(f.y / 40) * 0.3;
        if (f.y > H) { f.y = -5; f.x = Math.random() * W; }
        x.beginPath(); x.arc(f.x % W, f.y, f.r, 0, 6.3); x.fill();
      });
      requestAnimationFrame(tick);
    })();
  })();

  /* ---------- kéo thả (chuột và cảm ứng) ---------- */
  function targetAt(x, y) {
    var n = document.elementFromPoint(x, y);
    return n && n.closest ? n.closest("[data-drop]") : null;
  }
  // Gắn khả năng kéo cho một nút; chạm nhẹ (hoặc phím Enter) gọi onTap.
  function clearGhosts() {
    Array.prototype.forEach.call(document.querySelectorAll("body > .dragghost"), function (g) { g.remove(); });
    Array.prototype.forEach.call(document.querySelectorAll(".dragging"), function (n) { n.classList.remove("dragging"); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-drop].over"), function (n) { n.classList.remove("over"); });
  }
  function makeDrag(node, o) {
    node.classList.add("drag");
    node.addEventListener("dragstart", function (e) { e.preventDefault(); });
    var sx = 0, sy = 0, ghost = null, moved = false, pid = null, over = null;
    function off() { return o.disabled && o.disabled(); }
    node.addEventListener("pointerdown", function (e) {
      if (off() || e.button > 0) return;
      clearGhosts(); over = null; ghost = null;
      pid = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
      try { node.setPointerCapture(pid); } catch (_) { /* bỏ qua */ }
    });
    node.addEventListener("pointermove", function (e) {
      if (pid !== e.pointerId) return;
      if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
        moved = true;
        ghost = node.cloneNode(true); ghost.classList.add("dragghost"); ghost.classList.remove("drag", "dragging", "sel");
        ghost.style.width = node.offsetWidth + "px";
        document.body.appendChild(ghost);
        node.classList.add("dragging");
      }
      if (moved) {
        ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px";
        var t = targetAt(e.clientX, e.clientY);
        if (t !== over) { if (over) over.classList.remove("over"); over = t; if (over) over.classList.add("over"); }
      }
    });
    function end(e, cancel) {
      if (pid !== e.pointerId) return;
      pid = null;
      try { node.releasePointerCapture(e.pointerId); } catch (_) { /* bỏ qua */ }
      if (!moved) return;
      var t = cancel ? null : over;
      if (over) over.classList.remove("over");
      over = null; if (ghost) ghost.remove(); ghost = null; node.classList.remove("dragging");
      clearGhosts();
      node._dragged = true; setTimeout(function () { node._dragged = false; }, 0);
      if (t) o.onDrop(t);
    }
    node.addEventListener("pointerup", function (e) { end(e, false); });
    node.addEventListener("pointercancel", function (e) { end(e, true); });
    node.addEventListener("lostpointercapture", function (e) { end(e, false); });
    node.addEventListener("click", function () {
      if (node._dragged || off()) return;
      if (o.onTap) o.onTap();
    });
  }
  function flash(node, cls, ms) { node.classList.add(cls); setTimeout(function () { node.classList.remove(cls); }, ms || 400); }

  /* ---------- màn giới thiệu ---------- */
  function intro() {
    S = null;
    app.innerHTML = ""; clearGhosts();
    var c = el("section", "intro-layer");
    c.appendChild(el("h1", null, "Góc âm vần lớp 1<br>Cô Ngọc Ánh"));
    var mine = el("button", "action start", "Học sinh lớp 1/4");
    mine.addEventListener("click", function () { sfx.ok(); loginForm(); });
    var other = el("button", "action start alt", "Học sinh khác");
    other.addEventListener("click", function () { sfx.ok(); setStudent(null); home(); });
    c.appendChild(mine); c.appendChild(other);
    app.appendChild(c);
  }

  /* ---------- đăng nhập học sinh lớp 1/4 ---------- */
  function loginForm() {
    app.innerHTML = ""; clearGhosts();
    var c = el("section", "intro-layer");
    c.appendChild(el("h1", null, "Học sinh lớp 1/4"));
    var form = el("form", "login");
    var lab = el("label", null, "Em hãy viết họ và tên đầy đủ (không dấu):");
    var inp = el("input"); inp.type = "text"; inp.autocomplete = "off"; inp.autocapitalize = "words"; inp.spellcheck = false;
    inp.placeholder = "Ví dụ: Nguyen Van An"; inp.maxLength = 60;
    lab.appendChild(inp);
    var msg = el("div", "login-msg"); msg.setAttribute("role", "alert");
    var go = el("button", "action start", "Vào học"); go.type = "submit";
    var back = el("button", "action ghost", "Quay lại"); back.type = "button";
    back.addEventListener("click", intro);
    form.appendChild(lab); form.appendChild(msg); form.appendChild(go); form.appendChild(back);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = inp.value.replace(/\s+/g, " ").trim();
      if (!name) { msg.textContent = "Em hãy viết tên của mình nhé."; inp.focus(); return; }
      go.disabled = true; msg.textContent = "Đang kiểm tra…";
      rpc("login", { p_name: name }).then(function (rows) {
        if (rows && rows.length) { setStudent({ token: rows[0].token, name: rows[0].full_name }); sfx.ok(); home(); }
        else { msg.textContent = "Chưa thấy tên em trong danh sách. Em viết lại nhé!"; go.disabled = false; inp.focus(); }
      }).catch(function (err) {
        msg.textContent = err.message === "no-config" ? "Chưa kết nối được với hệ thống." : "Không kết nối được mạng. Em thử lại nhé!";
        go.disabled = false;
      });
    });
    c.appendChild(form);
    app.appendChild(c);
    inp.focus();
  }

  /* ---------- màn chọn bài ---------- */
  function home() {
    S = null;
    app.innerHTML = ""; clearGhosts();
    var bar = el("div", "topbar");
    var back = el("button", "back", "← Trang đầu");
    back.addEventListener("click", intro);
    bar.appendChild(back);
    if (student()) {
      var out = el("button", "back", "Đăng xuất");
      out.addEventListener("click", function () { setStudent(null); intro(); });
      bar.appendChild(out);
    }
    app.appendChild(bar);
    var head = el("div", "home-head", SNOWMAN);
    var t = el("div");
    t.appendChild(el("h1", null, "Chọn bài"));
    var me = student();
    t.appendChild(el("p", null, me ? "Chào " + esc(me.name) + "!" : "Mỗi bài có nhiều trò chơi khác nhau"));
    head.appendChild(t);
    app.appendChild(head);

    var grid = el("div", "lessons"), starEls = {};
    function paint() {
      LESSONS.forEach(function (L) {
        var st = best(L.id), stars = "";
        for (var i = 1; i <= 3; i++) stars += '<span class="' + (st >= i ? "" : "off") + '">★</span>';
        starEls[L.id].innerHTML = stars;
      });
    }
    LESSONS.forEach(function (L) {
      var b = el("button", "lesson");
      b.innerHTML = '<span class="n">Bài số ' + L.id + '</span><span class="pair">' + esc(L.pair[0]) + " / " + esc(L.pair[1]) +
        '</span><span class="meta">' + plan(L).length + ' trò chơi</span><span class="stars"></span>';
      starEls[L.id] = b.querySelector(".stars");
      b.addEventListener("click", function () { start(L); });
      grid.appendChild(b);
    });
    serverBest = {};
    paint();
    if (me) {
      rpc("my_best", { p_token: me.token }).then(function (rows) {
        var m = {};
        (rows || []).forEach(function (r) { m[r.lesson_id] = r.stars; });
        serverBest = m; paint();
      }).catch(function () { /* không tải được thì để trống */ });
    }
    app.appendChild(grid);
    app.appendChild(el("p", "note", "Nội dung biến tấu từ tài liệu “Bài tập chính tả (phân biệt âm – vần)” của cô Ngọc Ánh."));
  }

  /* ---------- tạo danh sách trò chơi từ dữ liệu bài ---------- */
  function plan(L) {
    var fills = L.q.filter(function (q) { return q.kind === "fill" && !q.big; });
    var picks = L.q.filter(function (q) { return q.kind === "pick"; });
    var sentences = L.q.filter(function (q) { return q.kind === "fill" && q.big; });
    var orders = L.q.filter(function (q) { return q.kind === "order"; });
    var out = [];
    out.push(fills[0], fills[1]);
    out.push({ kind: "match", items: fills.slice(4, 8) });
    out.push(fills[2], fills[3]);
    out.push(picks[0]);
    out.push({ kind: "sort", items: fills });
    out.push(picks[1]);
    out.push({ kind: "memory", items: fills.slice(0, 6) });
    out.push({ kind: "find", picks: picks });
    sentences.forEach(function (q) { out.push(q); });
    orders.forEach(function (q) { out.push(q); });
    return out;
  }

  /* ---------- lượt chơi ---------- */
  function start(L) {
    S = { L: L, qs: plan(L), i: 0, score: 0, firstTry: 0 };
    question();
  }

  function topBar() {
    var bar = el("div", "bar");
    var back = el("button", "back", "← Bài khác");
    back.addEventListener("click", home);
    bar.appendChild(back);
    bar.appendChild(el("div", "spacer"));
    bar.appendChild(el("div", "chip", (S.i + 1) + "/" + S.qs.length));
    bar.appendChild(el("div", "chip gold", S.score + " ★"));
    var snd = el("button", "round-btn", audio.on ? "♪" : "×");
    snd.setAttribute("aria-label", "Bật hoặc tắt âm thanh");
    snd.setAttribute("aria-pressed", audio.on ? "true" : "false");
    snd.addEventListener("click", function () {
      audio.on = !audio.on; store("tv_sound", audio.on ? "on" : "off");
      snd.textContent = audio.on ? "♪" : "×"; snd.setAttribute("aria-pressed", audio.on ? "true" : "false");
      if (!audio.on && window.speechSynthesis) window.speechSynthesis.cancel();
    });
    bar.appendChild(snd);
    var wrap = el("div");
    wrap.appendChild(bar);
    var pr = el("div", "progress", "<i style='width:" + (S.i / S.qs.length * 100) + "%'></i>");
    pr.style.marginTop = "8px";
    wrap.appendChild(pr);
    return wrap;
  }

  function question() {
    var q = S.qs[S.i];
    app.innerHTML = ""; clearGhosts();
    app.appendChild(topBar());
    var card = el("section", "qcard");
    var fb = el("div", "feedback"); fb.setAttribute("aria-live", "polite");
    var foot = el("div", "foot");
    var st = { mistakes: 0, done: false };

    // o.partial: trò nhiều bước, sai tối đa 2 lần vẫn được nửa điểm
    // o.silent: không đọc to
    function finish(spoken, o) {
      o = o || {};
      st.done = true;
      var gain = st.mistakes === 0 ? POINTS : (o.partial && st.mistakes <= 2 ? POINTS / 2 : 0);
      S.score += gain;
      if (st.mistakes === 0) S.firstTry++;
      fb.className = "feedback ok";
      fb.textContent = gain === POINTS ? "Đúng rồi! +" + POINTS : gain ? "Giỏi lắm! +" + gain : "Hoàn thành rồi!";
      sfx.ok();
      if (!o.silent) {
        speak(spoken);
        var say = el("div", "says");
        say.innerHTML = esc(spoken) + ' <button aria-label="Nghe đọc">🔊</button>';
        say.querySelector("button").addEventListener("click", function () { speak(spoken); });
        card.appendChild(say);
      }
      var last = S.i === S.qs.length - 1;
      var next = el("button", "action next pop", last ? "Xem kết quả" : "Câu tiếp theo");
      next.addEventListener("click", function () { S.i++; last ? result() : question(); });
      foot.innerHTML = ""; foot.appendChild(next);
      next.focus();
    }
    function wrong(msg) {
      st.mistakes++; sfx.no();
      fb.className = "feedback no"; fb.textContent = msg || "Chưa đúng, thử lại nhé!";
    }
    var ctx = { card: card, fb: fb, foot: foot, finish: finish, wrong: wrong, st: st };
    var builders = { fill: buildFill, pick: buildPick, order: buildOrder, match: buildMatch, sort: buildSort, memory: buildMemory, find: buildFind };
    builders[q.kind](q, ctx);

    app.appendChild(card);
    app.appendChild(fb);
    app.appendChild(foot);
  }

  function picture(name, small) {
    var p = el("div", "pic" + (small ? " small" : ""));
    var im = new Image(); im.alt = ""; im.src = "img/" + name + ".jpg";
    p.appendChild(im); return p;
  }

  /* ---------- 1. Điền chữ: kéo thả hoặc chạm ---------- */
  function buildFill(q, c) {
    var card = c.card;
    var prompt = q.big ? "Chọn từ đúng, kéo vào chỗ trống:" : "Kéo chữ đúng vào chỗ trống (" + S.L.pair[0] + " hay " + S.L.pair[1] + "?)";
    card.appendChild(el("div", "prompt", prompt));
    if (q.img) card.appendChild(picture(q.img));
    var parts = q.t.split("_"), blanks = parts.length - 1;
    var word = el("div", "word" + (q.big ? " long" : ""));
    var slots = [], filled = [], count = 0;
    parts.forEach(function (p, i) {
      word.appendChild(document.createTextNode(p));
      if (i < blanks) {
        var s = el("span", "slot", "&nbsp;"); s.setAttribute("data-drop", "1");
        slots.push(s); filled.push(false); word.appendChild(s);
      }
    });
    card.appendChild(word);
    function firstEmpty() { return filled.indexOf(false); }
    function mark() { var f = firstEmpty(); slots.forEach(function (s, i) { s.classList.toggle("active", i === f); }); }
    mark();
    var full = fullWord(q.t, q.a);
    var box = el("div", "opts" + (q.big ? " single" : ""));
    shuffle(q.o || S.L.pair).forEach(function (o, i) {
      var b = el("button", "opt c" + (i % 4) + (q.big ? " words" : ""), esc(o));
      function attempt(idx) {
        if (idx < 0 || filled[idx]) return;
        if (o === q.a[idx]) {
          slots[idx].textContent = o; slots[idx].classList.add("filled"); slots[idx].removeAttribute("data-drop");
          filled[idx] = true; count++; mark();
          if (count === blanks) {
            slots.forEach(function (s) { s.classList.remove("active"); });
            c.finish(full);
          } else { c.fb.textContent = ""; sfx.pop(); }
        } else { flash(b, "bad"); c.wrong(); }
      }
      makeDrag(b, {
        disabled: function () { return c.st.done; },
        onTap: function () { attempt(firstEmpty()); },
        onDrop: function (t) { attempt(slots.indexOf(t)); }
      });
      box.appendChild(b);
    });
    card.appendChild(box);
  }

  /* ---------- 2. Chọn từ viết đúng ---------- */
  function buildPick(q, c) {
    c.card.appendChild(el("div", "prompt", "Chạm vào từ viết đúng:"));
    if (q.img) c.card.appendChild(picture(q.img, true));
    var box = el("div", "opts single");
    shuffle(q.o).forEach(function (o, i) {
      var b = el("button", "opt words c" + (i % 4), esc(o));
      b.addEventListener("click", function () {
        if (c.st.done) return;
        if (o === q.o[0]) {
          b.classList.add("good");
          box.querySelectorAll("button").forEach(function (x) { x.disabled = true; if (x !== b) x.classList.add("gone"); });
          c.finish(o);
        } else { b.classList.add("bad"); b.disabled = true; c.wrong(); }
      });
      box.appendChild(b);
    });
    c.card.appendChild(box);
  }

  /* ---------- 3. Sắp xếp câu: kéo thả hoặc chạm ---------- */
  function buildOrder(q, c) {
    c.card.appendChild(el("div", "prompt", "Kéo các từ vào ô để xếp thành câu:"));
    var line = el("div", "line"); line.setAttribute("aria-label", "Câu của em");
    var bank = el("div", "bank");
    var n = q.tokens.length, btnOf = {};
    var check = el("button", "action", "Kiểm tra"); check.disabled = true;
    var toks = q.tokens.map(function (t, i) { return { t: t, i: i }; });
    // thứ tự đúng của từng từ trong câu đáp án
    var right = toks.slice().sort(function (x, y) { return q.a.indexOf(x.t) - q.a.indexOf(y.t); });
    var slots = [], cells = [], locked = [];
    for (var k = 0; k < n; k++) { slots.push(null); locked.push(false); }
    function draw() {
      cells.forEach(function (cell, k) {
        var p = slots[k];
        cell.innerHTML = "";
        cell.classList.toggle("filled", !!p);
        cell.classList.toggle("locked", locked[k]);
        if (p) cell.appendChild(el("span", "w", esc(p.t)));
        if (locked[k]) cell.removeAttribute("data-drop"); else cell.setAttribute("data-drop", "1");
      });
      toks.forEach(function (p) { btnOf[p.i].classList.toggle("used", slots.indexOf(p) >= 0); });
      check.disabled = slots.indexOf(null) >= 0 || locked.every(Boolean);
    }
    function put(p, k) {
      if (c.st.done || k < 0 || locked[k] || slots.indexOf(p) >= 0) return;
      slots[k] = p; c.fb.textContent = ""; sfx.pop(); draw();
    }
    function firstEmpty() { for (var k = 0; k < n; k++) if (!slots[k]) return k; return -1; }
    for (var j = 0; j < n; j++) (function (k) {
      var cell = el("div", "cell"); cell.setAttribute("data-idx", k);
      cell.addEventListener("click", function () {
        if (c.st.done || locked[k] || !slots[k]) return;
        slots[k] = null; draw();
      });
      cells.push(cell); line.appendChild(cell);
    })(j);
    shuffle(toks.slice()).forEach(function (p) {
      var b = el("button", "tok", esc(p.t)); btnOf[p.i] = b;
      makeDrag(b, {
        disabled: function () { return c.st.done || slots.indexOf(p) >= 0; },
        onTap: function () { put(p, firstEmpty()); },
        onDrop: function (t) { put(p, parseInt(t.getAttribute("data-idx"), 10)); }
      });
      bank.appendChild(b);
    });
    c.card.appendChild(line); c.card.appendChild(bank);
    check.addEventListener("click", function () {
      var bad = 0;
      slots.forEach(function (p, k) {
        if (locked[k]) return;
        if (p === right[k]) { locked[k] = true; }
        else { slots[k] = null; bad++; flash(cells[k], "bad", 350); }
      });
      if (!bad) { draw(); check.disabled = true; c.finish(q.a); }
      else { draw(); c.wrong(); }
    });
    c.foot.appendChild(check);
    draw();
  }

  /* ---------- trò chơi gán thẻ vào đích (dùng cho Nối hình và Phân loại) ---------- */
  function assign(c, cfg) {
    var sel = null, left = cfg.items.length;
    var tbox = el("div", cfg.tcls), ibox = el("div", "bank");
    var tEls = {}, zones = {};
    cfg.targets.forEach(function (t) {
      var d = el("div", "target " + (t.cls || ""));
      d.setAttribute("data-drop", "1"); d.setAttribute("data-id", t.id);
      d.innerHTML = t.html + '<div class="zone"></div>';
      zones[t.id] = d.querySelector(".zone"); tEls[t.id] = d;
      d.addEventListener("click", function () { if (sel) attempt(sel.item, sel.node, t.id); });
      tbox.appendChild(d);
    });
    function attempt(item, node, tid) {
      if (c.st.done || node.classList.contains("placed")) return;
      if (cfg.check(item, tid)) {
        node.classList.add("placed"); node.classList.remove("sel", "dragging");
        if (cfg.placedHtml) node.innerHTML = cfg.placedHtml(item);
        zones[tid].appendChild(node);
        if (sel && sel.node === node) sel = null;
        left--; c.fb.textContent = ""; sfx.pop();
        if (!left) c.finish(cfg.spoken, { partial: true, silent: true, label: cfg.label });
      } else {
        flash(node, "bad"); flash(tEls[tid], "bad", 350); c.wrong();
      }
    }
    shuffle(cfg.items).forEach(function (item) {
      var b = el("button", "tok " + (cfg.icls || ""), cfg.chip(item));
      makeDrag(b, {
        disabled: function () { return c.st.done || b.classList.contains("placed"); },
        onTap: function () {
          if (sel && sel.node === b) { b.classList.remove("sel"); sel = null; return; }
          if (sel) sel.node.classList.remove("sel");
          sel = { item: item, node: b }; b.classList.add("sel");
        },
        onDrop: function (t) { attempt(item, b, t.getAttribute("data-id")); }
      });
      ibox.appendChild(b);
    });
    c.card.appendChild(tbox); c.card.appendChild(ibox);
  }

  /* ---------- 4. Nối từ với hình ---------- */
  function buildMatch(q, c) {
    c.card.appendChild(el("div", "prompt", "Kéo mỗi từ vào đúng hình:"));
    var items = q.items.map(function (f, i) { return { id: "m" + i, word: fullWord(f.t, f.a), img: f.img }; });
    assign(c, {
      tcls: "match-grid", icls: "words-chip", label: "Nối từ với hình",
      spoken: "Nối từ với hình",
      items: items,
      targets: items.map(function (it) { return { id: it.id, cls: "mt", html: '<div class="pic small"><img alt="" src="img/' + it.img + '.jpg"></div>' }; }),
      chip: function (it) { return esc(it.word); },
      check: function (it, tid) { return it.id === tid; }
    });
  }

  /* ---------- 5. Phân loại vào giỏ ---------- */
  function buildSort(q, c) {
    var pair = S.L.pair;
    c.card.appendChild(el("div", "prompt", "Từ này thiếu chữ nào? Kéo vào giỏ đúng:"));
    var singles = q.items.filter(function (f) { return f.a.length === 1; });
    var chosen = [];
    pair.forEach(function (letter) {
      shuffle(singles.filter(function (f) { return f.a[0] === letter && chosen.indexOf(f) < 0; })).slice(0, 3).forEach(function (f) { chosen.push(f); });
    });
    var items = chosen.map(function (f, i) { return { id: "s" + i, gap: gapWord(f.t), letter: f.a[0], word: fullWord(f.t, f.a) }; });
    assign(c, {
      tcls: "baskets", label: "Phân loại " + pair[0] + " / " + pair[1],
      spoken: "Phân loại",
      items: items,
      targets: pair.map(function (p, i) { return { id: p, cls: "bk" + i, html: '<div class="bk-label">' + esc(p) + "</div>" }; }),
      chip: function (it) { return esc(it.gap); },
      placedHtml: function (it) { return esc(it.word); },
      check: function (it, tid) { return it.letter === tid; }
    });
  }

  /* ---------- 6. Lật thẻ ghép đôi hình – từ ---------- */
  function buildMemory(q, c) {
    c.card.appendChild(el("div", "prompt", "Lật hai thẻ để ghép hình với từ:"));
    var cards = [];
    q.items.forEach(function (f, i) {
      cards.push({ k: i, img: f.img });
      cards.push({ k: i, word: fullWord(f.t, f.a) });
    });
    var grid = el("div", "mem-grid");
    var open = [], lock = false, pairs = q.items.length;
    shuffle(cards).forEach(function (cd) {
      var b = el("button", "mem");
      b.setAttribute("aria-label", "Thẻ úp");
      b.innerHTML = '<span class="face back">❄</span><span class="face front">' +
        (cd.img ? '<img alt="" src="img/' + cd.img + '.jpg">' : "<b>" + esc(cd.word) + "</b>") + "</span>";
      b.addEventListener("click", function () {
        if (lock || c.st.done || b.classList.contains("flip") || b.classList.contains("done")) return;
        b.classList.add("flip"); sfx.pop(); open.push({ b: b, cd: cd });
        if (open.length < 2) return;
        var a = open[0], z = open[1]; open = [];
        if (a.cd.k === z.cd.k) {
          a.b.classList.add("done"); z.b.classList.add("done");
          pairs--; c.fb.textContent = "";
          if (!pairs) c.finish("Lật thẻ", { partial: true, silent: true, label: "Lật thẻ ghép đôi" });
        } else {
          lock = true; c.wrong("Chưa trùng, thử lại nhé!");
          setTimeout(function () { a.b.classList.remove("flip"); z.b.classList.remove("flip"); lock = false; }, 900);
        }
      });
      grid.appendChild(b);
    });
    c.card.appendChild(grid);
  }

  /* ---------- 7. Tìm tất cả từ viết đúng ---------- */
  function buildFind(q, c) {
    c.card.appendChild(el("div", "prompt", "Chạm vào tất cả các từ viết đúng:"));
    var good = shuffle(q.picks).slice(0, 3).map(function (p) { return { w: p.o[0], ok: true }; });
    var bad = shuffle(q.picks).slice(0, 3).map(function (p) { return { w: p.o[1], ok: false }; });
    var items = shuffle(good.concat(bad));
    var grid = el("div", "find-grid");
    items.forEach(function (it) {
      var b = el("button", "find", esc(it.w));
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        if (c.st.done) return;
        var on = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", on ? "true" : "false"); b.classList.toggle("on", on); sfx.pop();
        check.disabled = !grid.querySelector(".on");
      });
      it.b = b; grid.appendChild(b);
    });
    var check = el("button", "action", "Kiểm tra"); check.disabled = true;
    check.addEventListener("click", function () {
      var allOk = items.every(function (it) { return it.b.classList.contains("on") === it.ok; });
      if (allOk) {
        items.forEach(function (it) { it.b.classList.add(it.ok ? "good" : "gone"); it.b.disabled = true; });
        check.disabled = true;
        c.finish("Tìm từ viết đúng", { partial: true, silent: true, label: "Tìm từ viết đúng" });
      } else {
        items.forEach(function (it) {
          if (it.b.classList.contains("on") && !it.ok) { it.b.classList.remove("on"); it.b.setAttribute("aria-pressed", "false"); flash(it.b, "bad"); }
        });
        c.wrong("Còn từ chưa đúng, tìm lại nhé!"); check.disabled = !grid.querySelector(".on");
      }
    });
    c.card.appendChild(grid);
    c.foot.appendChild(check);
  }

  /* ---------- kết quả ---------- */
  function result() {
    var n = S.qs.length, ok = S.firstTry, pct = S.score / (n * POINTS);
    var stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
    setBest(S.L.id, stars);
    sfx.win();
    app.innerHTML = ""; clearGhosts();
    var me = student(), saveNote = null;
    if (me) {
      saveNote = el("div", "save-note", "Đang lưu kết quả…");
      rpc("save_result", { p_token: me.token, p_lesson: S.L.id, p_score: S.score, p_stars: stars, p_first_try: ok, p_total: n })
        .then(function (okSaved) {
          saveNote.textContent = okSaved === true ? "Đã lưu kết quả." : "Chưa lưu được kết quả. Em hãy đăng nhập lại nhé.";
        })
        .catch(function () { saveNote.textContent = "Chưa lưu được kết quả (lỗi mạng)."; });
    }
    var card = el("section", "qcard result");
    card.appendChild(el("div", null, SNOWMAN));
    card.appendChild(el("h2", null, "Kết quả · Bài số " + S.L.id));
    var s = "";
    for (var i = 1; i <= 3; i++) s += '<span class="' + (stars >= i ? "" : "off") + '">★</span>';
    card.appendChild(el("div", "stars", s));
    card.appendChild(el("div", "score-big", S.score + " điểm"));
    card.appendChild(el("div", null, "Đúng ngay lần đầu: <b>" + ok + "/" + n + "</b> trò chơi"));
    var msg = stars === 3 ? "Giỏi quá! Con làm rất tốt." : stars === 2 ? "Khá lắm! Làm lại để đạt 3 sao nhé." : "Cố lên! Mình luyện thêm một lần nữa nhé.";
    card.appendChild(el("div", "prompt", msg));
    if (saveNote) card.appendChild(saveNote);
    var btns = el("div", "btns");
    var again = el("button", "action next", "Làm lại");
    again.addEventListener("click", function () { start(S.L); });
    var other = el("button", "action ghost", "Chọn bài khác");
    other.addEventListener("click", home);
    btns.appendChild(again); btns.appendChild(other);
    card.appendChild(btns);
    app.appendChild(card);
    again.focus();
  }

  intro();
})();
