import { useState, useRef, useEffect } from "react";

const SESSIONS = [
  { num: 1, nucleo: "NT1", label: "Contexto y Clasificación", icon: "🏢", color: "#3b82f6", preguntas: 3, desc: "Objetivo misional, proceso clave, clasificación de riesgos" },
  { num: 2, nucleo: "NT1", label: "Marco de Administración", icon: "📋", color: "#8b5cf6", preguntas: 3, desc: "ISO 31000, NTC 5254, proceso de gestión" },
  { num: 3, nucleo: "NT2", label: "Identificación de Riesgos", icon: "🔍", color: "#f59e0b", preguntas: 4, desc: "Inventario valorado en COP, anatomía del riesgo" },
  { num: 4, nucleo: "NT2-3", label: "Análisis y Evaluación", icon: "📊", color: "#ef4444", preguntas: 3, desc: "Escalas P×I, calificación de riesgos, PMP" },
  { num: 5, nucleo: "NT3", label: "Pérdidas Máximas y Matrices", icon: "💰", color: "#f97316", preguntas: 3, desc: "PML, mapa de calor, relación PMP/PML" },
  { num: 6, nucleo: "NT4", label: "Tratamiento del Riesgo", icon: "🛡️", color: "#10b981", preguntas: 3, desc: "Evitar, reducir, transferir, retener, riesgo residual" },
];

const RESOURCES = {
  1: [
    { tipo: "📖 Libro", titulo: "Administración de Riesgos – Un Enfoque Empresarial", autor: "Mejía Quijano, R. C. (2013)", editorial: "Fondo Editorial Universidad EAFIT", tema: "Cap. 1-2: Clasificación y contexto del riesgo empresarial", url: "https://login.loginbiblio.poligran.edu.co" },
    { tipo: "📖 Libro", titulo: "Gestión Integral de Riesgos y Seguros", autor: "Mejía Delgado, H. (2011)", editorial: "ECOE Ediciones", tema: "Fundamentos de la administración de riesgos", url: "https://login.loginbiblio.poligran.edu.co" },
    { tipo: "📄 Artículo", titulo: "La gestión de riesgo: el ausente recurrente", autor: "Soler, Varela, Oñate y Naranjo (2018)", editorial: "Revista Ciencia UNEMI, 11(26)", tema: "Contexto organizacional y clasificación", url: "https://doi.org/10.29076/issn.2528-7737vol11iss26.2018pp51-62p" },
  ],
  2: [
    { tipo: "📐 Norma", titulo: "NTC-ISO 31000 – Gestión del Riesgo: Directrices", autor: "ICONTEC", editorial: "Norma Técnica Colombiana", tema: "Principios, marco y proceso de gestión del riesgo", url: "https://www.icontec.org" },
    { tipo: "📐 Norma", titulo: "NTC 5254 – Gestión del Riesgo", autor: "ICONTEC", editorial: "Norma Técnica Colombiana", tema: "Adaptación colombiana del estándar", url: "https://www.icontec.org" },
    { tipo: "📖 Libro", titulo: "Diagnostic des risques", autor: "Gaultier y Louisot (2018)", editorial: "Panamericana Editorial Ltda.", tema: "Marco conceptual para el diagnóstico de riesgos", url: "https://login.loginbiblio.poligran.edu.co" },
  ],
  3: [
    { tipo: "📖 Libro", titulo: "Gestión Integral de Riesgos", autor: "Bravo y Sánchez, O. M. (2012)", editorial: "Bravo & Sánchez, EU – Bogotá", tema: "Metodología para describir e identificar riesgos", url: "https://login.loginbiblio.poligran.edu.co" },
    { tipo: "📖 Libro", titulo: "La Revolución de los Riesgos", autor: "Guzmán, H. (2021)", editorial: "Editorial Communitas Colombia", tema: "Cap. 3: Identificación y anatomía del riesgo", url: "https://login.loginbiblio.poligran.edu.co" },
    { tipo: "🌐 Diccionario", titulo: "Diccionario MAPFRE de Seguros", autor: "Fundación MAPFRE (2016)", editorial: "fundacionmapfre.org", tema: "Terminología técnica de riesgos y seguros", url: "https://www.fundacionmapfre.org/seguros/diccionario-mapfre-seguros/" },
  ],
  4: [
    { tipo: "📐 Norma", titulo: "ISO 31010 – Evaluación del Riesgo", autor: "ISO", editorial: "International Organization for Standardization", tema: "Técnicas y métodos de evaluación", url: "https://www.iso.org/standard/72140.html" },
    { tipo: "📖 Libro", titulo: "Administración de Riesgos – Un Enfoque Empresarial", autor: "Mejía Quijano, R. C. (2013)", editorial: "Fondo Editorial Universidad EAFIT", tema: "Cap. 4: Evaluación cuantitativa y matrices", url: "https://login.loginbiblio.poligran.edu.co" },
  ],
  5: [
    { tipo: "📖 Libro", titulo: "Principles of Risk Management and Insurance", autor: "Rejda & McNamara (2017)", editorial: "Essex", tema: "PMP, PML, deducibles y matrices de riesgo", url: "https://login.loginbiblio.poligran.edu.co" },
    { tipo: "📖 Libro", titulo: "La Revolución de los Riesgos", autor: "Guzmán, H. (2021)", editorial: "Editorial Communitas Colombia", tema: "Pérdidas máximas y mapas de calor", url: "https://login.loginbiblio.poligran.edu.co" },
  ],
  6: [
    { tipo: "📖 Libro", titulo: "Gestión Integral de Riesgos y Seguros", autor: "Mejía Delgado, H. (2011)", editorial: "ECOE Ediciones", tema: "Tratamiento: transferencia, pólizas y deducibles", url: "https://login.loginbiblio.poligran.edu.co" },
    { tipo: "📖 Libro", titulo: "Principles of Risk Management and Insurance", autor: "Rejda & McNamara (2017)", editorial: "Essex", tema: "Transferencia financiera y riesgo residual", url: "https://login.loginbiblio.poligran.edu.co" },
  ],
};

const SYSTEM_PROMPT = `Eres un Simulador Académico Interactivo para el módulo "ADMINISTRACIÓN DE RIESGOS" del Politécnico Grancolombiano, Especialización en Gerencia de Riesgos y Seguros (ECA52411), nivel Posgrado.

CASO BASE FIJO: UMD S.A.S. es una empresa colombiana de servicios de mantenimiento industrial especializado (inspección, reparación de maquinaria pesada e ingeniería predictiva), con sede en Bogotá, 85 empleados, ingresos anuales de COP $4.800 millones y contratos con ANS (Acuerdos de Nivel de Servicio) con penalizaciones por incumplimiento. NO cambies esta descripción bajo ninguna circunstancia.

ESTRUCTURA: 6 sesiones de 4 horas alineadas al syllabus oficial.
PREGUNTAS POR SESIÓN (máximo indicado):
- Sesión 1 (máx. 3): objetivo misional → proceso clave → clasificación de riesgos por categoría
- Sesión 2 (máx. 3): principios ISO 31000 → estructura NTC 5254 → proceso completo de gestión
- Sesión 3 (máx. 4): inventario 3 recursos en COP → riesgo 1 (anatomía) → riesgo 2 → riesgo 3
- Sesión 4 (máx. 3): escalas P×I 1-5 → calificación de los 3 riesgos → PMP del riesgo prioritario
- Sesión 5 (máx. 3): PML escenario catastrófico → mapa de calor → relación PMP/PML
- Sesión 6 (máx. 3): tratamiento por riesgo → riesgo residual con cálculo → plan de acción

REGLAS INQUEBRANTABLES:
1. FILTRO ARL: Si el estudiante introduce riesgos laborales (accidentes, EPP), RECHAZA con 0 puntos.
2. CUANTIFICACIÓN: Exige siempre cifras en COP.
3. ANATOMÍA: Todo riesgo = [Evento] + [Causa] + [Consecuencia financiera en COP].
4. AVANCE: No pases a la siguiente sesión hasta que el estudiante resuelva correctamente la actual.
5. RESPUESTAS PARCIALES: Si el estudiante da una respuesta parcialmente correcta, identifica EXACTAMENTE qué elemento faltó y pide SOLO ese elemento.
6. RECURSOS: Cuando el estudiante necesite ayuda, dile que haga clic en el botón 📚 "Recursos S{N}". Cita autor y capítulo real. NUNCA inventes videos, lecturas numeradas ni templates ficticios.
7. TABLAS: Cuando necesites que el estudiante complete una tabla, hazlo campo por campo. No presentes tablas con celdas en blanco.
8. DETECCIÓN IA: Si detectas patrones de respuesta generada por IA (estructura perfecta, terminología exacta sin voz personal), añade una nota: "💡 Nota pedagógica: Tu respuesta tiene características de texto generado por IA. Te recomendamos reformularla con tus propias palabras y experiencia profesional. Puedes continuar."

PUNTUACIÓN (100 pts): S1:10, S2:15, S3:20, S4:20, S5:20, S6:15.
Al final de cada sesión muestra tabla: | Sesión | Puntos obtenidos | Máximo | Acumulado |

TONO: Tutor de posgrado: profesional, exigente, técnico, constructivo.
FORMATO: Markdown. Indica "SESIÓN X de 6 — Pregunta Y de Z" al inicio de cada pregunta.
INICIO: Saluda al estudiante por su nombre, presenta brevemente el caso UMD S.A.S. e inicia SESIÓN 1.`;

function parseMarkdown(text) {
  text = text.replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g, (_, header, rows) => {
    const ths = header.split("|").filter(Boolean).map(h => `<th>${h.trim()}</th>`).join("");
    const trs = rows.trim().split("\n").map(row => {
      const tds = row.split("|").filter(Boolean).map(d => `<td>${d.trim()}</td>`).join("");
      return `<tr>${tds}</tr>`;
    }).join("");
    return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  });
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  text = text.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  text = text.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  text = text.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  text = text.replace(/^- (.+)$/gm, "<li>$1</li>");
  text = text.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  text = text.replace(/\n\n/g, "<br/><br/>");
  text = text.replace(/\n/g, "<br/>");
  return text;
}

export default function App() {
  const [screen, setScreen] = useState("register");
  const [student, setStudent] = useState({ nombre: "", cedula: "", email: "", movil: "" });
  const [formErrors, setFormErrors] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(1);
  const [score, setScore] = useState(0);
  const [showResources, setShowResources] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const saveSession = async (msgs, sess, sc, std) => {
    const data = JSON.stringify({ messages: msgs, session: sess, score: sc, student: std, lastUpdate: new Date().toISOString() });
    try { localStorage.setItem(`sim_${std.cedula}`, data); } catch (e) {
      try { await window.storage?.set(`sim_${std.cedula}`, data); } catch (e2) {}
    }
    try {
      await fetch("/.netlify/functions/chat", {
        method: "POST",
        body: JSON.stringify({ type: "progress", cedula: std.cedula, session: sess, score: sc }),
      });
    } catch (e) {}
  };

  const loadSession = async (cedula) => {
    try {
      const saved = localStorage.getItem(`sim_${cedula}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    try {
      const saved = await window.storage?.get(`sim_${cedula}`);
      if (saved) return JSON.parse(saved.value);
    } catch (e) {}
    return null;
  };

  const validateForm = () => {
    const errs = {};
    if (!student.nombre.trim() || student.nombre.trim().split(" ").length < 2) errs.nombre = "Ingresa nombre y apellido completos";
    if (!/^\d{6,12}$/.test(student.cedula.trim())) errs.cedula = "Cédula inválida (solo dígitos, 6-12)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email.trim())) errs.email = "Correo electrónico inválido";
    if (!/^[0-9]{10}$/.test(student.movil.trim())) errs.movil = "Móvil inválido (10 dígitos)";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const detectSession = (text) => {
    for (let i = 6; i >= 1; i--) {
      if (new RegExp(`SESI[OÓ]N\\s*${i}`, "i").test(text)) return i;
    }
    return null;
  };

  const detectScore = (text) => {
    const m = text.match(/[Aa]cumulado[^\d]*(\d{1,3})/);
    if (m) return parseInt(m[1]);
    return null;
  };

  const callClaude = async (msgs) => {
    const onNetlify = window.location.hostname.includes("netlify");
    if (onNetlify) {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: msgs }),
      });
      const data = await res.json();
      return data.content?.[0]?.text || "Error al obtener respuesta.";
    } else {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: msgs }),
      });
      const data = await res.json();
      return data.content?.[0]?.text || "Error al obtener respuesta.";
    }
  };

  const checkAndRegister = async () => {
    if (!validateForm()) return;
    try {
      await fetch("/.netlify/functions/chat", {
        method: "POST",
        body: JSON.stringify({ type: "register", ...student }),
      });
    } catch (e) { console.warn("Sheet no disponible"); }
    const saved = await loadSession(student.cedula);
    if (saved && saved.messages?.length > 0) {
      setResumeData(saved);
      setShowResumePrompt(true);
    } else {
      startFresh();
    }
  };

  const startFresh = async () => {
    setShowResumePrompt(false);
    setScreen("sim");
    setLoading(true);
    try {
      const initMsg = `El estudiante ${student.nombre}, cédula ${student.cedula}, inicia la simulación. Salúdalo por su nombre e inicia la SESIÓN 1 — Pregunta 1 de 3.`;
      const reply = await callClaude([{ role: "user", content: initMsg }]);
      const det = detectSession(reply);
      if (det) setSession(det);
      const newMsgs = [{ role: "assistant", content: reply }];
      setMessages(newMsgs);
      await saveSession(newMsgs, det || 1, 0, student);
    } catch { setMessages([{ role: "assistant", content: "❌ Error de conexión." }]); }
    setLoading(false);
  };

  const resumeSession = () => {
    setShowResumePrompt(false);
    setScreen("sim");
    setMessages(resumeData.messages);
    setSession(resumeData.session);
    setScore(resumeData.score);
    setStudent(resumeData.student);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const userMsg = { role: "user", content: trimmed };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const reply = await callClaude(newMsgs.map(m => ({ role: m.role, content: m.content })));
      const det = detectSession(reply);
      if (det) setSession(det);
      const sc = detectScore(reply);
      if (sc !== null) setScore(sc);
      const finalMsgs = [...newMsgs, { role: "assistant", content: reply }];
      setMessages(finalMsgs);
      await saveSession(finalMsgs, det || session, sc !== null ? sc : score, student);
    } catch { setMessages([...newMsgs, { role: "assistant", content: "❌ Error de conexión." }]); }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome."); return; }
    const rec = new SR();
    rec.lang = "es-CO";
    rec.continuous = false;
    rec.interimResults = false;
    setIsListening(true);
    rec.onresult = (e) => { setInput(prev => prev + e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const downloadReport = () => {
    const ahora = new Date();
    const fechaLarga = ahora.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
    const horaCorta = ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    const fechaArchivo = ahora.toISOString().slice(0, 10);
    const MAX_PTS = [10, 15, 20, 20, 20, 15];
    const SES_LABELS = ["Contexto y Clasificación", "Marco ISO 31000 / NTC 5254", "Identificación de Riesgos", "Análisis y Evaluación", "Pérdidas Máximas y Matrices", "Tratamiento del Riesgo"];
    const sesScores = Array(6).fill(null);
    messages.forEach(m => {
      if (m.role !== "assistant") return;
      const re = /\|\s*[Ss](?:esi[oó]n\s*)?(\d)\s*(?:de\s*6)?\s*\|\s*(\d+)\s*\/?\d*\s*\|\s*\d+\s*\|\s*(\d+)/g;
      let m2;
      while ((m2 = re.exec(m.content)) !== null) {
        const idx = parseInt(m2[1]) - 1;
        const pts = parseInt(m2[2]);
        if (idx >= 0 && idx < 6 && pts >= 0 && pts <= MAX_PTS[idx]) sesScores[idx] = pts;
      }
      const re2 = /\|\s*S(\d)\s*\|\s*(\d+)\s*\|\s*\d+\s*\|\s*\d+/g;
      while ((m2 = re2.exec(m.content)) !== null) {
        const idx = parseInt(m2[1]) - 1;
        const pts = parseInt(m2[2]);
        if (idx >= 0 && idx < 6 && pts >= 0 && pts <= MAX_PTS[idx] && sesScores[idx] === null) sesScores[idx] = pts;
      }
    });
    const totalObtenido = score > 0 ? score : sesScores.reduce((a, b) => a + (b || 0), 0);
    const pct = Math.round((totalObtenido / 100) * 100);
    const nota = totalObtenido >= 90 ? "5.0" : totalObtenido >= 80 ? "4.5" : totalObtenido >= 70 ? "4.0" : totalObtenido >= 60 ? "3.5" : "3.0";
    const nivel = totalObtenido >= 90 ? "Sobresaliente" : totalObtenido >= 80 ? "Excelente" : totalObtenido >= 70 ? "Bueno" : totalObtenido >= 60 ? "Aceptable" : "En desarrollo";
    const colorNota = totalObtenido >= 80 ? "#10b981" : totalObtenido >= 60 ? "#f59e0b" : "#ef4444";
    const md2html = (txt) => {
      if (!txt) return "";
      txt = txt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      txt = txt.replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g, (_, hdr, rows) => {
        const ths = hdr.split("|").filter(Boolean).map(h => `<th>${h.trim()}</th>`).join("");
        const trs = rows.trim().split("\n").map(r => { const tds = r.split("|").filter(Boolean).map(d => `<td>${d.trim()}</td>`).join(""); return `<tr>${tds}</tr>`; }).join("");
        return `<table class="rt"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
      });
      txt = txt.replace(/^### (.+)$/gm, "<h4>$1</h4>").replace(/^## (.+)$/gm, "<h3>$1</h3>").replace(/^# (.+)$/gm, "<h2>$1</h2>");
      txt = txt.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
      txt = txt.replace(/^[-•] (.+)$/gm, "<li>$1</li>").replace(/(<li>.*<\/li>)+/g, m => `<ul>${m}</ul>`);
      txt = txt.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>");
      return `<p>${txt}</p>`;
    };
    const sesGroups = Array.from({ length: 6 }, () => []);
    let curSes = 0;
    messages.forEach(m => {
      const sm = m.content.match(/SESI[OÓ]N\s*(\d)/i);
      if (sm) curSes = Math.min(parseInt(sm[1]), 6);
      if (curSes > 0) sesGroups[curSes - 1].push(m);
    });
    const sesBarras = sesScores.map((s, i) => {
      const pts = s !== null ? s : 0;
      const w = Math.round((pts / MAX_PTS[i]) * 100);
      const c = pts / MAX_PTS[i] >= 0.8 ? "#10b981" : pts / MAX_PTS[i] >= 0.6 ? "#f59e0b" : pts > 0 ? "#ef4444" : "#e2e8f0";
      return `<div class="ses-row"><div class="ses-num">S${i + 1}</div><div class="ses-name">${SES_LABELS[i]}</div><div class="ses-bar-wrap"><div class="ses-bar" style="width:${w}%;background:${c}"></div></div><div class="ses-pts">${s !== null ? pts + "/" + MAX_PTS[i] : "—"}</div></div>`;
    }).join("");
    const transcripcion = sesGroups.map((msgs, i) => {
      if (msgs.length === 0) return "";
      const contenido = msgs.map(m => {
        const esIA = m.role === "assistant";
        return `<div class="msg ${esIA ? "msg-ia" : "msg-est"}"><div class="msg-role">${esIA ? "🎓 Tutor Académico" : "👤 " + student.nombre}</div><div class="msg-body">${md2html(m.content)}</div></div>`;
      }).join("");
      return `<details class="ses-detail"><summary><span class="ses-badge">S${i + 1}</span> ${SES_LABELS[i]}${sesScores[i] !== null ? `<span class="ses-pts-badge">${sesScores[i]}/${MAX_PTS[i]} pts</span>` : ""}</summary><div class="ses-msgs">${contenido}</div></details>`;
    }).join("");
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reporte Académico — ${student.nombre}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"><\/script>
<style>
:root{--navy:#0f2d5e;--blue:#1d4ed8;--blue-light:#3b82f6;--green:#10b981;--amber:#f59e0b;--red:#ef4444;--gray-50:#f8fafc;--gray-100:#f1f5f9;--gray-200:#e2e8f0;--gray-400:#94a3b8;--gray-600:#475569;--gray-800:#1e293b;--shadow:0 1px 3px rgba(0,0,0,.12);--r:10px;--font:"Segoe UI",system-ui,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:var(--font);background:var(--gray-100);color:var(--gray-800);font-size:14px;line-height:1.6}
nav{position:sticky;top:0;z-index:100;background:var(--navy);display:flex;gap:2px;padding:0 16px;box-shadow:var(--shadow);overflow-x:auto}
nav a{color:rgba(255,255,255,.75);text-decoration:none;padding:12px 14px;font-size:12px;font-weight:600;white-space:nowrap;border-bottom:3px solid transparent;transition:all .2s}
nav a:hover{color:#fff;border-color:var(--blue-light)}
main{max-width:960px;margin:0 auto;padding:24px 16px}
.cover{background:linear-gradient(135deg,var(--navy) 0%,#1e3a8a 60%,var(--blue) 100%);border-radius:var(--r);padding:40px 32px;color:#fff;margin-bottom:24px;display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden}
.cover::after{content:"";position:absolute;right:-40px;top:-40px;width:220px;height:220px;background:rgba(255,255,255,.04);border-radius:50%}
.cover-badge{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.6);font-weight:600}
.cover h1{font-size:22px;font-weight:700;line-height:1.3}
.cover-sub{font-size:13px;color:rgba(255,255,255,.75)}
.cover-meta{display:flex;flex-wrap:wrap;gap:16px;margin-top:8px;font-size:12px;color:rgba(255,255,255,.65)}
.nota-grande{position:absolute;right:32px;top:50%;transform:translateY(-50%);text-align:center}
.nota-grande .nota-num{font-size:52px;font-weight:800;line-height:1}
.nota-grande .nota-label{font-size:11px;color:rgba(255,255,255,.6);letter-spacing:1px;text-transform:uppercase}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.card{background:#fff;border-radius:var(--r);padding:20px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:4px}
.card-label{font-size:11px;color:var(--gray-400);font-weight:600;text-transform:uppercase;letter-spacing:.8px}
.card-val{font-size:28px;font-weight:800;color:var(--navy)}
.card-sub{font-size:12px;color:var(--gray-600)}
.card-icon{font-size:24px;margin-bottom:4px}
.section{background:#fff;border-radius:var(--r);padding:24px;box-shadow:var(--shadow);margin-bottom:20px}
.section h2{font-size:16px;font-weight:700;color:var(--navy);margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid var(--gray-100);display:flex;align-items:center;gap:8px}
.section h2::before{content:attr(data-icon);font-size:18px}
.ses-row{display:grid;grid-template-columns:32px 1fr auto auto;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)}
.ses-row:last-child{border-bottom:none}
.ses-num{font-size:11px;font-weight:700;color:var(--gray-400);text-align:center}
.ses-name{font-size:12px;color:var(--gray-800);font-weight:500}
.ses-bar-wrap{width:120px;height:8px;background:var(--gray-200);border-radius:4px;overflow:hidden}
.ses-bar{height:100%;border-radius:4px}
.ses-pts{font-size:12px;font-weight:700;color:var(--gray-600);min-width:50px;text-align:right}
.chart-wrap{position:relative;height:220px;margin-top:16px}
.ses-detail{border:1px solid var(--gray-200);border-radius:8px;margin-bottom:8px;overflow:hidden}
.ses-detail summary{cursor:pointer;padding:12px 16px;background:var(--gray-50);font-size:13px;font-weight:600;color:var(--navy);display:flex;align-items:center;gap:10px;list-style:none;user-select:none}
.ses-detail summary::-webkit-details-marker{display:none}
.ses-detail[open] summary{background:var(--gray-100);border-bottom:1px solid var(--gray-200)}
.ses-badge{background:var(--blue);color:#fff;border-radius:4px;padding:2px 7px;font-size:11px;font-weight:700;flex-shrink:0}
.ses-pts-badge{margin-left:auto;background:var(--green);color:#fff;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600}
.ses-msgs{padding:16px;display:flex;flex-direction:column;gap:12px}
.msg{border-radius:8px;padding:12px 14px;font-size:13px;line-height:1.65}
.msg-ia{background:var(--gray-50);border-left:4px solid var(--blue-light)}
.msg-est{background:#eff6ff;border-left:4px solid var(--navy)}
.msg-role{font-size:11px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px}
.msg-body p{margin-bottom:8px}.msg-body p:last-child{margin-bottom:0}
.msg-body ul{margin:6px 0;padding-left:18px}.msg-body li{margin:3px 0}
.msg-body strong{color:var(--navy)}.msg-body h3,.msg-body h4{color:var(--navy);margin:8px 0 4px;font-size:14px}
.rt{border-collapse:collapse;width:100%;margin:10px 0;font-size:12px}
.rt th{background:var(--navy);color:#fff;padding:7px 12px;text-align:left}
.rt td{padding:6px 12px;border:1px solid var(--gray-200)}
.rt tr:nth-child(even) td{background:var(--gray-50)}
.nivel-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:${colorNota};color:#fff}
@media print{nav{display:none}body{background:#fff}.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact}.ses-detail{break-inside:avoid}main{padding:0}.section,.card{box-shadow:none;border:1px solid var(--gray-200)}}
@media(max-width:640px){.ses-bar-wrap{width:70px}.nota-grande{display:none}.cover{padding:24px}.cards{grid-template-columns:repeat(2,1fr)}}
</style></head><body>
<nav><a href="#portada">🏛️ Portada</a><a href="#dashboard">📊 Dashboard</a><a href="#sesiones">📋 Sesiones</a><a href="#competencias">🎯 Competencias</a><a href="#transcripcion">📝 Transcripción</a><a href="#" onclick="window.print();return false">🖨️ Imprimir</a></nav>
<main>
<div class="cover" id="portada">
  <div class="cover-badge">Politécnico Grancolombiano · Facultad de Negocios, Gestión y Competitividad</div>
  <h1>Reporte de Desempeño Académico<br>Administración de Riesgos · ECA52411</h1>
  <div class="cover-sub">Especialización en Gerencia de Riesgos y Seguros · Caso: UMD S.A.S.</div>
  <div class="cover-meta"><span>👤 ${student.nombre}</span><span>📅 ${fechaLarga} · ${horaCorta}</span><span>📊 Sesión ${session} de 6</span><span>🔖 ISO 31000 · NTC 5254</span></div>
  <div class="nota-grande"><div class="nota-num" style="color:${colorNota}">${totalObtenido}</div><div class="nota-label">/ 100 pts</div><div class="nota-label" style="margin-top:4px">${pct}%</div></div>
</div>
<div class="cards" id="dashboard">
  <div class="card"><div class="card-icon">🏆</div><div class="card-label">Puntaje Final</div><div class="card-val" style="color:${colorNota}">${totalObtenido}/100</div><div class="card-sub">${pct}% de logro</div></div>
  <div class="card"><div class="card-icon">⭐</div><div class="card-label">Calificación</div><div class="card-val" style="color:${colorNota}">${nota}</div><div class="card-sub"><span class="nivel-badge">${nivel}</span></div></div>
  <div class="card"><div class="card-icon">📚</div><div class="card-label">Sesiones</div><div class="card-val">${session}/6</div><div class="card-sub">completadas</div></div>
  <div class="card"><div class="card-icon">💬</div><div class="card-label">Respuestas</div><div class="card-val">${messages.filter(m => m.role === "user").length}</div><div class="card-sub">enviadas</div></div>
</div>
<div class="section" id="sesiones"><h2 data-icon="📊">Resultados por Sesión</h2>${sesBarras}<div class="chart-wrap"><canvas id="sesChart"></canvas></div></div>
<div class="section" id="competencias"><h2 data-icon="🎯">Evaluación de Competencias</h2>
<table class="rt"><thead><tr><th>Competencia</th><th>Sesión</th><th>Marco</th><th>Estado</th></tr></thead><tbody>
<tr><td>Análisis de contexto organizacional</td><td>S1</td><td>ISO 31000 §5.1</td><td>${sesScores[0] !== null ? "✅ Evaluada" : "⏳ Pendiente"}</td></tr>
<tr><td>Aplicación normativa ISO 31000 / NTC 5254</td><td>S2</td><td>NTC 5254</td><td>${sesScores[1] !== null ? "✅ Evaluada" : "⏳ Pendiente"}</td></tr>
<tr><td>Identificación y anatomía del riesgo</td><td>S3</td><td>ISO 31000 §6.2</td><td>${sesScores[2] !== null ? "✅ Evaluada" : "⏳ Pendiente"}</td></tr>
<tr><td>Análisis probabilístico P×I</td><td>S4</td><td>ISO 31010</td><td>${sesScores[3] !== null ? "✅ Evaluada" : "⏳ Pendiente"}</td></tr>
<tr><td>PMP, PML y matrices de riesgo</td><td>S5</td><td>Rejda & McNamara</td><td>${sesScores[4] !== null ? "✅ Evaluada" : "⏳ Pendiente"}</td></tr>
<tr><td>Tratamiento y transferencia del riesgo</td><td>S6</td><td>ISO 31000 §6.6</td><td>${sesScores[5] !== null ? "✅ Evaluada" : "⏳ Pendiente"}</td></tr>
</tbody></table></div>
<div class="section" id="transcripcion"><h2 data-icon="📝">Transcripción por Sesión</h2>
<p style="font-size:12px;color:#94a3b8;margin-bottom:16px">Haz clic en cada sesión para expandir la conversación completa.</p>
${transcripcion || "<p style='color:#94a3b8'>Sin conversación registrada.</p>"}
</div>
<div style="text-align:center;padding:24px;font-size:11px;color:#94a3b8">Reporte generado el ${fechaLarga} — Simulador Académico de Administración de Riesgos<br>Politécnico Grancolombiano · ECA52411 · ISO 31000 · NTC 5254</div>
</main>
<script>
const ctx = document.getElementById("sesChart");
if (ctx && typeof Chart !== "undefined") {
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["S1","S2","S3","S4","S5","S6"],
      datasets: [
        { label: "Obtenido", data: ${JSON.stringify(sesScores.map((s, i) => s !== null ? s : 0))}, backgroundColor: ${JSON.stringify(sesScores.map((s, i) => { if (s === null) return "#e2e8f0"; return s / MAX_PTS[i] >= 0.8 ? "#10b981" : s / MAX_PTS[i] >= 0.6 ? "#f59e0b" : "#ef4444"; }))}, borderRadius: 6 },
        { label: "Máximo", data: ${JSON.stringify(MAX_PTS)}, backgroundColor: "rgba(15,45,94,0.08)", borderRadius: 6 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top", labels: { font: { size: 11 } } } }, scales: { y: { beginAtZero: true, max: 20, ticks: { font: { size: 11 } } }, x: { ticks: { font: { size: 11 } } } } }
  });
}
<\/script></body></html>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    a.download = `Reporte_Academico_${student.nombre.replace(/ /g, "_")}_${fechaArchivo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const currentSession = session > 0 ? SESSIONS[session - 1] : null;
  const resources = RESOURCES[session] || [];

  // ── REGISTRO ─────────────────────────────────────────────────
  if (screen === "register" || showResumePrompt) {
    const field = (key, label, placeholder, type = "text") => (
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 5, fontWeight: 600 }}>{label}</label>
        <input type={type} placeholder={placeholder} value={student[key]}
          onChange={e => setStudent(s => ({ ...s, [key]: e.target.value }))}
          style={{ width: "100%", background: "#0f172a", border: `1px solid ${formErrors[key] ? "#ef4444" : "#334155"}`, borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        {formErrors[key] && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>⚠ {formErrors[key]}</div>}
      </div>
    );
    return (
      <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 32, width: "100%", maxWidth: 440 }}>
          {showResumePrompt ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>🔄</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>¡Bienvenido de nuevo!</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>Tienes una simulación guardada en la Sesión <strong style={{ color: "#fbbf24" }}>{resumeData?.session}</strong> con <strong style={{ color: "#fbbf24" }}>{resumeData?.score}</strong> puntos.</div>
              </div>
              <button onClick={resumeSession} style={{ width: "100%", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>▶️ Continuar (Sesión {resumeData?.session})</button>
              <button onClick={startFresh} style={{ width: "100%", background: "#334155", color: "#94a3b8", border: "1px solid #475569", borderRadius: 10, padding: "11px", fontSize: 14, cursor: "pointer" }}>🔁 Empezar desde cero</button>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>📚</div>
                <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginBottom: 4 }}>POLITÉCNICO GRANCOLOMBIANO · POSGRADO</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Administración de Riesgos</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Simulador Académico · ECA52411</div>
              </div>
              <div style={{ background: "#0f172a", borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 12, lineHeight: 1.7 }}>
                <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: 8 }}>📌 ¿Cómo usar el simulador?</div>
                <div style={{ color: "#94a3b8" }}>
                  <div>🎓 El tutor te guía por <strong style={{ color: "#60a5fa" }}>6 sesiones</strong> — máximo 3-4 preguntas cada una.</div>
                  <div style={{ marginTop: 4 }}>💾 Tu progreso se <strong style={{ color: "#60a5fa" }}>guarda automáticamente</strong> — retoma con tu cédula.</div>
                  <div style={{ marginTop: 4 }}>📚 Si tienes dudas, usa el botón <strong style={{ color: "#60a5fa" }}>"Recursos S1...S6"</strong> o consulta: <a href="https://login.loginbiblio.poligran.edu.co" target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>loginbiblio.poligran.edu.co</a></div>
                  <div style={{ marginTop: 4 }}>🎤 Puedes <strong style={{ color: "#60a5fa" }}>dictar tu respuesta</strong> con el micrófono.</div>
                  <div style={{ marginTop: 4 }}>📄 Al finalizar descarga tu <strong style={{ color: "#60a5fa" }}>reporte académico completo</strong>.</div>
                </div>
              </div>
              {field("nombre", "Nombre y Apellido Completos *", "Ej: Alejandro García Ruiz")}
              {field("cedula", "Número de Cédula *", "Ej: 1020345678")}
              {field("email", "Correo Electrónico *", "Ej: estudiante@poligran.edu.co", "email")}
              {field("movil", "Número de Móvil *", "Ej: 3001234567", "tel")}
              <button onClick={checkAndRegister} style={{ width: "100%", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 6 }}>🚀 Iniciar Simulación</button>
              <div style={{ fontSize: 11, color: "#475569", textAlign: "center", marginTop: 10 }}>🔒 Datos usados exclusivamente con fines académicos</div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── SIMULADOR ─────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", color: "#e2e8f0" }}>
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)", padding: "10px 16px", borderBottom: "1px solid #1e3a5f" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: "#64748b" }}>🎓 Politécnico Grancolombiano · ECA52411</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>Simulador · Administración de Riesgos</div>
            <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 2 }}>👤 {student.nombre} · CC {student.cedula}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setShowResources(!showResources)} style={{ background: showResources ? "#1e3a5f" : "#1e293b", border: `1px solid ${showResources ? "#3b82f6" : "#334155"}`, borderRadius: 8, padding: "6px 12px", color: showResources ? "#60a5fa" : "#94a3b8", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>📚 Recursos S{session}</button>
            {messages.length > 2 && (<button onClick={downloadReport} style={{ background: "#065f46", border: "1px solid #10b981", borderRadius: 8, padding: "6px 12px", color: "#6ee7b7", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>📄 Reporte</button>)}
            <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "5px 12px", fontSize: 13 }}>📊 <strong style={{ color: "#fbbf24" }}>{score}</strong><span style={{ color: "#64748b" }}>/100</span></div>
          </div>
        </div>
      </div>

      {showResources && (
        <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "12px 16px" }}>
          <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700, marginBottom: 10 }}>📚 Recursos — Sesión {session}: {currentSession?.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {resources.map((r, i) => (
              <div key={i} style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px", border: "1px solid #334155", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ fontSize: 18, flexShrink: 0 }}>{r.tipo.split(" ")[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{r.titulo}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.autor} · {r.editorial}</div>
                  <div style={{ fontSize: 11, color: "#fbbf24", marginTop: 3 }}>📌 {r.tema}</div>
                </div>
                <a href={r.url} target="_blank" rel="noreferrer" style={{ background: "#1e3a5f", color: "#60a5fa", border: "1px solid #3b82f640", borderRadius: 6, padding: "4px 8px", fontSize: 11, textDecoration: "none", flexShrink: 0 }}>Ir →</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: "#1e293b", padding: "8px 16px", borderBottom: "1px solid #0f172a", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center", minWidth: 480 }}>
          {SESSIONS.map((s, i) => {
            const done = session > s.num, active = session === s.num;
            return (
              <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                <div title={`${s.label} — ${s.preguntas} preguntas`} style={{ flex: 1 }}>
                  <div style={{ background: done ? s.color : active ? s.color + "33" : "#1e293b", border: `1.5px solid ${done || active ? s.color : "#334155"}`, borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
                    <div style={{ fontSize: 13 }}>{done ? "✓" : s.icon}</div>
                    <div style={{ fontSize: 9, color: done ? "#fff" : active ? s.color : "#475569", fontWeight: 600 }}>S{s.num}</div>
                    <div style={{ fontSize: 8, color: done ? "#cbd5e1" : "#334155" }}>{s.preguntas}P</div>
                  </div>
                </div>
                {i < 5 && <div style={{ width: 8, height: 2, background: done ? SESSIONS[i + 1].color : "#334155", flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
        {currentSession && (<div style={{ marginTop: 5, fontSize: 11, color: currentSession.color }}><strong>Sesión {currentSession.num} de 6:</strong> {currentSession.label} · <span style={{ color: "#64748b" }}>{currentSession.preguntas} preguntas · {currentSession.desc}</span></div>)}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 900, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: m.role === "user" ? "#1d4ed8" : "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{m.role === "user" ? "👤" : "🎓"}</div>
            <div style={{ background: m.role === "user" ? "#1e3a5f" : "#1e293b", border: m.role === "user" ? "1px solid #3b82f640" : "1px solid #334155", borderRadius: m.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", padding: "11px 15px", maxWidth: "83%", fontSize: 13.5, lineHeight: 1.65, color: "#e2e8f0" }}>
              <div dangerouslySetInnerHTML={{ __html: parseMarkdown(m.content) }} />
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎓</div>
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "4px 14px 14px 14px", padding: "12px 16px", display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />)}
              <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>Evaluando respuesta...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ background: "#1e293b", borderTop: "1px solid #334155", padding: "10px 16px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", maxWidth: 900, margin: "0 auto" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} disabled={loading}
            placeholder="Escribe o dicta tu respuesta... (Enter = enviar | Shift+Enter = nueva línea)" rows={2}
            style={{ flex: 1, background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontSize: 13.5, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 }} />
          <button onClick={startVoice} disabled={loading} title="Dictar respuesta"
            style={{ background: isListening ? "#7c3aed" : "#1e293b", border: `1px solid ${isListening ? "#7c3aed" : "#334155"}`, borderRadius: 10, padding: "10px 12px", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>
            {isListening ? "🔴" : "🎤"}
          </button>
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{ background: loading || !input.trim() ? "#334155" : "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: loading || !input.trim() ? "#64748b" : "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 20, cursor: loading || !input.trim() ? "not-allowed" : "pointer", flexShrink: 0 }}>➤</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#334155", marginTop: 6 }}>
          ¿Atascado? → <button onClick={() => setShowResources(true)} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>ver recursos bibliográficos de esta sesión</button>
        </div>
      </div>

      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
        table{border-collapse:collapse;width:100%;margin:10px 0}
        th{background:#1e3a5f;color:#93c5fd;padding:7px 11px;text-align:left;font-size:12px;border:1px solid #334155}
        td{padding:6px 11px;border:1px solid #334155;font-size:12px}
        tr:nth-child(even) td{background:#0f172a33}
        h2{color:#60a5fa;margin:8px 0 4px;font-size:15px}
        h3{color:#93c5fd;margin:6px 0 4px;font-size:13px}
        ul{margin:5px 0;padding-left:16px}li{margin:3px 0;font-size:13px}
        strong{color:#fbbf24}em{color:#a5b4fc}
      `}</style>
    </div>
  );
}
