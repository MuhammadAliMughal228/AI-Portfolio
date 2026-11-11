(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer:fine)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const root = document.documentElement;
  const css = n => getComputedStyle(root).getPropertyValue(n).trim();
  let palette = {};
  const readPalette = () => { palette = { a1: css("--a1"), a2: css("--a2"), a3: css("--a3"), text: css("--text") }; };

  /* ---------- Theme ---------- */
  const saved = store.get("theme");
  root.dataset.theme = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  readPalette();
  $("#themeToggle").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("theme", root.dataset.theme);
    readPalette();
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menuBtn"), links = $(".nav-links");
  menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", links.classList.toggle("open")));
  $$(".nav-links a").forEach(a => a.addEventListener("click", () => { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); }));

  /* ---------- Nav state, scroll progress, timeline fill ---------- */
  const nav = $(".nav"), bar = $("#progressBar"), tl = $("#timeline"), tlFill = $("#tlFill");
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const r = tl.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height));
    tlFill.style.transform = `scaleY(${k})`;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const navObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$(".nav-links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id]").forEach(s => navObs.observe(s));

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduceMotion) {
    const cur = $(".cursor"), dot = $(".cursor-dot"), ring = $(".cursor-ring");
    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    const loop = () => { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener("pointerover", e => cur.classList.toggle("hover", !!e.target.closest("a,button,.card,[data-tip]")));
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach(b => {
      b.addEventListener("pointermove", e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ---------- Rotating headline ---------- */
  const words = ["thinks in agents", "earns its accuracy", "recommends, not guesses", "prices in real time", "ships to production"];
  const rot = $("#rotWord");
  if (!reduceMotion) {
    let wi = 0, ci = words[0].length, deleting = true;
    const tick = () => {
      const w = words[wi];
      ci += deleting ? -1 : 1;
      rot.textContent = w.slice(0, ci) || "​";
      let delay = deleting ? 30 : 65;
      if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 300; }
      else if (!deleting && ci === w.length) { deleting = true; delay = 2400; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 3200);
  }

  /* ---------- 3D neural globe ---------- */
  const cv = $("#globe"), ctx = cv.getContext("2d");
  const N = 220, pts = [], edges = [];
  for (let i = 0; i < N; i++) { // fibonacci sphere
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = i * Math.PI * (3 - Math.sqrt(5));
    pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
    if (d < .26) edges.push([i, j]);
  }
  const adj = Array.from({ length: N }, () => []);
  for (const [i, j] of edges) { adj[i].push(j); adj[j].push(i); }
  const pulses = Array.from({ length: 14 }, () => { const [a, b] = edges[(Math.random() * edges.length) | 0]; return { a, b, t: Math.random() }; });
  let W = 0, H = 0, raf, rotY = 0, rotX = -.25, tX = 0, tY = 0, visible = true;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.offsetWidth; H = cv.offsetHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  if (finePointer) addEventListener("pointermove", e => { tX = (e.clientY / innerHeight - .5) * .6; tY = (e.clientX / innerWidth - .5) * .8; }, { passive: true });
  const hexA = (hex, a) => {
    const h = hex.replace("#", ""), n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  };
  const drawGlobe = () => {
    ctx.clearRect(0, 0, W, H);
    if (!reduceMotion) rotY += .0025;
    const ry = rotY + tY, rx = rotX + tX;
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    const R = Math.min(W, H) * .4, ox = W / 2, oy = H / 2;
    const P = pts.map(([x, y, z]) => {
      const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      const s = 1.6 / (2.6 - z2);
      return [ox + x1 * R * s, oy + y2 * R * s, z2];
    });
    // glow
    const g = ctx.createRadialGradient(ox, oy, R * .1, ox, oy, R * 1.25);
    g.addColorStop(0, hexA(palette.a1, .18)); g.addColorStop(1, hexA(palette.a1, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = .8;
    for (const [i, j] of edges) {
      const a = P[i], b = P[j], depth = (a[2] + b[2]) / 2;
      ctx.strokeStyle = hexA(depth > 0 ? palette.a2 : palette.a1, .08 + (depth + 1) * .16);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    for (const p of P) {
      const k = (p[2] + 1) / 2;
      ctx.fillStyle = hexA(k > .5 ? palette.a2 : palette.a1, .25 + k * .75);
      ctx.beginPath(); ctx.arc(p[0], p[1], .8 + k * 2, 0, 7); ctx.fill();
    }
    for (const pu of pulses) {
      pu.t += reduceMotion ? 0 : .02;
      if (pu.t >= 1) { pu.t = 0; const nb = adj[pu.b].filter(n => n !== pu.a); pu.a = pu.b; pu.b = nb.length ? nb[(Math.random() * nb.length) | 0] : pu.a; }
      const a = P[pu.a], b = P[pu.b];
      const x = a[0] + (b[0] - a[0]) * pu.t, y = a[1] + (b[1] - a[1]) * pu.t, z = (a[2] + b[2]) / 2;
      if (z < -.2) continue;
      ctx.shadowBlur = 14; ctx.shadowColor = palette.a3;
      ctx.fillStyle = palette.a3; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
    }
    if (!reduceMotion && visible) raf = requestAnimationFrame(drawGlobe);
  };
  resize(); drawGlobe();
  addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); drawGlobe(); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) drawGlobe(); }).observe(cv);

  /* ---------- Tooltip ---------- */
  const tip = $("#tooltip");
  const showTip = (e, html) => { tip.innerHTML = html; tip.style.left = e.clientX + "px"; tip.style.top = e.clientY + "px"; tip.classList.add("show"); };
  const hideTip = () => tip.classList.remove("show");
  const bindTip = (el, html) => {
    el.dataset.tip = "";
    el.addEventListener("pointermove", e => showTip(e, html));
    el.addEventListener("pointerleave", hideTip);
  };

  /* ---------- Counters ---------- */
  const countObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || "";
    const t0 = performance.now(), dur = reduceMotion ? 0 : 1800;
    const step = t => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1, v = to * (1 - Math.pow(1 - k, 4));
      el.textContent = v.toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step); countObs.unobserve(el);
  }), { threshold: .5 });
  $$("[data-count]").forEach(el => countObs.observe(el));

  /* ---------- Chart: 80 LLM dot grid ---------- */
  const dg = $("#dotgrid");
  dg.innerHTML = Array.from({ length: 80 }, (_, i) => `<i style="--k:${((i % 20) / 19).toFixed(2)}"></i>`).join("");
  const lightDots = () => $$("i", dg).forEach((d, i) => setTimeout(() => d.classList.add("on"), reduceMotion ? 0 : i * 22));
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { lightDots(); o.disconnect(); } }, { threshold: .4 }).observe(dg);
  bindTip(dg, "<b>80+ models</b><span>run on the same prompts &amp; live data, scored blind</span>");

  /* ---------- Chart: accuracy rings ---------- */
  const RINGS = [
    { v: 96.7, label: "96.7%", name: "Financial forecast", note: "LSTM + Prophet + XGBoost + LightGBM ensemble", c: "var(--a1)" },
    { v: 94, label: "94%+", name: "Equipment detection", note: "YOLO object detection model", c: "var(--a2)" },
    { v: 87, label: "R² 0.87", name: "Travel cost model", note: "Random Forest regression", c: "var(--a3)" },
  ];
  const C = 2 * Math.PI * 34;
  const ringsEl = $("#rings");
  ringsEl.innerHTML = RINGS.map(r => `
    <div class="ring">
      <svg viewBox="0 0 84 84" aria-hidden="true"><circle class="track" cx="42" cy="42" r="34"/><circle class="val" cx="42" cy="42" r="34" stroke="${r.c}" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-off="${C * (1 - r.v / 100)}"/></svg>
      <div><b>${r.label}</b><span>${r.name}</span></div>
    </div>`).join("");
  $$(".ring", ringsEl).forEach((el, i) => bindTip(el, `<b>${RINGS[i].label}</b><span>${RINGS[i].note}</span>`));
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    $$(".val", ringsEl).forEach((c, i) => setTimeout(() => { c.style.strokeDashoffset = c.dataset.off; }, i * 200));
    o.disconnect();
  }, { threshold: .4 }).observe(ringsEl);

  /* ---------- Chart: measured improvement bars ---------- */
  const BARS = [
    { v: 60, name: "Analysis time cut", src: "LangChain CSV agent · Aug AI", sign: "−" },
    { v: 60, name: "System uptime", src: "IT operations", sign: "+" },
    { v: 50, name: "Lead acquisition", src: "Apify + Zapier automation", sign: "+" },
    { v: 40, name: "RAG efficiency", src: "Llama 3.2 RAG system", sign: "+" },
    { v: 25, name: "Model performance", src: "Data annotation · ICRL Lab", sign: "+" },
  ];
  const MAX = 60;
  const hb = $("#hbars");
  hb.innerHTML = BARS.map((b, i) => `
    <div class="hbar">
      <span class="hbar-name">${b.name}<small>${b.src}</small></span>
      <span class="hbar-track"><span class="hbar-fill" style="--w:${b.v / MAX * 100}%;--delay:${i * 120}ms"></span></span>
      <span class="hbar-val">${b.sign}${b.v}%</span>
    </div>`).join("") +
    `<div class="hbars-axis" aria-hidden="true"><span></span><div><span>0%</span><span>20%</span><span>40%</span><span>60%</span></div><span></span></div>`;
  $$(".hbar", hb).forEach((el, i) => bindTip(el, `<b>${BARS[i].sign}${BARS[i].v}% ${BARS[i].name.toLowerCase()}</b><span>${BARS[i].src}</span>`));

  /* ---------- Chart: career gantt ---------- */
  const T0 = 2018, T1 = 2027, span = T1 - T0;
  const now = new Date(), nowY = now.getFullYear() + now.getMonth() / 12;
  const ROLES = [
    { org: "KineticTech", role: "AI Engineer", s: 2024 + 11 / 12, e: nowY, d: "Dec 2024 — Present", now: true },
    { org: "Aug AI", role: "AI Developer", s: 2024, e: 2024 + 10 / 12, d: "Jan 2024 — Nov 2024" },
    { org: "ICRL Lab", role: "AI Trainee", s: 2022 + 7 / 12, e: 2023 + 11 / 12, d: "Aug 2022 — Dec 2023" },
    { org: "Private Institute", role: "IT Troubleshooter", s: 2018 + 4 / 12, e: 2022 + 6 / 12, d: "May 2018 — Jul 2022" },
  ];
  const gantt = $("#gantt");
  gantt.innerHTML = ROLES.map((r, i) => `
    <div class="g-row">
      <span>${r.org}</span>
      <div class="g-track"><span class="g-bar ${r.now ? "now" : ""}" style="--l:${(r.s - T0) / span * 100}%;--w:${(r.e - r.s) / span * 100}%;--o:${1 - i * .2};--delay:${i * 150}ms"></span></div>
    </div>`).join("") +
    `<div class="g-axis" aria-hidden="true"><span></span><div>${[2018, 2020, 2022, 2024, 2026].map(y => `<span style="left:${(y - T0) / span * 100}%">${y}</span>`).join("")}</div></div>`;
  $$(".g-row", gantt).forEach((el, i) => bindTip(el, `<b>${ROLES[i].role} · ${ROLES[i].org}</b><span>${ROLES[i].d}</span>`));

  /* ---------- Spotlight follow ---------- */
  const spot = el => el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", e.clientX - r.left + "px");
    el.style.setProperty("--y", e.clientY - r.top + "px");
  });
  $$(".tile").forEach(spot);

  /* ---------- Card visuals (see mockups.js) ---------- */
  const visual = p => `
    <div class="grid-lines"></div>
    <div class="mock-wrap">${window.MOCKUPS.render(p)}</div>
    ${p.shot ? `<img class="shot" src="${p.shot}" alt="${p.title} screenshot" loading="lazy" onerror="this.remove()">` : ""}`;

  /* ---------- Render projects ---------- */
  const grid = $("#projectGrid");
  const arrowSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  grid.innerHTML = window.PROJECTS.map(p => `
    <article class="card reveal ${p.featured ? "featured" : ""}" style="--accent:${p.accent}" data-cat="${p.cat.join(" ")}" data-id="${p.id}" tabindex="0" role="button" aria-label="Open case study: ${p.title}">
      <div class="card-visual">${p.links.length ? `<span class="badge-live">Live</span>` : ""}${visual(p)}</div>
      <div class="card-body">
        <span class="card-tag">${p.tagline}</span>
        <h3>${p.title}</h3>
        <p>${p.summary}</p>
        <ul class="card-impact">${p.impact.slice(0, 2).map(i => `<li>${i}</li>`).join("")}</ul>
        <div class="card-foot">
          <div class="mini-stack">${p.stack.slice(0, 4).map(s => `<span>${s}</span>`).join("")}</div>
          <span class="arrow">${arrowSvg}</span>
        </div>
      </div>
    </article>`).join("");
  $$(".card", grid).forEach(spot);

  /* ---------- Filters with sliding pill ---------- */
  const pill = $(".filter-pill");
  const movePill = btn => {
    pill.style.width = btn.offsetWidth + "px"; pill.style.height = btn.offsetHeight + "px";
    pill.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
  };
  $$(".filters .chip").forEach(btn => btn.addEventListener("click", () => {
    $$(".filters .chip").forEach(b => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
    movePill(btn);
    const f = btn.dataset.filter;
    $$(".card", grid).forEach(c => {
      const show = f === "all" || c.dataset.cat.split(" ").includes(f);
      c.classList.toggle("hide", !show);
      if (show && !reduceMotion) c.animate([{ opacity: 0, transform: "translateY(20px) scale(.97)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)" });
    });
  }));
  const placePill = () => movePill($(".filters .chip.is-active"));
  placePill(); addEventListener("resize", placePill);
  document.fonts?.ready.then(placePill);

  /* ---------- Modal ---------- */
  const modal = $("#projectModal"), body = $("#modalBody");
  const openProject = id => {
    const p = window.PROJECTS.find(x => x.id === id); if (!p) return;
    body.innerHTML = `
      <div class="modal-hero" style="--accent:${p.accent}">${visual(p)}</div>
      <div class="modal-content" style="--accent:${p.accent}">
        <span class="card-tag">${p.tagline}</span>
        <h2 id="mTitle">${p.title}</h2>
        <p>${p.summary}</p>
        <h4>The problem</h4><p>${p.problem}</p>
        <h4>What I built</h4><ul>${p.built.map(b => `<li>${b}</li>`).join("")}</ul>
        <h4>Impact</h4><div class="impact">${p.impact.map(i => `<span>${i}</span>`).join("")}</div>
        <h4>Stack</h4><div class="mini-stack">${p.stack.map(s => `<span>${s}</span>`).join("")}</div>
        ${p.links.length ? `<div class="modal-links">${p.links.map((l, i) => `<a class="btn ${i ? "btn-ghost" : "btn-primary"}" href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>`).join("")}</div>` : ""}
      </div>`;
    modal.showModal(); modal.scrollTop = 0;
    history.replaceState(null, "", "#project-" + id);
  };
  modal.addEventListener("close", () => history.replaceState(null, "", location.pathname + location.search));
  grid.addEventListener("click", e => { const c = e.target.closest(".card"); if (c) openProject(c.dataset.id); });
  grid.addEventListener("keydown", e => { const c = e.target.closest(".card"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openProject(c.dataset.id); } });
  $("#modalClose").addEventListener("click", () => modal.close());
  modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });
  if (location.hash.startsWith("#project-")) openProject(location.hash.slice(9));

  /* ---------- Reveal on scroll ---------- */
  const revObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add("in"); revObs.unobserve(el);
    setTimeout(() => { el.style.transitionDelay = ""; }, 1400);
  }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + "ms"; revObs.observe(el); });

  /* ---------- Copy email / toast ---------- */
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2000); };
  $("#copyEmail").addEventListener("click", async e => {
    const email = e.currentTarget.dataset.email;
    try { await navigator.clipboard.writeText(email); toast("Email copied ✓"); }
    catch { location.href = "mailto:" + email; }
  });

  $("#year").textContent = new Date().getFullYear();
})();
