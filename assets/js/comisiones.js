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
