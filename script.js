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

  /* ---------- Generated card art ---------- */
  const ART = {
    chat: `<g fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="200" cy="112" r="26" fill="currentColor" fill-opacity=".18"><animate attributeName="r" values="24;30;24" dur="3s" repeatCount="indefinite"/></circle><circle cx="200" cy="112" r="10" fill="currentColor"/>
      ${[[80,50],[320,50],[70,170],[330,170],[200,30]].map(([x,y],i)=>`<line x1="200" y1="112" x2="${x}" y2="${y}" stroke-dasharray="4 5" opacity=".6"><animate attributeName="stroke-dashoffset" from="0" to="-18" dur="${1.2+i*.2}s" repeatCount="indefinite"/></line><rect x="${x-34}" y="${y-14}" width="68" height="28" rx="14" fill="currentColor" fill-opacity=".12"/>`).join("")}
      </g><g font-family="JetBrains Mono,monospace" font-size="10" fill="currentColor" text-anchor="middle">
      <text x="80" y="54">LEADS</text><text x="320" y="54">SALES</text><text x="70" y="174">HR</text><text x="330" y="174">FINANCE</text><text x="200" y="34">CHAT</text></g>`,
    bars: (() => { let s = ""; const v = [.92,.84,.8,.74,.7,.63,.58,.5,.44,.38]; v.forEach((h,i)=>{ const x=40+i*33, bh=h*150; s+=`<rect x="${x}" y="${190-bh}" width="22" height="${bh}" rx="4" fill="currentColor" fill-opacity="${i===0?.95:.25+h*.35}"><animate attributeName="height" from="0" to="${bh}" dur=".9s" begin="${i*.06}s" fill="freeze"/><animate attributeName="y" from="190" to="${190-bh}" dur=".9s" begin="${i*.06}s" fill="freeze"/></rect>`;}); return s + `<line x1="30" y1="190" x2="372" y2="190" stroke="currentColor" opacity=".4"/><text x="40" y="30" font-family="JetBrains Mono,monospace" font-size="11" fill="currentColor">WIN · TIE · LOSS  —  80+ MODELS</text>`; })(),
    court: `<g fill="none" stroke="currentColor" stroke-width="1.5" opacity=".7"><rect x="40" y="30" width="320" height="165" rx="6"/><line x1="200" y1="30" x2="200" y2="195"/><circle cx="200" cy="112" r="28"/><path d="M40 70 h50 v85 h-50"/><path d="M360 70 h-50 v85 h50"/><path d="M90 50 a75 75 0 0 1 0 125" /><path d="M310 50 a75 75 0 0 0 0 125"/></g>
      ${[[130,80],[160,140],[250,95],[280,150],[220,60]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="6" fill="currentColor"><animate attributeName="r" values="5;9;5" dur="2s" begin="${i*.3}s" repeatCount="indefinite"/></circle>`).join("")}
      <polyline points="130,80 160,140 250,95 280,150" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite"/></polyline>`,
    dash: `<g fill="currentColor">${[0,1,2].map(i=>`<rect x="${40+i*110}" y="30" width="96" height="44" rx="8" fill-opacity=".14"/><rect x="${52+i*110}" y="42" width="40" height="6" rx="3" fill-opacity=".5"/><rect x="${52+i*110}" y="54" width="60" height="10" rx="3" fill-opacity=".9"/>`).join("")}<rect x="40" y="88" width="206" height="110" rx="8" fill-opacity=".1"/><rect x="258" y="88" width="102" height="110" rx="8" fill-opacity=".1"/></g>
      <polyline points="52,180 80,160 108,168 136,130 164,140 192,110 232,100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="260" stroke-dashoffset="260"><animate attributeName="stroke-dashoffset" from="260" to="0" dur="2s" fill="freeze"/></polyline><circle cx="309" cy="143" r="34" fill="none" stroke="currentColor" stroke-width="10" stroke-dasharray="150 214" opacity=".9"/>`,
    cart: `<g fill="none" stroke="currentColor" stroke-width="1.5">${[0,1,2].map(i=>`<rect x="${40+i*112}" y="40" width="96" height="120" rx="10" fill="currentColor" fill-opacity="${i===1?.22:.1}"/><rect x="${52+i*112}" y="52" width="72" height="42" rx="6" fill="currentColor" fill-opacity=".25" stroke="none"/>`).join("")}</g>
      <g font-family="JetBrains Mono,monospace" font-size="11" fill="currentColor"><text x="52" y="116">Ice rink</text><text x="52" y="140">€6.00</text><text x="164" y="116">AI Bundle</text><text x="164" y="140">€25 → €20</text><text x="276" y="116">Ferris</text><text x="276" y="140">€8.00</text></g>
      <rect x="152" y="172" width="96" height="26" rx="13" fill="currentColor"/><text x="200" y="189" font-family="JetBrains Mono,monospace" font-size="11" text-anchor="middle" fill="#05060b">✦ suggested</text>`,
    pipe: `<g fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="80" cy="70" rx="40" ry="12"/><path d="M40 70v80c0 7 18 12 40 12s40-5 40-12V70"/><ellipse cx="80" cy="110" rx="40" ry="12" opacity=".4"/>
      <path d="M130 112h140" stroke-dasharray="6 6"><animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1s" repeatCount="indefinite"/></path><path d="M262 104l10 8-10 8"/></g>
      ${Array.from({length:16},(_,i)=>`<circle cx="${290+(i%4)*22}" cy="${70+Math.floor(i/4)*22}" r="5" fill="currentColor" fill-opacity="${.3+(i%3)*.25}"><animate attributeName="fill-opacity" values="${.3+(i%3)*.25};1;${.3+(i%3)*.25}" dur="2.4s" begin="${i*.15}s" repeatCount="indefinite"/></circle>`).join("")}
      <g font-family="JetBrains Mono,monospace" font-size="10" fill="currentColor"><text x="52" y="190">POSTGRES</text><text x="168" y="100">snapshot · dedupe</text><text x="296" y="190">PINECONE</text></g>`,
    leaf: `<path d="M200 40c70 10 110 60 90 130-70 0-120-40-120-100 0-10 10-25 30-30z" fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-width="1.5"><animateTransform attributeName="transform" type="rotate" values="-3 200 110;3 200 110;-3 200 110" dur="5s" repeatCount="indefinite"/></path><path d="M175 185c20-50 50-90 100-120" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="60" y="190" font-family="JetBrains Mono,monospace" font-size="12" fill="currentColor">CO₂e · XGBoost</text>`,
    chart: `<polyline points="40,170 80,150 120,158 160,120 200,128 240,92 280,100" fill="none" stroke="currentColor" stroke-width="2.5"/><polyline points="280,100 320,74 360,60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 6"><animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.2s" repeatCount="indefinite"/></polyline><path d="M280 100 L320 60 L360 40 L360 84 L320 92 Z" fill="currentColor" fill-opacity=".15"/><line x1="280" y1="30" x2="280" y2="195" stroke="currentColor" opacity=".3"/><text x="290" y="190" font-family="JetBrains Mono,monospace" font-size="11" fill="currentColor">forecast 96.7%</text>`,
    route: `<path d="M60 170 C 120 60, 200 200, 260 90 S 330 60, 350 50" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="8 6"><animate attributeName="stroke-dashoffset" from="0" to="-28" dur="1.4s" repeatCount="indefinite"/></path><circle cx="60" cy="170" r="8" fill="currentColor"/><circle cx="350" cy="50" r="8" fill="currentColor"/><rect x="230" y="140" width="120" height="40" rx="10" fill="currentColor" fill-opacity=".15"/><text x="244" y="165" font-family="JetBrains Mono,monospace" font-size="12" fill="currentColor">est. fare ✓</text>`,
  };
  const visual = p => `
    <div class="grid-lines"></div>
    <svg class="art" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${ART[p.art] || ""}</svg>
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
