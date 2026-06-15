// ============================================================
//  Panel de administración de la galería — AM TECH Security
//  · Login con Google (restringido a la lista blanca ADMIN_EMAILS)
//  · CRUD de proyectos con subida de fotos "Antes/Después" (máx. 4 c/u)
//  La seguridad real la imponen firestore.rules y storage.rules.
// ============================================================

import { app, CONFIG_LISTA, ADMIN_EMAILS, HD_DOMINIO } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const MAX_FOTOS = 4;
const ES_LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);
// Modo demostración: solo en local y sin Firebase configurado. Permite
// previsualizar el panel sin backend. Nunca se activa en producción.
const IS_DEMO = ES_LOCAL && !CONFIG_LISTA;

const $ = (id) => document.getElementById(id);

// ---------- utilidades de UI ----------
function vista(id) {
  document.querySelectorAll(".vista").forEach((v) => v.classList.remove("activa"));
  $(id).classList.add("activa");
}
let toastT;
function toast(msg, tipo = "") {
  const t = $("toast");
  t.textContent = msg;
  t.className = "show " + tipo;
  clearTimeout(toastT);
  toastT = setTimeout(() => (t.className = ""), 3200);
}
function cargando(on, txt = "Guardando…") {
  $("cargando-txt").textContent = txt;
  $("cargando").classList.toggle("show", on);
}
function escapar(t = "") {
  return t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- estado ----------
const state = {
  proyectos: [],
  editandoId: null,      // null => proyecto nuevo
  antes: [],             // items {tipo:'existente',url,path} | {tipo:'nuevo',file,url}
  despues: [],
  originalAntes: [],     // para detectar fotos eliminadas al editar
  originalDespues: []
};

// ---------- Firebase (modo real) ----------
let fb = null; // { auth, db, storage, ... funciones }
async function initFirebase() {
  const [auth, fs, st] = await Promise.all([
    import(SDK + "firebase-auth.js"),
    import(SDK + "firebase-firestore.js"),
    import(SDK + "firebase-storage.js")
  ]);
  fb = {
    authMod: auth, fsMod: fs, stMod: st,
    auth: auth.getAuth(app),
    db: fs.getFirestore(app),
    storage: st.getStorage(app)
  };
}

// ---------- compresión de imágenes ----------
function cargarImg(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}
async function comprimir(file, maxLado = 1600, calidad = 0.82) {
  try {
    const img = await cargarImg(file);
    let { width: w, height: h } = img;
    if (Math.max(w, h) > maxLado) {
      const r = maxLado / Math.max(w, h);
      w = Math.round(w * r); h = Math.round(h * r);
    }
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    cv.getContext("2d").drawImage(img, 0, 0, w, h);
    const blob = await new Promise((res) => cv.toBlob(res, "image/jpeg", calidad));
    return blob || file;
  } catch {
    return file; // si algo falla, sube el original
  }
}

// ============================================================
//  Capa de datos (real vs. demo)
// ============================================================
async function listar() {
  if (IS_DEMO) return state.proyectos;
  const { collection, query, orderBy, getDocs } = fb.fsMod;
  const snap = await getDocs(query(collection(fb.db, "projects"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function subirFotos(projectId, carpeta, items) {
  // Devuelve array {url, path} en orden. Sube solo los 'nuevo'.
  const { ref, uploadBytes, getDownloadURL } = fb.stMod;
  const out = [];
  for (const it of items) {
    if (it.tipo === "existente") { out.push({ url: it.url, path: it.path }); continue; }
    const blob = await comprimir(it.file);
    const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const path = `projects/${projectId}/${carpeta}/${nombre}`;
    const r = ref(fb.storage, path);
    await uploadBytes(r, blob, { contentType: "image/jpeg" });
    out.push({ url: await getDownloadURL(r), path });
  }
  return out;
}

async function borrarFotos(items) {
  if (!items.length) return;
  const { ref, deleteObject } = fb.stMod;
  await Promise.all(items.map(async (it) => {
    if (!it.path) return;
    try { await deleteObject(ref(fb.storage, it.path)); } catch (_) { /* ya no existe */ }
  }));
}

async function guardarProyecto(datos) {
  if (IS_DEMO) {
    const portadaUrl = (arr) => arr.map((i) => ({ url: i.url, path: i.path || null }));
    const reg = {
      title: datos.title, summary: datos.summary,
      beforeImages: portadaUrl(state.antes), afterImages: portadaUrl(state.despues)
    };
    if (state.editandoId) {
      const i = state.proyectos.findIndex((p) => p.id === state.editandoId);
      state.proyectos[i] = { ...state.proyectos[i], ...reg };
    } else {
      state.proyectos.unshift({ id: "demo-" + Date.now(), createdAt: Date.now(), ...reg });
    }
    return;
  }

  const { doc, collection, setDoc, updateDoc, serverTimestamp } = fb.fsMod;
  const id = state.editandoId || doc(collection(fb.db, "projects")).id;
  const beforeImages = await subirFotos(id, "antes", state.antes);
  const afterImages = await subirFotos(id, "despues", state.despues);

  // fotos eliminadas (estaban antes y ya no están) -> borrar de Storage
  const sigueAhi = (orig, actuales) => actuales.some((a) => a.tipo === "existente" && a.path === orig.path);
  const eliminadas = [
    ...state.originalAntes.filter((o) => !sigueAhi(o, state.antes)),
    ...state.originalDespues.filter((o) => !sigueAhi(o, state.despues))
  ];

  if (state.editandoId) {
    await updateDoc(doc(fb.db, "projects", id), {
      title: datos.title, summary: datos.summary, beforeImages, afterImages, updatedAt: serverTimestamp()
    });
  } else {
    await setDoc(doc(fb.db, "projects", id), {
      title: datos.title, summary: datos.summary, beforeImages, afterImages,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
  }
  await borrarFotos(eliminadas);
}

async function eliminarProyecto(p) {
  if (IS_DEMO) {
    state.proyectos = state.proyectos.filter((x) => x.id !== p.id);
    return;
  }
  const { doc, deleteDoc } = fb.fsMod;
  await borrarFotos([...(p.beforeImages || []), ...(p.afterImages || [])].map((i) => ({ path: i.path })));
  await deleteDoc(doc(fb.db, "projects", p.id));
}

// ============================================================
//  Dashboard
// ============================================================
async function refrescarLista() {
  try {
    state.proyectos = await listar();
  } catch (e) {
    console.error(e); toast("No se pudo cargar la lista", "err"); return;
  }
  const cont = $("lista-proyectos");
  $("resumen-conteo").textContent =
    state.proyectos.length ? `${state.proyectos.length} proyecto(s) publicado(s)` : "Aún no hay proyectos";
  if (!state.proyectos.length) {
    cont.innerHTML = `<div class="vacio">No hay proyectos todavía.<br>Crea el primero con «+ Nuevo proyecto».</div>`;
    return;
  }
  cont.innerHTML = "";
  state.proyectos.forEach((p) => {
    const portada = (p.afterImages?.[0] || p.beforeImages?.[0])?.url || "assets/logo-icon.png";
    const nFotos = (p.beforeImages?.length || 0) + (p.afterImages?.length || 0);
    const fila = document.createElement("div");
    fila.className = "fila";
    fila.innerHTML = `
      <div class="fila-img"><img src="${portada}" alt=""></div>
      <div class="fila-info">
        <h3>${escapar(p.title || "Sin título")}</h3>
        <span>${nFotos} foto(s) · ${(p.beforeImages?.length || 0)} antes / ${(p.afterImages?.length || 0)} después</span>
      </div>
      <div class="fila-acciones">
        <button class="btn-sec btn-chico" data-editar>Editar</button>
        <button class="btn-peligro btn-chico" data-eliminar>Eliminar</button>
      </div>`;
    fila.querySelector("[data-editar]").addEventListener("click", () => abrirEditor(p));
    fila.querySelector("[data-eliminar]").addEventListener("click", () => confirmarEliminar(p));
    cont.appendChild(fila);
  });
}

async function confirmarEliminar(p) {
  if (!confirm(`¿Eliminar el proyecto «${p.title || "sin título"}»?\nEsta acción no se puede deshacer.`)) return;
  cargando(true, "Eliminando…");
  try {
    await eliminarProyecto(p);
    toast("Proyecto eliminado", "ok");
    await refrescarLista();
  } catch (e) {
    console.error(e); toast("Error al eliminar: " + (e.message || e), "err");
  } finally {
    cargando(false);
  }
}

// ============================================================
//  Editor
// ============================================================
function abrirEditor(p = null) {
  state.editandoId = p ? p.id : null;
  $("editor-titulo").textContent = p ? "Editar proyecto" : "Nuevo proyecto";
  $("in-titulo").value = p?.title || "";
  $("in-resumen").value = p?.summary || "";
  $("cont-resumen").textContent = ($("in-resumen").value || "").length;

  state.antes = (p?.beforeImages || []).map((i) => ({ tipo: "existente", url: i.url, path: i.path }));
  state.despues = (p?.afterImages || []).map((i) => ({ tipo: "existente", url: i.url, path: i.path }));
  state.originalAntes = [...state.antes];
  state.originalDespues = [...state.despues];

  renderMiniaturas();
  $("panel-lista").hidden = true;
  $("panel-editor").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cerrarEditor() {
  $("panel-editor").hidden = true;
  $("panel-lista").hidden = false;
}

function renderMiniaturas() {
  for (const [grupo, contId, contadorId] of [["antes", "mini-antes", "cont-antes"], ["despues", "mini-despues", "cont-despues"]]) {
    const cont = $(contId);
    const arr = state[grupo];
    cont.innerHTML = "";
    arr.forEach((it, idx) => {
      const div = document.createElement("div");
      div.className = "mini";
      div.innerHTML = `<img src="${it.url}" alt=""><button type="button" aria-label="Quitar">&times;</button>`;
      div.querySelector("button").addEventListener("click", () => {
        arr.splice(idx, 1);
        renderMiniaturas();
      });
      cont.appendChild(div);
    });
    $(contadorId).textContent = `${arr.length}/${MAX_FOTOS}`;
    const btn = $(grupo === "antes" ? "add-antes" : "add-despues");
    btn.disabled = arr.length >= MAX_FOTOS;
  }
}

function agregarFotos(grupo, fileList) {
  const arr = state[grupo];
  const libres = MAX_FOTOS - arr.length;
  const files = [...fileList].slice(0, Math.max(0, libres));
  if (fileList.length > libres) toast(`Máximo ${MAX_FOTOS} fotos por sección`, "err");
  files.forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    arr.push({ tipo: "nuevo", file, url: URL.createObjectURL(file) });
  });
  renderMiniaturas();
}

async function guardar() {
  const title = $("in-titulo").value.trim();
  const summary = $("in-resumen").value.trim();
  if (!title) { toast("El título es obligatorio", "err"); $("in-titulo").focus(); return; }
  if (!state.antes.length && !state.despues.length) {
    if (!confirm("Este proyecto no tiene fotos. ¿Guardar de todos modos?")) return;
  }
  cargando(true, "Guardando proyecto…");
  try {
    await guardarProyecto({ title, summary });
    toast("Proyecto guardado", "ok");
    cerrarEditor();
    await refrescarLista();
  } catch (e) {
    console.error(e);
    toast("Error al guardar: " + (e.code || e.message || e), "err");
  } finally {
    cargando(false);
  }
}

// ============================================================
//  Autenticación
// ============================================================
function emailAutorizado(email) {
  if (!email) return false;
  const e = email.toLowerCase();
  return ADMIN_EMAILS.map((x) => x.toLowerCase()).includes(e);
}

async function login() {
  $("login-err").textContent = "";
  try {
    const { GoogleAuthProvider, signInWithPopup } = fb.authMod;
    const prov = new GoogleAuthProvider();
    prov.setCustomParameters({ hd: HD_DOMINIO, prompt: "select_account" });
    await signInWithPopup(fb.auth, prov);
  } catch (e) {
    console.error(e);
    if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") {
      $("login-err").textContent = "No se pudo iniciar sesión. Intenta de nuevo.";
    }
  }
}

async function logout() {
  if (IS_DEMO) return;
  try { await fb.authMod.signOut(fb.auth); } catch (e) { console.error(e); }
}

function alEntrar(user) {
  $("topbar-user").hidden = false;
  $("user-email").textContent = user.email;
  vista("vista-dashboard");
  refrescarLista();
}

// ============================================================
//  Arranque
// ============================================================
function conectarEventos() {
  $("btn-google")?.addEventListener("click", login);
  $("btn-logout")?.addEventListener("click", logout);
  $("btn-logout-2")?.addEventListener("click", logout);
  $("btn-nuevo")?.addEventListener("click", () => abrirEditor(null));
  $("btn-cancelar")?.addEventListener("click", cerrarEditor);
  $("btn-guardar")?.addEventListener("click", guardar);
  $("add-antes")?.addEventListener("click", () => $("file-antes").click());
  $("add-despues")?.addEventListener("click", () => $("file-despues").click());
  $("file-antes")?.addEventListener("change", (e) => { agregarFotos("antes", e.target.files); e.target.value = ""; });
  $("file-despues")?.addEventListener("change", (e) => { agregarFotos("despues", e.target.files); e.target.value = ""; });
  $("in-resumen")?.addEventListener("input", (e) => { $("cont-resumen").textContent = e.target.value.length; });
}

async function arrancar() {
  conectarEventos();

  if (IS_DEMO) {
    // Datos de muestra para previsualizar el panel en local.
    state.proyectos = [
      { id: "demo1", createdAt: 2, title: "Restaurante Marco Polo — Renovación de CCTV",
        summary: "Reemplazo de cableado y migración a 16 cámaras 5MP con rack ordenado y documentado.",
        beforeImages: [{ url: "https://picsum.photos/seed/a1/600/450" }],
        afterImages: [{ url: "https://picsum.photos/seed/d1/600/450" }, { url: "https://picsum.photos/seed/d2/600/450" }] },
      { id: "demo2", createdAt: 1, title: "PH Costa del Este — Red y WiFi",
        summary: "Red segmentada, WiFi en áreas sociales y cámaras perimetrales con reporte ejecutivo.",
        beforeImages: [{ url: "https://picsum.photos/seed/a3/600/450" }],
        afterImages: [{ url: "https://picsum.photos/seed/d3/600/450" }] }
    ];
    $("banner-config").hidden = false;
    $("topbar-user").hidden = false;
    $("user-email").textContent = "demo@amtechsecurity.net";
    vista("vista-dashboard");
    refrescarLista();
    return;
  }

  if (!CONFIG_LISTA) {
    vista("vista-login");
    $("login-err").textContent = "Panel pendiente de configuración de Firebase.";
    $("btn-google").disabled = true;
    return;
  }

  await initFirebase();
  fb.authMod.onAuthStateChanged(fb.auth, (user) => {
    if (!user) { vista("vista-login"); $("topbar-user").hidden = true; return; }
    if (emailAutorizado(user.email) && user.emailVerified) {
      alEntrar(user);
    } else {
      $("email-noauth").textContent = user.email || "";
      $("topbar-user").hidden = true;
      vista("vista-noautorizado");
    }
  });
}

arrancar();
