// ══════════════════════════════════════════════════════════════════════
// REEMPLAZA la función downloadReport completa en App.jsx con esto
// ══════════════════════════════════════════════════════════════════════

const downloadReport = () => {
  const ahora = new Date();
  const fechaLarga = ahora.toLocaleDateString("es-CO", { year:"numeric", month:"long", day:"numeric" });
  const horaCorta = ahora.toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" });
  const fechaArchivo = ahora.toISOString().slice(0,10);

  // ── 1. Parsear puntajes por sesión ─────────────────────────────────
  const MAX_PTS = [10,15,20,20,20,15];
  const SES_LABELS = ["Contexto y Clasificación","Marco ISO 31000 / NTC 5254",
    "Identificación de Riesgos","Análisis y Evaluación",
    "Pérdidas Máximas y Matrices","Tratamiento del Riesgo"];
  const sesScores = Array(6).fill(null);

  messages.forEach(m => {
    if (m.role !== "assistant") return;
    // Patrón: | Sesión X | Y | Z | W/100 |
    const re = /\|\s*[Ss](?:esi[oó]n\s*)?(\d)\s*(?:de\s*6)?\s*\|\s*(\d+)\s*\/?\d*\s*\|\s*\d+\s*\|\s*(\d+)/g;
    let m2;
    while ((m2 = re.exec(m.content)) !== null) {
      const idx = parseInt(m2[1]) - 1;
      const pts = parseInt(m2[2]);
      if (idx >= 0 && idx < 6 && pts >= 0 && pts <= MAX_PTS[idx]) sesScores[idx] = pts;
    }
    // Patrón alternativo: S1 | 10 | 10 | 10/100
    const re2 = /\|\s*S(\d)\s*\|\s*(\d+)\s*\|\s*\d+\s*\|\s*\d+/g;
    while ((m2 = re2.exec(m.content)) !== null) {
      const idx = parseInt(m2[1]) - 1;
      const pts = parseInt(m2[2]);
      if (idx >= 0 && idx < 6 && pts >= 0 && pts <= MAX_PTS[idx] && sesScores[idx] === null) sesScores[idx] = pts;
    }
  });

  const totalObtenido = score > 0 ? score : sesScores.reduce((a,b) => a + (b||0), 0);
  const totalPosible = sesScores.reduce((a,b,i) => a + (b !== null ? MAX_PTS[i] : 0), 0) || Math.min(session * 15, 100);
  const pct = Math.round((totalObtenido / 100) * 100);
  const nota = totalObtenido>=90?"5.0":totalObtenido>=80?"4.5":totalObtenido>=70?"4.0":totalObtenido>=60?"3.5":"3.0";
  const nivel = totalObtenido>=90?"Sobresaliente":totalObtenido>=80?"Excelente":totalObtenido>=70?"Bueno":totalObtenido>=60?"Aceptable":"En desarrollo";
  const colorNota = totalObtenido>=80?"#10b981":totalObtenido>=60?"#f59e0b":"#ef4444";

  // ── 2. Markdown → HTML limpio ──────────────────────────────────────
  const md2html = (txt) => {
    if (!txt) return "";
    txt = txt.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    // Tablas markdown
    txt = txt.replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g, (_,hdr,rows)=>{
      const ths = hdr.split("|").filter(Boolean).map(h=>`<th>${h.trim()}</th>`).join("");
      const trs = rows.trim().split("\n").map(r=>{
        const tds = r.split("|").filter(Boolean).map(d=>`<td>${d.trim()}</td>`).join("");
        return `<tr>${tds}</tr>`;
      }).join("");
      return `<table class="rt"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    });
    txt = txt.replace(/^### (.+)$/gm,"<h4>$1</h4>");
    txt = txt.replace(/^## (.+)$/gm,"<h3>$1</h3>");
    txt = txt.replace(/^# (.+)$/gm,"<h2>$1</h2>");
    txt = txt.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
    txt = txt.replace(/\*([^*\n]+)\*/g,"<em>$1</em>");
    txt = txt.replace(/^[-•] (.+)$/gm,"<li>$1</li>");
    txt = txt.replace(/(<li>[\s\S]*?<\/li>)\n?(?=<li>|$)/g,"$1");
    txt = txt.replace(/(<li>.*<\/li>)+/g,m=>`<ul>${m}</ul>`);
    txt = txt.replace(/\n{2,}/g,"</p><p>");
    txt = txt.replace(/\n/g,"<br>");
    return `<p>${txt}</p>`;
  };

  // ── 3. Agrupar mensajes por sesión ─────────────────────────────────
  const sesGroups = Array.from({length:6}, ()=>[]);
  let curSes = 0;
  messages.forEach(m => {
    const sm = m.content.match(/SESI[OÓ]N\s*(\d)/i);
    if (sm) curSes = Math.min(parseInt(sm[1]), 6);
    if (curSes > 0) sesGroups[curSes-1].push(m);
  });

  // ── 4. Generar barras de sesión ─────────────────────────────────────
  const sesBarras = sesScores.map((s,i) => {
    const pts = s !== null ? s : 0;
    const w = Math.round((pts / MAX_PTS[i]) * 100);
    const c = pts/MAX_PTS[i] >= 0.8 ? "#10b981" : pts/MAX_PTS[i] >= 0.6 ? "#f59e0b" : pts > 0 ? "#ef4444" : "#e2e8f0";
    return `
    <div class="ses-row">
      <div class="ses-num">S${i+1}</div>
      <div class="ses-name">${SES_LABELS[i]}</div>
      <div class="ses-bar-wrap"><div class="ses-bar" style="width:${w}%;background:${c}"></div></div>
      <div class="ses-pts">${s!==null?pts+"/"+MAX_PTS[i]:"—"}</div>
    </div>`;
  }).join("");

  // ── 5. Generar transcripción por sesión ────────────────────────────
  const transcripcion = sesGroups.map((msgs,i) => {
    if (msgs.length === 0) return "";
    const contenido = msgs.map(m => {
      const esIA = m.role === "assistant";
      return `<div class="msg ${esIA?"msg-ia":"msg-est"}">
        <div class="msg-role">${esIA?"🎓 Tutor Académico":"👤 "+student.nombre}</div>
        <div class="msg-body">${md2html(m.content)}</div>
      </div>`;
    }).join("");
    return `
    <details class="ses-detail">
      <summary><span class="ses-badge">S${i+1}</span> ${SES_LABELS[i]}
        ${sesScores[i]!==null?`<span class="ses-pts-badge">${sesScores[i]}/${MAX_PTS[i]} pts</span>`:""}
      </summary>
      <div class="ses-msgs">${contenido}</div>
    </details>`;
  }).join("");

  // ── 6. HTML COMPLETO ───────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reporte Académico — ${student.nombre}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"><\/script>
<style>
:root{
  --navy:#0f2d5e;--blue:#1d4ed8;--blue-light:#3b82f6;--teal:#0891b2;
  --green:#10b981;--amber:#f59e0b;--red:#ef4444;
  --gray-50:#f8fafc;--gray-100:#f1f5f9;--gray-200:#e2e8f0;
  --gray-400:#94a3b8;--gray-600:#475569;--gray-800:#1e293b;--gray-900:#0f172a;
  --font:"Segoe UI",system-ui,sans-serif;
  --shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.08);
  --shadow-md:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06);
  --r:10px;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--gray-100);color:var(--gray-800);font-size:14px;line-height:1.6}
a{color:var(--blue-light)}

/* ── NAV ── */
nav{position:sticky;top:0;z-index:100;background:var(--navy);display:flex;gap:2px;padding:0 16px;
  box-shadow:var(--shadow-md);overflow-x:auto}
nav a{color:rgba(255,255,255,.75);text-decoration:none;padding:12px 14px;font-size:12px;font-weight:600;
  white-space:nowrap;border-bottom:3px solid transparent;transition:all .2s}
nav a:hover,nav a.active{color:#fff;border-color:var(--blue-light)}

/* ── MAIN ── */
main{max-width:960px;margin:0 auto;padding:24px 16px}

/* ── PORTADA ── */
.cover{background:linear-gradient(135deg,var(--navy) 0%,#1e3a8a 60%,var(--blue) 100%);
  border-radius:var(--r);padding:40px 32px;color:#fff;margin-bottom:24px;
  display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden}
.cover::after{content:"";position:absolute;right:-40px;top:-40px;width:220px;height:220px;
  background:rgba(255,255,255,.04);border-radius:50%}
.cover-badge{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;
  color:rgba(255,255,255,.6);font-weight:600}
.cover h1{font-size:22px;font-weight:700;line-height:1.3}
.cover-sub{font-size:13px;color:rgba(255,255,255,.75)}
.cover-meta{display:flex;flex-wrap:wrap;gap:16px;margin-top:8px;
  font-size:12px;color:rgba(255,255,255,.65)}
.cover-meta span{display:flex;align-items:center;gap:6px}
.nota-grande{position:absolute;right:32px;top:50%;transform:translateY(-50%);text-align:center}
.nota-grande .nota-num{font-size:52px;font-weight:800;color:#fff;line-height:1}
.nota-grande .nota-label{font-size:11px;color:rgba(255,255,255,.6);letter-spacing:1px;text-transform:uppercase}

/* ── CARDS ── */
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.card{background:#fff;border-radius:var(--r);padding:20px;box-shadow:var(--shadow);
  display:flex;flex-direction:column;gap:4px}
.card-label{font-size:11px;color:var(--gray-400);font-weight:600;text-transform:uppercase;letter-spacing:.8px}
.card-val{font-size:28px;font-weight:800;color:var(--navy)}
.card-sub{font-size:12px;color:var(--gray-600)}
.card-icon{font-size:24px;margin-bottom:4px}

/* ── SECCIÓN ── */
.section{background:#fff;border-radius:var(--r);padding:24px;box-shadow:var(--shadow);margin-bottom:20px}
.section h2{font-size:16px;font-weight:700;color:var(--navy);margin-bottom:16px;
  padding-bottom:10px;border-bottom:2px solid var(--gray-100);
  display:flex;align-items:center;gap:8px}
.section h2::before{content:attr(data-icon);font-size:18px}

/* ── BARRAS SESIÓN ── */
.ses-row{display:grid;grid-template-columns:32px 1fr auto auto;align-items:center;
  gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)}
.ses-row:last-child{border-bottom:none}
.ses-num{font-size:11px;font-weight:700;color:var(--gray-400);text-align:center}
.ses-name{font-size:12px;color:var(--gray-800);font-weight:500}
.ses-bar-wrap{width:120px;height:8px;background:var(--gray-200);border-radius:4px;overflow:hidden}
.ses-bar{height:100%;border-radius:4px;transition:width .6s ease}
.ses-pts{font-size:12px;font-weight:700;color:var(--gray-600);min-width:50px;text-align:right}

/* ── CHART ── */
.chart-wrap{position:relative;height:220px;margin-top:16px}

/* ── TRANSCRIPCIÓN ── */
.ses-detail{border:1px solid var(--gray-200);border-radius:8px;margin-bottom:8px;overflow:hidden}
.ses-detail summary{cursor:pointer;padding:12px 16px;background:var(--gray-50);
  font-size:13px;font-weight:600;color:var(--navy);display:flex;align-items:center;gap:10px;
  list-style:none;user-select:none}
.ses-detail summary::-webkit-details-marker{display:none}
.ses-detail[open] summary{background:var(--gray-100);border-bottom:1px solid var(--gray-200)}
.ses-badge{background:var(--blue);color:#fff;border-radius:4px;
  padding:2px 7px;font-size:11px;font-weight:700;flex-shrink:0}
.ses-pts-badge{margin-left:auto;background:var(--green);color:#fff;
  border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600}
.ses-msgs{padding:16px;display:flex;flex-direction:column;gap:12px}
.msg{border-radius:8px;padding:12px 14px;font-size:13px;line-height:1.65}
.msg-ia{background:var(--gray-50);border-left:4px solid var(--blue-light)}
.msg-est{background:#eff6ff;border-left:4px solid var(--navy)}
.msg-role{font-size:11px;font-weight:700;color:var(--gray-400);
  text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px}
.msg-body p{margin-bottom:8px}
.msg-body p:last-child{margin-bottom:0}
.msg-body ul{margin:6px 0;padding-left:18px}
.msg-body li{margin:3px 0}
.msg-body strong{color:var(--navy)}
.msg-body h3,.msg-body h4{color:var(--navy);margin:8px 0 4px;font-size:14px}

/* ── TABLAS ── */
.rt{border-collapse:collapse;width:100%;margin:10px 0;font-size:12px}
.rt th{background:var(--navy);color:#fff;padding:7px 12px;text-align:left}
.rt td{padding:6px 12px;border:1px solid var(--gray-200)}
.rt tr:nth-child(even) td{background:var(--gray-50)}

/* ── NIVEL BADGE ── */
.nivel-badge{display:inline-block;padding:4px 12px;border-radius:20px;
  font-size:12px;font-weight:700;background:${colorNota};color:#fff}

/* ── PRINT ── */
@media print{
  nav{display:none}
  body{background:#fff}
  .cover{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .ses-detail{break-inside:avoid}
  .ses-detail[open]{display:block}
  main{padding:0}
  .section{box-shadow:none;border:1px solid var(--gray-200)}
  .card{box-shadow:none;border:1px solid var(--gray-200)}
}
@media(max-width:640px){
  .ses-bar-wrap{width:70px}
  .nota-grande{display:none}
  .cover{padding:24px}
  .cards{grid-template-columns:repeat(2,1fr)}
}
</style>
</head>
<body>
<nav>
  <a href="#portada">🏛️ Portada</a>
  <a href="#dashboard">📊 Dashboard</a>
  <a href="#sesiones">📋 Sesiones</a>
  <a href="#competencias">🎯 Competencias</a>
  <a href="#transcripcion">📝 Transcripción</a>
  <a href="#" onclick="window.print();return false">🖨️ Imprimir</a>
</nav>

<main>

<!-- PORTADA -->
<div class="cover" id="portada">
  <div class="cover-badge">Politécnico Grancolombiano · Facultad de Negocios, Gestión y Competitividad</div>
  <h1>Reporte de Desempeño Académico<br>Administración de Riesgos · ECA52411</h1>
  <div class="cover-sub">Especialización en Gerencia de Riesgos y Seguros · Caso: UMD S.A.S.</div>
  <div class="cover-meta">
    <span>👤 ${student.nombre}</span>
    <span>📅 ${fechaLarga} · ${horaCorta}</span>
    <span>📊 Sesión ${session} de 6 completada</span>
    <span>🔖 ISO 31000 · NTC 5254</span>
  </div>
  <div class="nota-grande">
    <div class="nota-num" style="color:${colorNota}">${totalObtenido}</div>
    <div class="nota-label">/ 100 pts</div>
    <div class="nota-label" style="margin-top:4px">${pct}%</div>
  </div>
</div>

<!-- CARDS DE INDICADORES -->
<div class="cards" id="dashboard">
  <div class="card">
    <div class="card-icon">🏆</div>
    <div class="card-label">Puntaje Final</div>
    <div class="card-val" style="color:${colorNota}">${totalObtenido}/100</div>
    <div class="card-sub">${pct}% de logro</div>
  </div>
  <div class="card">
    <div class="card-icon">⭐</div>
    <div class="card-label">Calificación</div>
    <div class="card-val" style="color:${colorNota}">${nota}</div>
    <div class="card-sub"><span class="nivel-badge">${nivel}</span></div>
  </div>
  <div class="card">
    <div class="card-icon">📚</div>
    <div class="card-label">Sesiones</div>
    <div class="card-val">${session}/6</div>
    <div class="card-sub">completadas</div>
  </div>
  <div class="card">
    <div class="card-icon">💬</div>
    <div class="card-label">Interacciones</div>
    <div class="card-val">${messages.filter(m=>m.role==="user").length}</div>
    <div class="card-sub">respuestas enviadas</div>
  </div>
</div>

<!-- RESULTADOS POR SESIÓN -->
<div class="section" id="sesiones">
  <h2 data-icon="📊">Resultados por Sesión</h2>
  ${sesBarras}
  <div class="chart-wrap">
    <canvas id="sesChart"></canvas>
  </div>
</div>

<!-- COMPETENCIAS -->
<div class="section" id="competencias">
  <h2 data-icon="🎯">Evaluación de Competencias</h2>
  <table class="rt">
    <thead><tr><th>Competencia</th><th>Sesión</th><th>Marco</th><th>Estado</th></tr></thead>
    <tbody>
      <tr><td>Análisis de contexto organizacional</td><td>S1</td><td>ISO 31000 §5.1</td><td>${sesScores[0]!==null?"✅ Evaluada":"⏳ Pendiente"}</td></tr>
      <tr><td>Aplicación normativa ISO 31000 / NTC 5254</td><td>S2</td><td>NTC 5254</td><td>${sesScores[1]!==null?"✅ Evaluada":"⏳ Pendiente"}</td></tr>
      <tr><td>Identificación y anatomía del riesgo</td><td>S3</td><td>ISO 31000 §6.2</td><td>${sesScores[2]!==null?"✅ Evaluada":"⏳ Pendiente"}</td></tr>
      <tr><td>Análisis probabilístico P×I</td><td>S4</td><td>ISO 31010</td><td>${sesScores[3]!==null?"✅ Evaluada":"⏳ Pendiente"}</td></tr>
      <tr><td>PMP, PML y matrices de riesgo</td><td>S5</td><td>Rejda & McNamara</td><td>${sesScores[4]!==null?"✅ Evaluada":"⏳ Pendiente"}</td></tr>
      <tr><td>Tratamiento y transferencia del riesgo</td><td>S6</td><td>ISO 31000 §6.6</td><td>${sesScores[5]!==null?"✅ Evaluada":"⏳ Pendiente"}</td></tr>
    </tbody>
  </table>
</div>

<!-- TRANSCRIPCIÓN -->
<div class="section" id="transcripcion">
  <h2 data-icon="📝">Transcripción por Sesión</h2>
  <p style="font-size:12px;color:#94a3b8;margin-bottom:16px">
    Haz clic en cada sesión para expandir la conversación completa.
  </p>
  ${transcripcion || "<p style='color:#94a3b8'>Sin conversación registrada.</p>"}
</div>

<!-- PIE -->
<div style="text-align:center;padding:24px;font-size:11px;color:#94a3b8">
  Reporte generado el ${fechaLarga} — Simulador Académico de Administración de Riesgos<br>
  Politécnico Grancolombiano · ECA52411 · ISO 31000 · NTC 5254
</div>

</main>

<script>
// Gráfico de barras por sesión
const ctx = document.getElementById("sesChart");
if (ctx && typeof Chart !== "undefined") {
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ${JSON.stringify(["S1","S2","S3","S4","S5","S6"])},
      datasets: [
        {
          label: "Obtenido",
          data: ${JSON.stringify(sesScores.map((s,i)=>s!==null?s:0))},
          backgroundColor: ${JSON.stringify(sesScores.map((s,i)=>{
            if (s===null) return "#e2e8f0";
            return s/MAX_PTS[i]>=0.8?"#10b981":s/MAX_PTS[i]>=0.6?"#f59e0b":"#ef4444";
          }))},
          borderRadius: 6,
        },
        {
          label: "Máximo",
          data: ${JSON.stringify(MAX_PTS)},
          backgroundColor: "rgba(15,45,94,0.08)",
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ctx.dataset.label + ": " + ctx.parsed.y + " pts"
          }
        }
      },
      scales: {
        y: { beginAtZero: true, max: 20, ticks: { font: { size: 11 } } },
        x: { ticks: { font: { size: 11 } } }
      }
    }
  });
}

// Nav activo al scroll
const secs = document.querySelectorAll("main [id]");
const navLinks = document.querySelectorAll("nav a[href^='#']");
window.addEventListener("scroll", () => {
  let cur = "";
  secs.forEach(s => { if (window.scrollY >= s.offsetTop - 80) cur = s.id; });
  navLinks.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#"+cur);
  });
});
<\/script>
</body>
</html>`;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  a.download = `Reporte_Academico_${student.nombre.replace(/ /g,"_")}_${fechaArchivo}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};
