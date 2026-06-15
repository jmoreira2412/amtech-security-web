# Configuración de Firebase — Galería + Panel admin

La galería de proyectos y el panel `/admin.html` usan **Firebase** para:
- **Auth**: login con Google restringido a una lista de correos.
- **Firestore**: datos de los proyectos.
- **Storage**: fotos "Antes/Después".

> Los valores de `firebase-config.js` son **públicos** por diseño. La seguridad
> la imponen `firestore.rules` y `storage.rules` (lista blanca de correos).

## Pasos en la consola de Firebase (requieren tu cuenta de Google)

1. **Crear proyecto** en https://console.firebase.google.com → "Agregar proyecto"
   (ej. nombre `amtech-security`). Puedes desactivar Google Analytics.

2. **Registrar app web**: ícono `</>` → registra la app (ej. "Sitio AM TECH").
   Copia el objeto `firebaseConfig` que aparece.

3. **Authentication** → "Comenzar" → pestaña *Sign-in method* → habilita **Google**.
   En *Settings → Authorized domains* agrega:
   - `www.amtechsecurity.net`
   - `amtechsecurity.net`
   - `jmoreira2412.github.io`
   - `localhost`

4. **Firestore Database** → "Crear base de datos" → modo *Producción* → región
   (ej. `us-central` / `nam5`). Luego pega el contenido de `firestore.rules`
   en la pestaña *Reglas* y publica.

5. **Storage** → "Comenzar". Puede pedir activar el plan **Blaze**
   (pago por uso). A esta escala el costo real es ~$0; puedes poner una
   **alerta de presupuesto** de $1–5 en Google Cloud. Luego pega el contenido
   de `storage.rules` en *Reglas* y publica.

## Pasos en el código (los hago yo)

6. Pegar el `firebaseConfig` real en `assets/js/firebase-config.js`.
7. Poner los **correos autorizados** en TRES lugares (deben coincidir):
   - `ADMIN_EMAILS` en `assets/js/firebase-config.js`
   - la lista en `firestore.rules`
   - la lista en `storage.rules`
8. Merge de la rama `galeria-admin` a `main` → se publica solo.

## Datos que necesito de ti

- El objeto **`firebaseConfig`** (paso 2).
- Los **correos** que podrán administrar la galería.

## Modo demostración (desarrollo)

En `localhost`, si Firebase no está configurado, el panel y la galería muestran
datos de muestra para previsualizar el diseño. Esto **nunca** ocurre en producción.
