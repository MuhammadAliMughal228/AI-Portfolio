(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const saved = store.get("theme");
  root.dataset.theme = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  $("#themeToggle").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("theme", root.dataset.theme);
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menuBtn"), links = $(".nav-links");
  menuBtn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  $$(".nav-links a").forEach(a => a.addEventListener("click", () => { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); }));

  /* ---------- Nav state ---------- */
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const navObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$(".nav-links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id]").forEach(s => navObs.observe(s));

  /* ---------- Cursor glow ---------- */
  if (!reduceMotion && matchMedia("(pointer:fine)").matches) {
    addEventListener("pointermove", e => {
      root.style.setProperty("--mx", e.clientX + "px");
      root.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });
  }

  /* ---------- Rotating headline ---------- */
  const words = ["thinks in agents", "earns its accuracy", "recommends, not guesses", "prices in real time", "ships to production"];
  const rot = $("#rotWord");
  if (!reduceMotion) {
    let wi = 0, ci = words[0].length, deleting = true;
    const tick = () => {
      const w = words[wi];
      ci += deleting ? -1 : 1;
      rot.textContent = w.slice(0, ci);
      let delay = deleting ? 35 : 70;
      if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 300; }
      else if (!deleting && ci === w.length) { deleting = true; delay = 2200; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2400);
  }

  /* ---------- Neural network canvas ---------- */
  const cv = $("#neural"), ctx = cv.getContext("2d");
  let W, H, nodes = [], raf;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.offsetWidth; H = cv.offsetHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, (W * H) / 16000));
    nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 }));
  };
  const draw = () => {
    const brand = getComputedStyle(root).getPropertyValue("--brand").trim();
    ctx.clearRect(0, 0, W, H);
    for (const p of nodes) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    ctx.strokeStyle = brand; ctx.fillStyle = brand;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) { ctx.globalAlpha = (1 - d / 130) * .35; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      ctx.globalAlpha = .8; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduceMotion) raf = requestAnimationFrame(draw);
  };
  resize(); draw();
  addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); draw(); });
  new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) draw(); }).observe(cv);

  /* ---------- Counters ---------- */
  const countObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || "";
    const t0 = performance.now(), dur = reduceMotion ? 0 : 1400;
    const step = t => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1, v = to * (1 - Math.pow(1 - k, 3));
      el.textContent = v.toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step); countObs.unobserve(el);
  }), { threshold: .5 });
  $$("[data-count]").forEach(el => countObs.observe(el));

  /* ---------- Generated card art ---------- */
  const ART = {
    chat: `<g fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="200" cy="112" r="26" fill="currentColor" fill-opacity=".18"/><circle cx="200" cy="112" r="10" fill="currentColor"/>
      ${[[80,50],[320,50],[70,170],[330,170],[200,30]].map(([x,y],i)=>`<line x1="200" y1="112" x2="${x}" y2="${y}" stroke-dasharray="4 5" opacity=".6"><animate attributeName="stroke-dashoffset" from="0" to="-18" dur="${1.2+i*.2}s" repeatCount="indefinite"/></line><rect x="${x-34}" y="${y-14}" width="68" height="28" rx="14" fill="currentColor" fill-opacity=".12"/>`).join("")}
      </g><g font-family="JetBrains Mono,monospace" font-size="10" fill="currentColor" text-anchor="middle">
      <text x="80" y="54">LEADS</text><text x="320" y="54">SALES</text><text x="70" y="174">HR</text><text x="330" y="174">FINANCE</text><text x="200" y="34">CHAT</text></g>`,
    bars: (() => { let s = ""; const v = [.92,.84,.8,.74,.7,.63,.58,.5,.44,.38]; v.forEach((h,i)=>{ const x=40+i*33, bh=h*150; s+=`<rect x="${x}" y="${190-bh}" width="22" height="${bh}" rx="5" fill="currentColor" fill-opacity="${i===0?.95:.25+h*.35}"><animate attributeName="height" from="0" to="${bh}" dur=".9s" begin="${i*.06}s" fill="freeze"/><animate attributeName="y" from="190" to="${190-bh}" dur=".9s" begin="${i*.06}s" fill="freeze"/></rect>`;}); return s + `<line x1="30" y1="190" x2="372" y2="190" stroke="currentColor" opacity=".4"/><text x="40" y="30" font-family="JetBrains Mono,monospace" font-size="11" fill="currentColor">WIN · TIE · LOSS  —  80+ MODELS</text>`; })(),
    court: `<g fill="none" stroke="currentColor" stroke-width="1.5" opacity=".7"><rect x="40" y="30" width="320" height="165" rx="6"/><line x1="200" y1="30" x2="200" y2="195"/><circle cx="200" cy="112" r="28"/><path d="M40 70 h50 v85 h-50"/><path d="M360 70 h-50 v85 h50"/><path d="M90 50 a75 75 0 0 1 0 125" /><path d="M310 50 a75 75 0 0 0 0 125"/></g>
      ${[[130,80],[160,140],[250,95],[280,150],[220,60]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="6" fill="currentColor"><animate attributeName="r" values="5;9;5" dur="2s" begin="${i*.3}s" repeatCount="indefinite"/></circle>`).join("")}
      <polyline points="130,80 160,140 250,95 280,150" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5"/>`,
    dash: `<g fill="currentColor">${[0,1,2].map(i=>`<rect x="${40+i*110}" y="30" width="96" height="44" rx="8" fill-opacity=".14"/><rect x="${52+i*110}" y="42" width="40" height="6" rx="3" fill-opacity=".5"/><rect x="${52+i*110}" y="54" width="60" height="10" rx="3" fill-opacity=".9"/>`).join("")}<rect x="40" y="88" width="206" height="110" rx="8" fill-opacity=".1"/><rect x="258" y="88" width="102" height="110" rx="8" fill-opacity=".1"/></g>
      <polyline points="52,180 80,160 108,168 136,130 164,140 192,110 232,100" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="309" cy="143" r="34" fill="none" stroke="currentColor" stroke-width="10" stroke-dasharray="150 214" opacity=".9"/>`,
    cart: `<g fill="none" stroke="currentColor" stroke-width="1.5">${[0,1,2].map(i=>`<rect x="${40+i*112}" y="40" width="96" height="120" rx="10" fill="currentColor" fill-opacity="${i===1?.22:.1}"/><rect x="${52+i*112}" y="52" width="72" height="42" rx="6" fill="currentColor" fill-opacity=".25" stroke="none"/>`).join("")}</g>
      <g font-family="JetBrains Mono,monospace" font-size="11" fill="currentColor"><text x="52" y="116">Ice rink</text><text x="52" y="140">€6.00</text><text x="164" y="116">AI Bundle</text><text x="164" y="140">€25 → €20</text><text x="276" y="116">Ferris</text><text x="276" y="140">€8.00</text></g>
      <rect x="152" y="172" width="96" height="26" rx="13" fill="currentColor"/><text x="200" y="189" font-family="JetBrains Mono,monospace" font-size="11" text-anchor="middle" fill="#05080f">✦ suggested</text>`,
    pipe: `<g fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="80" cy="70" rx="40" ry="12"/><path d="M40 70v80c0 7 18 12 40 12s40-5 40-12V70"/><ellipse cx="80" cy="110" rx="40" ry="12" opacity=".4"/>
      <path d="M130 112h140" stroke-dasharray="6 6"><animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1s" repeatCount="indefinite"/></path><path d="M262 104l10 8-10 8"/></g>
      ${Array.from({length:16},(_,i)=>`<circle cx="${290+(i%4)*22}" cy="${70+Math.floor(i/4)*22}" r="5" fill="currentColor" fill-opacity="${.3+(i%3)*.25}"/>`).join("")}
      <g font-family="JetBrains Mono,monospace" font-size="10" fill="currentColor"><text x="52" y="190">POSTGRES</text><text x="168" y="100">snapshot · dedupe</text><text x="296" y="190">PINECONE</text></g>`,
    leaf: `<path d="M200 40c70 10 110 60 90 130-70 0-120-40-120-100 0-10 10-25 30-30z" fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-width="1.5"/><path d="M175 185c20-50 50-90 100-120" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="60" y="190" font-family="JetBrains Mono,monospace" font-size="12" fill="currentColor">CO₂e · XGBoost</text>`,
    chart: `<polyline points="40,170 80,150 120,158 160,120 200,128 240,92 280,100" fill="none" stroke="currentColor" stroke-width="2.5"/><polyline points="280,100 320,74 360,60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 6"/><path d="M280 100 L320 60 L360 40 L360 84 L320 92 Z" fill="currentColor" fill-opacity=".15"/><line x1="280" y1="30" x2="280" y2="195" stroke="currentColor" opacity=".3"/><text x="290" y="190" font-family="JetBrains Mono,monospace" font-size="11" fill="currentColor">forecast 96.7%</text>`,
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

  /* ---------- Filters ---------- */
  $$(".filters .chip").forEach(btn => btn.addEventListener("click", () => {
    $$(".filters .chip").forEach(b => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
    const f = btn.dataset.filter;
    $$(".card", grid).forEach(c => c.classList.toggle("hide", f !== "all" && !c.dataset.cat.split(" ").includes(f)));
  }));

  /* ---------- Card tilt ---------- */
  if (!reduceMotion && matchMedia("(pointer:fine)").matches) {
    $$(".card", grid).forEach(c => {
      c.addEventListener("pointermove", e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
      });
      c.addEventListener("pointerleave", () => { c.style.transform = ""; });
    });
  }

  /* ---------- Modal ---------- */
  const modal = $("#projectModal"), body = $("#modalBody");
  const openProject = id => {
    const p = window.PROJECTS.find(x => x.id === id); if (!p) return;
    body.innerHTML = `
      <div class="modal-hero" style="--accent:${p.accent}">${visual(p)}</div>
      <div class="modal-content">
        <span class="card-tag" style="color:${p.accent}">${p.tagline}</span>
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
  const closeModal = () => { modal.close(); };
  modal.addEventListener("close", () => history.replaceState(null, "", location.pathname + location.search));
  grid.addEventListener("click", e => { const c = e.target.closest(".card"); if (c) openProject(c.dataset.id); });
  grid.addEventListener("keydown", e => { const c = e.target.closest(".card"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openProject(c.dataset.id); } });
  $("#modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  if (location.hash.startsWith("#project-")) openProject(location.hash.slice(9));

  /* ---------- Reveal on scroll ---------- */
  const revObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const el = e.target; el.classList.add("in"); revObs.unobserve(el); setTimeout(() => { el.style.transitionDelay = ""; }, 1000); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 70 + "ms"; revObs.observe(el); });

  /* ---------- Copy email / toast ---------- */
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2000); };
  $("#copyEmail").addEventListener("click", async e => {
    try { await navigator.clipboard.writeText(e.currentTarget.dataset.email); toast("Email copied ✓"); }
    catch { location.href = "mailto:" + e.currentTarget.dataset.email; }
  });

  $("#year").textContent = new Date().getFullYear();
})();
