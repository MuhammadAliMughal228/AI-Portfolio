/* =========================================================================
   MOCKUPS — realistic product-style visuals for each project card.
   Keyed by project id. Numbers are illustrative (synthetic) sample data.
   Every mockup draws in a 400×225 viewBox and uses CSS classes from
   styles.css (.m-*) so it follows the light/dark theme and the card accent.
   ========================================================================= */
(() => {
  "use strict";
  let uid = 0;

  /* ---------- helpers ---------- */
  const X = (i, n, x0, w) => x0 + (i * w) / (n - 1);
  const Y = (v, min, max, y0, h) => y0 + h - ((v - min) / (max - min)) * h;
  const pts = (vals, min, max, x0, y0, w, h) => vals.map((v, i) => [X(i, vals.length, x0, w), Y(v, min, max, y0, h)]);
  const smooth = p => {
    let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  };
  const area = (p, base) => `${smooth(p)} L${p[p.length - 1][0].toFixed(1)},${base} L${p[0][0].toFixed(1)},${base} Z`;
  const grad = (id, op = 0.35) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity="${op}"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient>`;
  const chip = (x, y, text, w) => `<rect x="${x}" y="${y}" width="${w}" height="12" rx="6" class="m-ac" fill-opacity=".16"/><text x="${x + w / 2}" y="${y + 8.5}" class="m-xs m-strong" text-anchor="middle">${text}</text>`;
  const ping = (cx, cy, r = 2.4) => `<circle cx="${cx}" cy="${cy}" r="${r * 2.4}" class="m-ac m-ping"/><circle cx="${cx}" cy="${cy}" r="${r}" class="m-ac"/>`;
  const card = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="m-card"/>`;
  const win = (title, body, defs = "") => `
    <defs>${defs}</defs>
    <rect x="12" y="10" width="376" height="205" rx="12" class="m-win"/>
    <circle cx="26" cy="22.5" r="3" fill="#ff5f57" fill-opacity=".85"/><circle cx="36.5" cy="22.5" r="3" fill="#febc2e" fill-opacity=".85"/><circle cx="47" cy="22.5" r="3" fill="#28c840" fill-opacity=".85"/>
    <rect x="130" y="16" width="140" height="13" rx="6.5" class="m-gray"/>
    <text x="200" y="25.3" class="m-title" text-anchor="middle">${title}</text>
    <line x1="12" y1="35" x2="388" y2="35" class="m-sep"/>
    ${body}`;

  /* ---------- mockups ---------- */
  const M = {
    /* AgentWiz — agent console */
    agentwiz(u) {
      const agents = [["Lead-Gen", "214 leads qualified", 1], ["Sales", "38 deals in pipeline", 1], ["HR", "12 CVs screened", 0], ["Finance", "Q4 report drafted", 1], ["Chat", "1.1k messages", 1]];
      const rows = agents.map(([n, s, live], i) => {
        const y = 43 + i * 33;
        return `${card(22, y, 146, 28)}
          <circle cx="37" cy="${y + 14}" r="8" class="m-ac" fill-opacity=".18"/><text x="37" y="${y + 17}" class="m-xs m-strong" text-anchor="middle">${n[0]}</text>
          <text x="51" y="${y + 12}" class="m-h">${n}</text><text x="51" y="${y + 21.5}" class="m-xs">${s}</text>
          ${live ? `${ping(158, y + 14, 2.2)}` : `<circle cx="158" cy="${y + 14}" r="2.2" class="m-gray-dot"/>`}`;
      }).join("");
      const v = [42, 58, 51, 74, 69, 92, 88], p = pts(v, 20, 100, 188, 100, 176, 72);
      return win("agentwiz · admin console", `
        ${rows}
        ${card(178, 43, 198, 160)}
        <text x="190" y="59" class="m-s">Tasks completed · this week</text>
        <text x="190" y="82" class="m-big">1,284</text>${chip(246, 72, "▲ 18%", 32)}
        <text x="366" y="59" class="m-xs" text-anchor="end">5 agents</text>
        ${[100, 124, 148, 172].map(y => `<line x1="188" y1="${y}" x2="364" y2="${y}" class="m-grid"/>`).join("")}
        <path d="${area(p, 172)}" fill="url(#${u}a)" class="m-fade"/>
        <path d="${smooth(p)}" class="m-line m-draw" pathLength="1"/>
        ${ping(p[6][0], p[6][1], 2.6)}
        ${"MTWTFSS".split("").map((d, i) => `<text x="${X(i, 7, 188, 176)}" y="190" class="m-xs" text-anchor="middle">${d}</text>`).join("")}
        <text x="190" y="199" class="m-xs">Orchestrator routing · 99.2% handled</text>`, grad(u + "a"));
    },

    /* Ballogy Model Lab — leaderboard with win / tie / loss */
    modellab() {
      const rows = [["Model 07", 61, 21], ["Model 23", 55, 24], ["Model 41", 49, 27], ["Model 12", 44, 25], ["Model 58", 38, 29], ["Model 33", 31, 26]];
      const bx = 112, bw = 214;
      const body = rows.map(([n, w, t], i) => {
        const y = 66 + i * 21, l = 100 - w - t, g = 1.5;
        const ww = (w / 100) * bw, tw = (t / 100) * bw, lw = (l / 100) * bw;
        return `<text x="24" y="${y + 8}" class="m-h">${i === 0 ? "★ " : ""}${n}</text>
          <rect x="${bx}" y="${y}" width="${ww - g}" height="10" rx="3" class="m-ac m-growx" style="--d:${i * 0.08}s"/>
          <rect x="${bx + ww}" y="${y}" width="${tw - g}" height="10" rx="2" class="m-mid m-growx" style="--d:${i * 0.08 + 0.15}s"/>
          <rect x="${bx + ww + tw}" y="${y}" width="${lw}" height="10" rx="3" class="m-ac m-growx" fill-opacity=".28" style="--d:${i * 0.08 + 0.3}s"/>
          <text x="374" y="${y + 8}" class="m-h m-mono" text-anchor="end">${w}%</text>`;
      }).join("");
      return win("modellab · leaderboard", `
        <text x="24" y="52" class="m-s">Win rate vs production AI · 3 blind judges</text>
        <rect x="246" y="45" width="7" height="7" rx="2" class="m-ac"/><text x="256" y="51.5" class="m-xs">Win</text>
        <rect x="278" y="45" width="7" height="7" rx="2" class="m-mid"/><text x="288" y="51.5" class="m-xs">Tie</text>
        <rect x="308" y="45" width="7" height="7" rx="2" class="m-ac" fill-opacity=".28"/><text x="318" y="51.5" class="m-xs">Loss</text>
        <text x="374" y="51.5" class="m-xs" text-anchor="end">Win</text>
        <line x1="22" y1="59" x2="378" y2="59" class="m-sep"/>
        ${body}
        <line x1="22" y1="194" x2="378" y2="194" class="m-sep"/>
        <text x="24" y="205" class="m-xs">82 models · 1,240 prompts · answers anonymised &amp; shuffled</text>
        ${chip(318, 197, "export ↗", 56)}`);
    },

    /* Camp HQ — player radar + recommended drills */
    camphq(u) {
      const cx = 101, cy = 135, R = 45, axes = ["Shooting", "Handling", "Defense", "Speed", "IQ"];
      const ang = k => (-90 + k * 72) * Math.PI / 180;
      const poly = vals => vals.map((v, k) => `${(cx + Math.cos(ang(k)) * R * v).toFixed(1)},${(cy + Math.sin(ang(k)) * R * v).toFixed(1)}`).join(" ");
      const cur = [0.8, 0.64, 0.42, 0.72, 0.6], tgt = [0.86, 0.78, 0.74, 0.8, 0.76];
      const drills = [["Closeout defense", "Biggest gap · defense", 0.35, "12 min"], ["Weak-hand finishing", "Handling · left side", 0.6, "10 min"], ["Catch & shoot reps", "Keep shooting sharp", 0.8, "8 min"]];
      return win("camp hq · player profile", `
        ${card(22, 43, 158, 160)}
        <circle cx="38" cy="58" r="8" class="m-ac" fill-opacity=".2"/><text x="38" y="61" class="m-xs m-strong" text-anchor="middle">23</text>
        <text x="51" y="56" class="m-h">Player #23</text><text x="51" y="65" class="m-xs">Guard · U16 camp</text>
        ${[0.33, 0.66, 1].map(s => `<polygon points="${poly([s, s, s, s, s])}" class="m-gridpoly"/>`).join("")}
        ${axes.map((a, k) => `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(ang(k)) * R).toFixed(1)}" y2="${(cy + Math.sin(ang(k)) * R).toFixed(1)}" class="m-grid"/>
          <text x="${(cx + Math.cos(ang(k)) * (R + 11)).toFixed(1)}" y="${(cy + Math.sin(ang(k)) * (R + 11) + 2.5).toFixed(1)}" class="m-xs" text-anchor="middle">${a}</text>`).join("")}
        <polygon points="${poly(tgt)}" class="m-target"/>
        <polygon points="${poly(cur)}" class="m-ac m-pop" fill-opacity=".28" stroke="currentColor" stroke-width="1.6"/>
        ${cur.map((v, k) => `<circle cx="${(cx + Math.cos(ang(k)) * R * v).toFixed(1)}" cy="${(cy + Math.sin(ang(k)) * R * v).toFixed(1)}" r="2.4" class="m-ac m-pop"/>`).join("")}
        <rect x="34" y="193" width="8" height="5" rx="1" class="m-ac" fill-opacity=".5"/><text x="45" y="198" class="m-xs">Current</text>
        <line x1="84" y1="195.5" x2="94" y2="195.5" class="m-target"/><text x="97" y="198" class="m-xs">Target</text>
        <text x="192" y="54" class="m-h">Recommended drills</text>${chip(318, 45, "✦ AI coach", 58)}
        ${drills.map(([t, s, pr, m], i) => {
          const y = 62 + i * 47;
          return `${card(190, y, 186, 41)}
            <text x="200" y="${y + 14}" class="m-h">${t}</text><text x="200" y="${y + 24}" class="m-xs">${s}</text>
            <text x="366" y="${y + 14}" class="m-xs m-mono" text-anchor="end">${m}</text>
            <rect x="200" y="${y + 30}" width="166" height="4" rx="2" class="m-gray"/>
            <rect x="200" y="${y + 30}" width="${166 * pr}" height="4" rx="2" class="m-ac m-growx" style="--d:${0.2 + i * 0.15}s"/>`;
        }).join("")}`);
    },

    /* Magisch Maastricht — bundle card + dynamic pricing */
    trichter(u) {
      const days = Array.from({ length: 31 }, (_, d) => {
        const dow = (d + 0) % 7, weekend = dow === 5 || dow === 6 ? 1.6 : 0, xmas = d >= 20 && d <= 26 ? 1.1 : 0;
        return 5.6 + weekend + xmas + Math.sin(d * 1.7) * 0.25;
      });
      const p = pts(days, 4.5, 9.5, 200, 76, 166, 92);
      const step = p.map((q, i) => (i ? `H${q[0].toFixed(1)} V${q[1].toFixed(1)}` : `M${q[0].toFixed(1)},${q[1].toFixed(1)}`)).join(" ");
      const wheel = Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return `<line x1="70" y1="78" x2="${(70 + Math.cos(a) * 22).toFixed(1)}" y2="${(78 + Math.sin(a) * 22).toFixed(1)}"/><circle cx="${(70 + Math.cos(a) * 22).toFixed(1)}" cy="${(78 + Math.sin(a) * 22).toFixed(1)}" r="2.6" fill="currentColor"/>`; }).join("");
      return win("shop.trichter.nl", `
        ${card(22, 43, 156, 160)}
        <rect x="28" y="49" width="144" height="62" rx="6" fill="url(#${u}b)"/>
        <g stroke="currentColor" stroke-width="1" opacity=".85" class="m-spin" style="transform-origin:70px 78px">${wheel}<circle cx="70" cy="78" r="22" fill="none"/></g>
        <path d="M58 104 L70 78 L82 104" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".85"/>
        ${[[118, 60], [140, 74], [156, 56], [128, 92], [150, 98]].map(([x, y], i) => `<text x="${x}" y="${y}" class="m-snow" style="--d:${i * 0.6}s">❄</text>`).join("")}
        ${chip(122, 53, "AI bundle", 44)}
        <text x="30" y="124" class="m-h">Winter Magic Bundle</text>
        <text x="30" y="134" class="m-xs">Ice rink · Ferris wheel · 2× Glühwein</text>
        <text x="30" y="157" class="m-big">€20</text><text x="76" y="157" class="m-s m-strike">€25</text>${chip(98, 149, "−20%", 28)}
        <rect x="30" y="167" width="140" height="22" rx="11" class="m-ac"/><text x="100" y="181" class="m-btn" text-anchor="middle">Add to cart</text>
        <text x="30" y="198" class="m-xs">✦ Often added: skate gloves €4</text>
        ${card(188, 43, 188, 160)}
        <text x="198" y="57" class="m-s">Dynamic price · Ice rink</text>
        <text x="366" y="57" class="m-h m-mono" text-anchor="end">€7.40 ${"↑"}</text>
        ${[4.5, 7, 9.5].map(v => `<line x1="200" y1="${Y(v, 4.5, 9.5, 76, 92)}" x2="366" y2="${Y(v, 4.5, 9.5, 76, 92)}" class="m-grid"/><text x="198" y="${Y(v, 4.5, 9.5, 76, 92) - 2}" class="m-xs" text-anchor="end">€${v}</text>`).join("")}
        <rect x="${p[20][0]}" y="70" width="${p[26][0] - p[20][0]}" height="98" class="m-ac" fill-opacity=".07"/>
        <text x="${(p[20][0] + p[26][0]) / 2}" y="74" class="m-xs" text-anchor="middle">Christmas</text>
        <path d="${step}" class="m-line m-draw" pathLength="1" stroke-width="1.6"/>
        ${ping(p[17][0], p[17][1])}
        <text x="200" y="180" class="m-xs">1 Dec</text><text x="283" y="180" class="m-xs" text-anchor="middle">15 Dec</text><text x="366" y="180" class="m-xs" text-anchor="end">31 Dec</text>
        <text x="198" y="196" class="m-xs">Weekend &amp; holiday demand raises price · capacity-aware</text>`,
        `<linearGradient id="${u}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".35"/><stop offset="1" stop-color="currentColor" stop-opacity=".06"/></linearGradient>`);
    },

    /* Insight Hub — KPI tiles, trend, donut */
    insight(u) {
      const kpis = [["Active players", "12.4k", "▲ 8%"], ["Sessions", "48.1k", "▲ 12%"], ["30-day retention", "71%", "▲ 3 pt"]];
      const cur = [32, 35, 34, 39, 42, 41, 46, 50, 49, 55, 58, 62], prev = [28, 29, 31, 30, 33, 34, 33, 36, 38, 37, 40, 42];
      const pc = pts(cur, 20, 70, 34, 116, 216, 66), pp = pts(prev, 20, 70, 34, 116, 216, 66);
      const seg = [[0.54, "iOS"], [0.31, "Android"], [0.15, "Web"]], C = 2 * Math.PI * 24;
      let off = 0;
      const donut = seg.map(([f], i) => { const s = `<circle cx="322" cy="140" r="24" fill="none" stroke="currentColor" stroke-opacity="${[1, 0.55, 0.25][i]}" stroke-width="9" stroke-dasharray="${(f * C - 2).toFixed(1)} ${C}" stroke-dashoffset="${(-off * C).toFixed(1)}" transform="rotate(-90 322 140)" class="m-pop"/>`; off += f; return s; }).join("");
      return win("insight hub · executive", `
        ${kpis.map(([l, v, d], i) => { const x = 22 + i * 120; return `${card(x, 43, 114, 46)}<text x="${x + 10}" y="57" class="m-xs">${l}</text><text x="${x + 10}" y="79" class="m-big" style="font-size:17px">${v}</text>${chip(x + 72, 69, d, 34)}`; }).join("")}
        ${card(22, 95, 238, 108)}
        <text x="32" y="109" class="m-s">Weekly active players</text>
        <line x1="170" y1="106" x2="180" y2="106" class="m-line" stroke-width="1.6"/><text x="183" y="108.5" class="m-xs">2025</text>
        <line x1="210" y1="106" x2="220" y2="106" class="m-prev"/><text x="223" y="108.5" class="m-xs">2024</text>
        ${[116, 138, 160, 182].map(y => `<line x1="34" y1="${y}" x2="250" y2="${y}" class="m-grid"/>`).join("")}
        <path d="${area(pc, 182)}" fill="url(#${u}a)" class="m-fade"/>
        <path d="${smooth(pp)}" class="m-prev"/>
        <path d="${smooth(pc)}" class="m-line m-draw" pathLength="1"/>
        ${ping(pc[11][0], pc[11][1])}
        ${["Jan", "Apr", "Jul", "Oct", "Dec"].map((m, i) => `<text x="${34 + i * 54}" y="196" class="m-xs" text-anchor="middle">${m}</text>`).join("")}
        ${card(266, 95, 110, 108)}
        <text x="276" y="109" class="m-s">Platform</text>
        <circle cx="322" cy="140" r="24" fill="none" class="m-gray-stroke" stroke-width="9"/>${donut}
        <text x="322" y="143" class="m-h" text-anchor="middle">48k</text>
        ${seg.map(([f, n], i) => `<rect x="${276 + i * 34}" y="178" width="6" height="6" rx="1.5" class="m-ac" fill-opacity="${[1, 0.55, 0.25][i]}"/><text x="${284 + i * 34}" y="183.5" class="m-xs">${n}</text><text x="${276 + i * 34}" y="195" class="m-xs m-strong">${Math.round(f * 100)}%</text>`).join("")}`, grad(u + "a", 0.3));
    },

    /* Postgres → Pinecone sync */
    pinecone() {
      const node = (x, title, sub, icon) => `${card(x, 47, 104, 84)}${icon}<text x="${x + 52}" y="112" class="m-h" text-anchor="middle">${title}</text><text x="${x + 52}" y="122" class="m-xs" text-anchor="middle">${sub}</text>`;
      const pg = `<g class="m-acs" stroke-width="1.3"><ellipse cx="74" cy="66" rx="16" ry="5"/><path d="M58 66v20c0 2.8 7.2 5 16 5s16-2.2 16-5V66"/><path d="M58 76c0 2.8 7.2 5 16 5s16-2.2 16-5" opacity=".5"/></g>`;
      const gear = `<g class="m-spin" style="transform-origin:200px 76px"><circle cx="200" cy="76" r="13" class="m-acs" stroke-width="5" stroke-dasharray="4 3.2"/><circle cx="200" cy="76" r="7" class="m-acs" stroke-width="1.3"/></g>`;
      const vec = Array.from({ length: 15 }, (_, i) => `<rect x="${304 + (i % 5) * 10}" y="${60 + Math.floor(i / 5) * 10}" width="7" height="7" rx="2" class="m-ac m-blink" fill-opacity="${0.25 + ((i * 7) % 5) * 0.15}" style="--d:${(i % 5) * 0.25}s"/>`).join("");
      const batches = [12, 18, 9, 22, 30, 14, 8, 26, 34, 19, 11, 24, 40, 28, 16, 21, 35, 12, 9, 27, 31, 18, 44, 23, 15, 29, 20, 38];
      const route = (x1, x2) => `<line x1="${x1}" y1="89" x2="${x2}" y2="89" class="m-grid" stroke-dasharray="3 3"/>${[0, 0.5].map(b => `<circle r="2.6" class="m-ac"><animateMotion dur="1.4s" begin="${b * 1.4}s" repeatCount="indefinite" path="M${x1},89 L${x2},89"/></circle>`).join("")}`;
      return win("sync-worker · logs", `
        ${node(22, "PostgreSQL", "128,402 rows", pg)}
        ${node(148, "Sync worker", "snapshot · diff · dedupe", gear)}
        ${node(274, "Pinecone", "index: coach-v2", vec)}
        ${route(126, 148)}${route(252, 274)}
        ${card(22, 138, 354, 65)}
        ${[["Upserts", "1,936"], ["Dupes skipped", "312"], ["Deletes", "18"], ["Last sync", "2 min ago"]].map(([l, v], i) => `<text x="${32 + i * 62}" y="152" class="m-xs">${l}</text><text x="${32 + i * 62}" y="164" class="m-h m-mono">${v}</text>`).join("")}
        <text x="366" y="152" class="m-xs" text-anchor="end">Batches · 24h</text>
        ${batches.map((b, i) => `<rect x="${32 + i * 12.2}" y="${196 - b * 0.55}" width="8.5" height="${b * 0.55}" rx="2" class="m-ac m-grow" fill-opacity="${i === batches.length - 1 ? 1 : 0.45}" style="--d:${i * 0.02}s"/>`).join("")}
        ${ping(358, 162)}`);
    },

    /* Yinn.ca — carbon calculator */
    yinn(u) {
      const fields = [["Vehicle", "Petrol car · 12,000 km/yr"], ["Flights", "2 short-haul"], ["Home energy", "Gas heating · 3 bed"], ["Diet", "Mixed"]];
      const parts = [["Transport", 1.9], ["Flights", 0.9], ["Home", 0.6], ["Food", 0.4]];
      const r = 46, cx = 286, cy = 112, frac = 3.8 / 8, L = Math.PI * r;
      return win("yinn.ca · carbon calculator", `
        ${card(22, 43, 160, 160)}
        <text x="32" y="58" class="m-h">Your inputs</text>
        ${fields.map(([l, v], i) => { const y = 66 + i * 28; return `<text x="32" y="${y + 6}" class="m-xs">${l}</text><rect x="32" y="${y + 9}" width="140" height="14" rx="4" class="m-field"/><text x="38" y="${y + 18.5}" class="m-s">${v}</text>`; }).join("")}
        ${card(190, 43, 186, 160)}
        <path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}" class="m-gray-stroke" fill="none" stroke-width="10" stroke-linecap="round"/>
        <path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" class="m-gauge" style="--len:${L.toFixed(1)};--val:${(L * (1 - frac)).toFixed(1)}" stroke-dasharray="${L.toFixed(1)}"/>
        <text x="${cx}" y="${cy - 8}" class="m-big" text-anchor="middle">3.8 t</text>
        <text x="${cx}" y="${cy + 3}" class="m-xs" text-anchor="middle">CO₂e per year</text>
        <text x="${cx - r}" y="${cy + 12}" class="m-xs" text-anchor="middle">0</text><text x="${cx + r}" y="${cy + 12}" class="m-xs" text-anchor="middle">8 t</text>
        ${parts.map(([n, v], i) => { const y = 136 + i * 16; return `<text x="200" y="${y + 6}" class="m-xs">${n}</text><rect x="244" y="${y}" width="100" height="7" rx="3" class="m-gray"/><rect x="244" y="${y}" width="${v / 2 * 100}" height="7" rx="3" class="m-ac m-growx" style="--d:${0.3 + i * 0.1}s"/><text x="366" y="${y + 6}" class="m-xs m-mono m-strong" text-anchor="end">${v}</text>`; }).join("")}
        ${chip(200, 49, "XGBoost", 40)}`);
    },

    /* FinHealer — forecast with confidence band */
    finhealer(u) {
      const actual = [52, 55, 53, 58, 61, 57, 63, 66, 62, 68, 71, 69, 74, 72, 77, 80, 76, 82];
      const fc = [82, 84, 86, 85, 89, 91, 90, 94];
      const n = actual.length + fc.length - 1, x0 = 44, w = 322, y0 = 66, h = 108, min = 40, max = 110;
      const pa = actual.map((v, i) => [X(i, n, x0, w), Y(v, min, max, y0, h)]);
      const pf = fc.map((v, i) => [X(i + actual.length - 1, n, x0, w), Y(v, min, max, y0, h)]);
      const up = fc.map((v, i) => [pf[i][0], Y(v + i * 2.2, min, max, y0, h)]), lo = fc.map((v, i) => [pf[i][0], Y(v - i * 2.2, min, max, y0, h)]);
      const band = `${smooth(up)} L${lo[lo.length - 1][0]},${lo[lo.length - 1][1]} ${smooth(lo.slice().reverse()).replace(/^M/, "L")} Z`;
      const tx = pa[pa.length - 1][0];
      return win("finhealer · cash-flow forecast", `
        <text x="24" y="52" class="m-h">Net cash flow</text><text x="24" y="61" class="m-xs">Ensemble · LSTM + Prophet + XGBoost + LightGBM</text>
        ${chip(318, 44, "acc 96.7%", 56)}
        ${[50, 75, 100].map(v => `<line x1="${x0}" y1="${Y(v, min, max, y0, h)}" x2="${x0 + w}" y2="${Y(v, min, max, y0, h)}" class="m-grid"/><text x="${x0 - 4}" y="${Y(v, min, max, y0, h) + 2.5}" class="m-xs" text-anchor="end">$${v}k</text>`).join("")}
        <path d="${band}" class="m-ac m-fade" fill-opacity=".14"/>
        <path d="${area(pa, y0 + h)}" fill="url(#${u}a)" class="m-fade"/>
        <path d="${smooth(pa)}" class="m-line m-draw" pathLength="1"/>
        <path d="${smooth(pf)}" class="m-line m-dash"/>
        <line x1="${tx}" y1="${y0 - 2}" x2="${tx}" y2="${y0 + h}" class="m-today"/>
        <text x="${tx}" y="${y0 - 4}" class="m-xs m-strong" text-anchor="middle">today</text>
        ${ping(tx, pa[pa.length - 1][1], 2.6)}
        ${["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((m, i) => `<text x="${x0 + i * (w / 5)}" y="186" class="m-xs" text-anchor="middle">${m}</text>`).join("")}
        <line x1="24" y1="200" x2="34" y2="200" class="m-line" stroke-width="1.6"/><text x="37" y="202.5" class="m-xs">Actual</text>
        <line x1="72" y1="200" x2="82" y2="200" class="m-line m-dash"/><text x="85" y="202.5" class="m-xs">Forecast</text>
        <rect x="128" y="197" width="10" height="6" rx="1.5" class="m-ac" fill-opacity=".2"/><text x="141" y="202.5" class="m-xs">95% interval</text>`, grad(u + "a", 0.25));
    },

    /* Travel cost — map route + fare + predicted vs actual */
    travel(u) {
      const route = "M48,176 C70,150 84,150 98,128 S120,92 150,92 S190,70 212,58";
      const scatter = Array.from({ length: 22 }, (_, i) => { const a = 0.08 + (i / 22) * 0.84, e = Math.sin(i * 2.3) * 0.08; return [258 + a * 106, 194 - (a + e) * 66]; });
      return win("trip quote · fare estimate", `
        <clipPath id="${u}c"><rect x="22" y="43" width="210" height="160" rx="8"/></clipPath>
        <rect x="22" y="43" width="210" height="160" rx="8" class="m-map"/>
        <g clip-path="url(#${u}c)">
          <path d="M150 43 C140 90 180 120 160 203" class="m-river"/>
          <ellipse cx="78" cy="78" rx="30" ry="18" class="m-park"/>
          ${[60, 90, 120, 150, 180].map(y => `<line x1="22" y1="${y}" x2="232" y2="${y - 18}" class="m-road"/>`).join("")}
          ${[50, 95, 140, 185, 220].map(x => `<line x1="${x}" y1="43" x2="${x + 14}" y2="203" class="m-road"/>`).join("")}
          <path d="${route}" class="m-route-bg"/>
          <path d="${route}" class="m-line m-draw" pathLength="1" stroke-width="2.6"/>
          <circle r="3.4" class="m-car"><animateMotion dur="4s" repeatCount="indefinite" path="${route}"/></circle>
        </g>
        <circle cx="48" cy="176" r="5" class="m-ac"/><circle cx="48" cy="176" r="2" class="m-pin-in"/>
        <path d="M212 58 c-6 -8 -9 -11 -9 -15 a9 9 0 0 1 18 0 c0 4 -3 7 -9 15z" class="m-ac"/><circle cx="212" cy="43" r="3" class="m-pin-in"/>
        <rect x="56" y="180" width="40" height="13" rx="6.5" class="m-label"/><text x="76" y="189" class="m-xs m-strong" text-anchor="middle">Pickup</text>
        <rect x="160" y="62" width="46" height="13" rx="6.5" class="m-label"/><text x="183" y="71" class="m-xs m-strong" text-anchor="middle">Drop-off</text>
        ${card(240, 43, 136, 160)}
        <text x="250" y="57" class="m-s">Trip estimate · Sedan</text>
        <text x="250" y="80" class="m-big">$42.80</text>
        <text x="250" y="91" class="m-xs">18.6 km · 34 min · ± $2.10</text>
        <line x1="250" y1="100" x2="366" y2="100" class="m-sep"/>
        <text x="250" y="112" class="m-xs">Predicted vs actual</text><text x="366" y="112" class="m-xs m-strong" text-anchor="end">R² 0.87</text>
        <line x1="258" y1="194" x2="364" y2="126" class="m-grid" stroke-dasharray="3 3"/>
        ${scatter.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" class="m-ac m-pop" fill-opacity=".75" style="--d:${i * 0.03}s"/>`).join("")}`);
    },

    /* RAG — grounded chat with citations */
    rag() {
      return win("docs assistant · llama 3.2", `
        ${["EN", "UR", "AR"].map((l, i) => `<rect x="${300 + i * 26}" y="42" width="24" height="13" rx="6.5" class="${i ? "m-gray" : "m-ac"}"/><text x="${312 + i * 26}" y="51" class="m-xs ${i ? "" : "m-on-ac"} m-strong" text-anchor="middle">${l}</text>`).join("")}
        <text x="24" y="52" class="m-xs">Grounded in 1,820 internal documents</text>
        <rect x="178" y="62" width="198" height="22" rx="11" class="m-ac" fill-opacity=".2"/>
        <text x="190" y="76" class="m-s m-strong">What's the refund window for EU orders?</text>
        <circle cx="32" cy="100" r="8" class="m-ac"/><text x="32" y="103" class="m-xs m-on-ac m-strong" text-anchor="middle">AI</text>
        <rect x="46" y="92" width="250" height="62" rx="10" class="m-card"/>
        <text x="56" y="106" class="m-s m-tx">EU customers can request a refund within <tspan class="m-strong">14 days</tspan></text>
        <text x="56" y="117" class="m-s m-tx">of delivery <tspan class="m-cite">[1]</tspan>. Return shipping is free for</text>
        <text x="56" y="128" class="m-s m-tx">defective items <tspan class="m-cite">[2]</tspan>.</text>
        <rect x="56" y="135" width="96" height="12" rx="4" class="m-gray"/><text x="61" y="143.5" class="m-xs">[1] policy_eu.pdf · p.3</text>
        <rect x="156" y="135" width="62" height="12" rx="4" class="m-gray"/><text x="161" y="143.5" class="m-xs">[2] faq.md · §4</text>
        <text x="302" y="150" class="m-xs">4 chunks · 0.21s</text>
        <rect x="46" y="161" width="44" height="16" rx="8" class="m-card"/>
        ${[0, 1, 2].map(i => `<circle cx="${58 + i * 10}" cy="169" r="2.4" class="m-ac m-typing" style="--d:${i * 0.18}s"/>`).join("")}
        <rect x="22" y="183" width="354" height="22" rx="11" class="m-field"/>
        <text x="34" y="197" class="m-xs">Ask anything about your documents…</text>
        <circle cx="364" cy="194" r="8" class="m-ac"/><path d="M360.5 194h7M365 190.8l3 3.2-3 3.2" fill="none" class="m-on-ac-stroke" stroke-width="1.4" stroke-linecap="round"/>`);
    },
  };

  window.MOCKUPS = {
    render(p) {
      const fn = M[p.id];
      if (!fn) return "";
      const u = "mk" + uid++ + "-";
      return `<svg class="mock" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${p.title} interface preview">${fn(u)}</svg>`;
    },
  };
})();
