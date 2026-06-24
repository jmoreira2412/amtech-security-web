// ============================================================
//  Programa de Comisiones (página privada) — AM TECH Security
//  Misma puerta de acceso que el panel: login de Google + lista
//  blanca de correos. La sesión de Firebase se comparte en todo
//  el dominio, así que iniciar sesión en /admin también desbloquea aquí.
// ============================================================

import { app, CONFIG_LISTA, ADMIN_EMAILS, HD_DOMINIO } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const ES_LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);
// Solo para previsualizar el diseño en local: comisiones.html?preview=1
const BYPASS = ES_LOCAL && new URLSearchParams(location.search).has("preview");

const $ = (id) => document.getElementById(id);
function vista(id) {
  document.querySelectorAll(".vista").forEach((v) => v.classList.remove("activa"));
  $(id).classList.add("activa");
}

// ---------- Interactividad de la tabla (tabs + calculadora) ----------
function initInteractividad() {
  // Tabs Proyectos / Mensuales
  const btnP = $("tab-proyectos"), btnM = $("tab-mensuales");
  function setTab(t) {
    const esP = t === "proyectos";
    btnP.classList.toggle("activo", esP);
    btnM.classList.toggle("activo", !esP);
    $("tabla-proyectos").hidden = !esP;
    $("tabla-mensuales").hidden = esP;
    $("bloque-calculadora").hidden = !esP;
    $("bloque-ejemplos").hidden = !esP;
    $("bloque-mensual-info").hidden = esP;
  }
  btnP.addEventListener("click", () => setTab("proyectos"));
  btnM.addEventListener("click", () => setTab("mensuales"));

  // Calculadora
  function calcular(value, perfil) {
    if (!value || value < 300) return null;
    if (value < 1000) return { ref: 30, ally: 55, rep: 90 }[perfil];
    const tiers = [
      { max: 2500, ref: 0.04, ally: 0.06, rep: 0.10 },
      { max: 5000, ref: 0.04, ally: 0.06, rep: 0.10 },
      { max: 10000, ref: 0.03, ally: 0.05, rep: 0.08 },
      { max: Infinity, ref: 0.025, ally: 0.04, rep: 0.07 }
    ];
    return Math.round(value * tiers.find((t) => value < t.max)[perfil]);
  }
  function etiquetaTasa(value, perfil) {
    if (!value || value < 300) return "—";
    if (value < 1000) return "Monto fijo";
    const tiers = [
      { max: 2500, ref: "4%", ally: "6%", rep: "10%" },
      { max: 5000, ref: "4%", ally: "6%", rep: "10%" },
      { max: 10000, ref: "3%", ally: "5%", rep: "8%" },
      { max: Infinity, ref: "2.5%", ally: "4%", rep: "7%" }
    ];
    return tiers.find((t) => value < t.max)[perfil];
  }
  const inputValor = $("calc-valor"), selPerfil = $("calc-perfil");
  const outMonto = $("calc-monto"), outNota = $("calc-nota");
  function refrescarCalc() {
    const v = Number(inputValor.value);
    const perfil = selPerfil.value;
    const c = calcular(v, perfil);
    outMonto.textContent = c !== null ? `B/. ${c.toLocaleString()}` : "—";
    if (c !== null && v >= 1000) outNota.textContent = `(${etiquetaTasa(v, perfil)} del proyecto)`;
    else if (c !== null) outNota.textContent = "Monto fijo";
    else outNota.textContent = "Ingresa un valor válido (mín. B/. 300)";
  }
  inputValor.addEventListener("input", refrescarCalc);
  selPerfil.addEventListener("change", refrescarCalc);
  refrescarCalc();

  $("anio").textContent = new Date().getFullYear();

  // Botón Descargar PDF
  $("btn-pdf")?.addEventListener("click", generarPDF);
}

// ---------- Generación del PDF (look & feel AMTECH) ----------
const COLOR = {
  naranja: [255, 122, 0],
  naranjaOsc: [232, 71, 10],
  amber: [180, 83, 9],     // Referente
  azul: [37, 99, 235],     // Aliado
  rep: [234, 88, 12],      // Rep. de Ventas
  texto: [20, 22, 26],
  gris: [120, 128, 140],
  grisClaro: [150, 157, 168],
  filaZebra: [245, 246, 248],
  linea: [225, 227, 231],
  blanco: [255, 255, 255]
};

function cargarLogo() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Reescalar a máx. 160px para que el PDF no pese de más (el logo
        // original es 1024×1024; a 12mm de impresión 160px sobra).
        const MAX = 160;
        const escala = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * escala);
        const h = Math.round(img.naturalHeight * escala);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve({ data: c.toDataURL("image/png"), w, h });
      } catch (_) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = "assets/logo-icon.png";
  });
}

async function generarPDF() {
  const btn = $("btn-pdf");
  if (!window.jspdf || !window.jspdf.jsPDF) {
    if (btn) btn.textContent = "Error: librería no cargó";
    return;
  }
  const txtOriginal = btn ? btn.innerHTML : "";
  if (btn) { btn.disabled = true; btn.textContent = "Generando…"; }

  try {
    const logo = await cargarLogo();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();   // 210
    const H = doc.internal.pageSize.getHeight();   // 297
    const M = 14;

    // ---- Banda de marca ----
    doc.setFillColor(...COLOR.naranja);
    doc.rect(0, 0, W, 30, "F");
    doc.setFillColor(...COLOR.naranjaOsc);
    doc.rect(0, 30, W, 2, "F");

    // Logo sobre fondo blanco para asegurar contraste
    doc.setFillColor(...COLOR.blanco);
    doc.roundedRect(M, 7, 16, 16, 3, 3, "F");
    if (logo) {
      const escala = 12 / Math.max(logo.w, logo.h);
      const lw = logo.w * escala, lh = logo.h * escala;
      doc.addImage(logo.data, "PNG", M + (16 - lw) / 2, 7 + (16 - lh) / 2, lw, lh);
    }

    doc.setTextColor(...COLOR.blanco);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("AM TECH SECURITY", M + 20, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Protegemos · Conectamos · Aseguramos", M + 20, 21);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("PROGRAMA DE COMISIONES", W - M, 15, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Contenido privado · Uso interno", W - M, 20.5, { align: "right" });

    // ---- Título ----
    doc.setTextColor(...COLOR.texto);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Programa de Comisiones", M, 44);
    doc.setFillColor(...COLOR.naranja);
    doc.rect(M, 47, 24, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR.gris);
    doc.text("Referidos y Ventas · Panamá", M, 53.5);
    const hoy = new Date().toLocaleDateString("es-PA", { day: "2-digit", month: "long", year: "numeric" });
    doc.text("Generado: " + hoy, W - M, 53.5, { align: "right" });

    // ---- Leyenda de perfiles ----
    let y = 58;
    doc.setFillColor(...COLOR.filaZebra);
    doc.roundedRect(M, y, W - 2 * M, 26, 2.5, 2.5, "F");
    const perfiles = [
      { c: COLOR.amber, n: "Referente", d: "Da el contacto. AMTECH se encarga de todo lo demás." },
      { c: COLOR.azul, n: "Aliado Comercial", d: "Promueve AMTECH activamente y facilita la reunión." },
      { c: COLOR.rep, n: "Rep. de Ventas", d: "Gestiona todo el ciclo: prospección, propuesta y cierre." }
    ];
    const colW = (W - 2 * M - 8) / 3;
    perfiles.forEach((p, i) => {
      const x = M + 5 + i * colW;
      doc.setFillColor(...p.c);
      doc.circle(x + 1.4, y + 7.2, 1.4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...p.c);
      doc.text(p.n, x + 5, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.8);
      doc.setTextColor(...COLOR.gris);
      doc.text(doc.splitTextToSize(p.d, colW - 7), x, y + 14);
    });
    y += 32;

    // ---- Helper: título de sección ----
    const tituloSeccion = (texto, yy) => {
      doc.setFillColor(...COLOR.naranja);
      doc.rect(M, yy - 3.2, 3, 3.6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLOR.texto);
      doc.text(texto, M + 5, yy);
      return yy + 4;
    };

    // ---- Estilos comunes de tabla ----
    const estiloTabla = {
      theme: "grid",
      margin: { left: M, right: M },
      styles: { font: "helvetica", fontSize: 8.6, cellPadding: 2.3, lineColor: COLOR.linea, lineWidth: 0.1, textColor: COLOR.texto },
      headStyles: { fillColor: COLOR.naranja, textColor: COLOR.blanco, fontStyle: "bold", fontSize: 8, halign: "center" },
      alternateRowStyles: { fillColor: COLOR.filaZebra },
      columnStyles: {
        0: { halign: "left", fontStyle: "bold", cellWidth: 40 },
        1: { halign: "left", textColor: COLOR.grisClaro },
        2: { halign: "center", textColor: COLOR.amber, fontStyle: "bold" },
        3: { halign: "center", textColor: COLOR.azul, fontStyle: "bold" },
        4: { halign: "center", textColor: COLOR.rep, fontStyle: "bold" }
      }
    };
    const cabComision = ["Nivel", "Valor", "Referente", "Aliado", "Rep. Ventas"];

    // ---- Tabla: Proyectos de Instalación ----
    y = tituloSeccion("Proyectos de Instalación", y);
    doc.autoTable({
      ...estiloTabla,
      startY: y,
      head: [cabComision],
      body: [
        ["Básico\n(monto fijo)", "B/. 300 – 999", "B/. 30", "B/. 55", "B/. 90"],
        ["Pequeño", "B/. 1,000 – 2,499", "4%", "6%", "10%"],
        ["Mediano", "B/. 2,500 – 4,999", "4%", "6%", "10%"],
        ["Grande", "B/. 5,000 – 9,999", "3%", "5%", "8%"],
        ["Corporativo\n(negociable)", "B/. 10,000+", "2.5%", "4%", "7%"]
      ]
    });
    y = doc.lastAutoTable.finalY + 9;

    // ---- Tabla: Contratos Mensuales ----
    y = tituloSeccion("Contratos Mensuales", y);
    doc.autoTable({
      ...estiloTabla,
      startY: y,
      head: [cabComision],
      body: [
        ["Básico\n(pago único al firmar)", "B/. 60 – 100/mes", "B/. 30", "B/. 50", "B/. 80"],
        ["Estándar\n(pago único al firmar)", "B/. 101 – 200/mes", "B/. 50", "B/. 80", "B/. 120"],
        ["Premium\n(pago único al firmar)", "B/. 201+/mes", "B/. 80", "B/. 120", "B/. 180"]
      ]
    });
    y = doc.lastAutoTable.finalY + 6;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.6);
    doc.setTextColor(...COLOR.gris);
    doc.text(doc.splitTextToSize("Las comisiones de contratos mensuales son un pago único al momento en que el cliente firma y paga su primera mensualidad. No hay comisión recurrente.", W - 2 * M), M, y);
    y += 11;

    // ---- Tabla: Ejemplos reales ----
    if (y > H - 70) { doc.addPage(); y = 22; }
    y = tituloSeccion("Ejemplos reales en Panamá", y);
    doc.autoTable({
      ...estiloTabla,
      startY: y,
      head: [["Caso", "Proyecto", "Referente", "Aliado", "Rep. Ventas"]],
      columnStyles: {
        0: { halign: "left", fontStyle: "bold", cellWidth: 62 },
        1: { halign: "right", textColor: COLOR.grisClaro },
        2: { halign: "center", textColor: COLOR.amber, fontStyle: "bold" },
        3: { halign: "center", textColor: COLOR.azul, fontStyle: "bold" },
        4: { halign: "center", textColor: COLOR.rep, fontStyle: "bold" }
      },
      body: [
        ["Sistema CCTV para restaurante", "B/. 1,200", "B/. 48", "B/. 72", "B/. 120"],
        ["Red WiFi + cableado oficina", "B/. 2,800", "B/. 112", "B/. 168", "B/. 280"],
        ["Sistema integral PH mediano", "B/. 7,500", "B/. 225", "B/. 375", "B/. 600"],
        ["Proyecto corporativo completo", "B/. 12,000", "B/. 300", "B/. 480", "B/. 840"]
      ]
    });
    y = doc.lastAutoTable.finalY + 9;

    // ---- Condiciones del Programa ----
    const condiciones = [
      "La comisión se paga una vez que el cliente realiza su pago, no antes.",
      "El referido debe registrarse antes de que AMTECH tenga contacto previo con ese cliente.",
      "El lead tiene vigencia de 60 días. Si no cierra en ese plazo, la comisión no aplica.",
      "El porcentaje se aplica sobre el valor total facturado al cliente.",
      "Las comisiones de contratos mensuales son pagos únicos al firmar el contrato.",
      "Pago por transferencia o efectivo, según acuerdo con AMTECH.",
      "3 o más cierres en el mismo mes: bonificación adicional de B/. 75.",
      "Proyectos de B/. 10,000+ se negocian directamente con la dirección."
    ];
    const altoCond = 8 + condiciones.length * 6.5;
    if (y + altoCond > H - 24) { doc.addPage(); y = 22; }
    y = tituloSeccion("Condiciones del Programa", y);
    y += 2;
    doc.setFontSize(8.6);
    condiciones.forEach((c) => {
      doc.setFillColor(...COLOR.naranja);
      doc.circle(M + 1.4, y - 1, 1, "F");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLOR.texto);
      const lineas = doc.splitTextToSize(c, W - 2 * M - 6);
      doc.text(lineas, M + 5, y);
      y += lineas.length * 4.6 + 2;
    });

    // ---- Pie de página en todas las páginas ----
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setDrawColor(...COLOR.linea);
      doc.setLineWidth(0.2);
      doc.line(M, H - 16, W - M, H - 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(...COLOR.gris);
      doc.text("AM TECH Security · info@amtechsecurity.net · +507 6841-3993 · www.amtechsecurity.net", M, H - 11);
      doc.text("Programa vigente a partir de junio " + new Date().getFullYear() + " · Sujeto a revisión · Contenido confidencial", M, H - 7.5);
      doc.text(`Pág. ${i} / ${total}`, W - M, H - 7.5, { align: "right" });
    }

    doc.save("AMTECH-Programa-de-Comisiones.pdf");
  } catch (e) {
    console.error("Error generando PDF:", e);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = txtOriginal; }
  }
}

function mostrarContenido(email) {
  vista("vista-contenido");
  if (email) {
    $("topbar-user").hidden = false;
    $("user-email").textContent = email;
  }
  initInteractividad();
}

// ---------- Autenticación ----------
let fb = null;
async function initFirebase() {
  const auth = await import(SDK + "firebase-auth.js");
  fb = { mod: auth, auth: auth.getAuth(app) };
}
function emailAutorizado(email) {
  if (!email) return false;
  return ADMIN_EMAILS.map((x) => x.toLowerCase()).includes(email.toLowerCase());
}
async function login() {
  $("login-err").textContent = "";
  try {
    const { GoogleAuthProvider, signInWithPopup } = fb.mod;
    const prov = new GoogleAuthProvider();
    prov.setCustomParameters({ hd: HD_DOMINIO, prompt: "select_account" });
    await signInWithPopup(fb.auth, prov);
  } catch (e) {
    if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") {
      $("login-err").textContent = "No se pudo iniciar sesión. Intenta de nuevo.";
    }
  }
}
async function logout() {
  try { await fb.mod.signOut(fb.auth); } catch (_) {}
}

async function arrancar() {
  $("btn-google")?.addEventListener("click", login);
  $("btn-logout")?.addEventListener("click", logout);
  $("btn-logout-2")?.addEventListener("click", logout);

  if (BYPASS) { mostrarContenido("vista-previa@local"); return; }

  if (!CONFIG_LISTA) {
    vista("vista-login");
    $("login-err").textContent = "Acceso pendiente de configuración.";
    $("btn-google").disabled = true;
    return;
  }

  await initFirebase();
  fb.mod.onAuthStateChanged(fb.auth, (user) => {
    if (!user) { vista("vista-login"); $("topbar-user").hidden = true; return; }
    if (emailAutorizado(user.email) && user.emailVerified) {
      mostrarContenido(user.email);
    } else {
      $("email-noauth").textContent = user.email || "";
      $("topbar-user").hidden = true;
      vista("vista-noautorizado");
    }
  });
}

arrancar();
