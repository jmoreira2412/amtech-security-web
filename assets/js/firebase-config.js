// ============================================================
//  Configuración de Firebase — AM TECH Security
// ============================================================
//  Estos valores son PÚBLICOS por diseño en las apps web de Firebase.
//  La seguridad real la imponen las reglas del servidor:
//    · firestore.rules   (quién puede leer/escribir la base de datos)
//    · storage.rules     (quién puede subir/borrar fotos)
//
//  CÓMO COMPLETAR (ver SETUP-FIREBASE.md):
//   1. Consola de Firebase → ⚙ Configuración del proyecto → "Tus apps"
//      → app web → copia el objeto firebaseConfig y reemplaza el de abajo.
//   2. Pon los correos autorizados en ADMIN_EMAILS (y en las reglas).
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

export const firebaseConfig = {
  apiKey: "AIzaSyA4HpQfKs2mjucDPMkM9ES5xhCp_ZzhLJA",
  authDomain: "am-tech-security.firebaseapp.com",
  projectId: "am-tech-security",
  storageBucket: "am-tech-security.firebasestorage.app",
  messagingSenderId: "146445790554",
  appId: "1:146445790554:web:d354aba54aa5944cbf9763"
};

// Lista blanca de correos que pueden administrar la galería.
// IMPORTANTE: debe coincidir con la lista en firestore.rules y storage.rules.
export const ADMIN_EMAILS = [
  "jonathan@amtechsecurity.net",
  "amartinez@amtechsecurity.net"
];

// Dominio del Google Workspace (pista para el login de Google).
export const HD_DOMINIO = "amtechsecurity.net";

// true cuando ya se pegó la configuración real (no quedan placeholders).
export const CONFIG_LISTA = !firebaseConfig.apiKey.startsWith("REEMPLAZAR");

// App de Firebase inicializada (null si aún no se ha configurado).
export const app = CONFIG_LISTA ? initializeApp(firebaseConfig) : null;
