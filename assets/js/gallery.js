// ============================================================
//  Galería pública de proyectos — AM TECH Security
//  Lee los proyectos desde Firestore y los muestra con tarjetas
//  + modal "Antes / Después" y resumen.
// ============================================================

import { app, CONFIG_LISTA } from "./firebase-config.js";

const ES_LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);

// Datos de muestra: solo se usan en local cuando Firebase aún no está
// configurado, para previsualizar el diseño. Nunca aparecen en producción.
const DEMO = [
  {
    id: "demo1",
    title: "Restaurante Marco Polo — Renovación de CCTV",
    summary: "Reemplazo completo del cableado, entubado y migración de DVR de 8CH a un sistema profesional de 16 cámaras 5MP. Se ordenó todo el rack y se documentó la instalación.",
    beforeImages: [
      { url: "https://picsum.photos/seed/cctvantes1/900/650" },
      { url: "https://picsum.photos/seed/cctvantes2/900/650" }
    ],
    afterImages: [
      { url: "https://picsum.photos/seed/cctvdesp1/900/650" },
      { url: "https://picsum.photos/seed/cctvdesp2/900/650" },
      { url: "https://picsum.photos/seed/cctvdesp3/900/650" }
    ]
  },
  {
    id: "demo2",
    title: "PH Costa del Este — Red y WiFi de áreas comunes",
    summary: "Diseño e instalación de red segmentada, WiFi en áreas sociales y cámaras perimetrales con reporte ejecutivo para la administración del edificio.",
    beforeImages: [{ url: "https://picsum.photos/seed/redantes/900/650" }],
    afterImages: [
      { url: "https://picsum.photos/seed/reddesp1/900/650" },
      { url: "https://picsum.photos/seed/reddesp2/900/650" }
    ]
  }
];

const seccion = document.getElementById("proyectos");
const grid = document.getElementById("proyectos-grid");
const navLink = document.getElementById("nav-proyectos");

function escapar(t = "") {
  return t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function portada(p) {
  const img = (p.afterImages && p.afterImages[0]) || (p.beforeImages && p.beforeImages[0]);
  return img ? img.url : "assets/logo-icon.png";
}

// ---------- Modal ----------
let modal;
function construirModal() {
  modal = document.createElement("div");
  modal.className = "pry-modal";
  modal.innerHTML = `
    <div class="pry-modal-fondo" data-cerrar></div>
    <div class="pry-modal-caja" role="dialog" aria-modal="true" aria-labelledby="pry-modal-titulo">
      <button class="pry-modal-x" aria-label="Cerrar" data-cerrar>&times;</button>
      <h3 id="pry-modal-titulo"></h3>
      <p class="pry-modal-resumen"></p>
      <div class="pry-bloque pry-antes">
        <span class="pry-tag pry-tag-antes">Antes</span>
        <div class="pry-fotos"></div>
      </div>
      <div class="pry-bloque pry-despues">
        <span class="pry-tag pry-tag-despues">Después</span>
        <div class="pry-fotos"></div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-cerrar")) cerrarModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarModal(); });
}

function fotosHTML(lista = []) {
  if (!lista.length) return `<p class="pry-vacio">Sin fotos</p>`;
  return lista.map((f) => `<a href="${f.url}" target="_blank" rel="noopener" class="pry-foto"><img src="${f.url}" alt="" loading="lazy"></a>`).join("");
}

function abrirModal(p) {
  if (!modal) construirModal();
  modal.querySelector("#pry-modal-titulo").textContent = p.title || "Proyecto";
  modal.querySelector(".pry-modal-resumen").textContent = p.summary || "";
  const bloques = modal.querySelectorAll(".pry-fotos");
  bloques[0].innerHTML = fotosHTML(p.beforeImages);
  bloques[1].innerHTML = fotosHTML(p.afterImages);
  modal.querySelector(".pry-antes").style.display = (p.beforeImages && p.beforeImages.length) ? "" : "none";
  modal.querySelector(".pry-despues").style.display = (p.afterImages && p.afterImages.length) ? "" : "none";
  modal.classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  if (modal) modal.classList.remove("abierto");
  document.body.style.overflow = "";
}

// ---------- Render ----------
function render(proyectos) {
  grid.innerHTML = "";
  proyectos.forEach((p) => {
    const card = document.createElement("button");
    card.className = "pry-card revelar";
    card.innerHTML = `
      <div class="pry-card-img"><img src="${portada(p)}" alt="${escapar(p.title || "")}" loading="lazy"></div>
      <div class="pry-card-cuerpo">
        <h3>${escapar(p.title || "Proyecto")}</h3>
        <p>${escapar(p.summary || "")}</p>
        <span class="pry-card-ver">Ver antes y después →</span>
      </div>`;
    card.addEventListener("click", () => abrirModal(p));
    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add("visible"));
  });
}

function mostrarSeccion() {
  seccion.hidden = false;
  if (navLink) navLink.hidden = false;
}
function ocultarSeccion() {
  seccion.hidden = true;
  if (navLink) navLink.hidden = true;
}

// ---------- Carga ----------
async function cargar() {
  let proyectos = [];
  if (CONFIG_LISTA) {
    try {
      const { getFirestore, collection, query, orderBy, getDocs } =
        await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      const db = getFirestore(app);
      const snap = await getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc")));
      proyectos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error("No se pudo cargar la galería:", e);
      ocultarSeccion();
      return;
    }
  } else if (ES_LOCAL) {
    proyectos = DEMO; // previsualización local
  }

  if (!proyectos.length) { ocultarSeccion(); return; }
  render(proyectos);
  mostrarSeccion();
}

cargar();
