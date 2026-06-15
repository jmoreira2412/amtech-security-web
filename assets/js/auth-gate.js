// ============================================================
//  Control de acceso reutilizable — AM TECH Security
//  Para cualquier página privada (apps internas). Reutiliza el
//  login de Google + lista blanca; la sesión se comparte en todo
//  el dominio. La seguridad real la imponen las reglas de Firebase.
//
//  Uso: la página debe tener estos elementos:
//    .vista (con ids #vista-login, #vista-noautorizado, #vista-contenido)
//    #btn-google, #btn-logout (y opcional #btn-logout-2)
//    #login-err, #email-noauth, #topbar-user, #user-email
//  Luego:  import { protegerPagina } from "./auth-gate.js";
//          protegerPagina((email) => { /* al autorizar */ });
//
//  Para previsualizar el diseño en local sin login: ?preview=1
// ============================================================

import { app, CONFIG_LISTA, ADMIN_EMAILS, HD_DOMINIO } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const ES_LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);
const BYPASS = ES_LOCAL && new URLSearchParams(location.search).has("preview");
const $ = (id) => document.getElementById(id);

function vista(id) {
  document.querySelectorAll(".vista").forEach((v) => v.classList.remove("activa"));
  $(id)?.classList.add("activa");
}

let fb = null;
async function initFirebase() {
  const auth = await import(SDK + "firebase-auth.js");
  fb = { mod: auth, auth: auth.getAuth(app) };
}

function emailAutorizado(email) {
  return !!email && ADMIN_EMAILS.map((x) => x.toLowerCase()).includes(email.toLowerCase());
}

async function login() {
  const err = $("login-err");
  if (err) err.textContent = "";
  try {
    const { GoogleAuthProvider, signInWithPopup } = fb.mod;
    const prov = new GoogleAuthProvider();
    prov.setCustomParameters({ hd: HD_DOMINIO, prompt: "select_account" });
    await signInWithPopup(fb.auth, prov);
  } catch (e) {
    if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request" && err) {
      err.textContent = "No se pudo iniciar sesión. Intenta de nuevo.";
    }
  }
}

async function logout() {
  try { await fb.mod.signOut(fb.auth); } catch (_) {}
}

export async function protegerPagina(onAutorizado) {
  $("btn-google")?.addEventListener("click", login);
  $("btn-logout")?.addEventListener("click", logout);
  $("btn-logout-2")?.addEventListener("click", logout);

  const entrar = (email) => {
    vista("vista-contenido");
    const tu = $("topbar-user");
    if (tu) tu.hidden = false;
    const ue = $("user-email");
    if (ue && email) ue.textContent = email;
    if (typeof onAutorizado === "function") onAutorizado(email);
  };

  if (BYPASS) { entrar("vista-previa@local"); return; }

  if (!CONFIG_LISTA) {
    vista("vista-login");
    const err = $("login-err");
    if (err) err.textContent = "Acceso pendiente de configuración.";
    const b = $("btn-google");
    if (b) b.disabled = true;
    return;
  }

  await initFirebase();
  fb.mod.onAuthStateChanged(fb.auth, (user) => {
    if (!user) { vista("vista-login"); const tu = $("topbar-user"); if (tu) tu.hidden = true; return; }
    if (emailAutorizado(user.email) && user.emailVerified) {
      entrar(user.email);
    } else {
      const en = $("email-noauth"); if (en) en.textContent = user.email || "";
      const tu = $("topbar-user"); if (tu) tu.hidden = true;
      vista("vista-noautorizado");
    }
  });
}
