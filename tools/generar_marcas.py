#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de páginas de marcas — AM TECH Security
Crea /marcas/index.html (hub) + /marcas/<slug>/index.html (subpáginas) + sitemap.xml
a partir de los datos de abajo. Reejecutar tras editar BRANDS.
Contenido tomado de CLAUDE_website_marcas.md. Teléfono/colores: valores vigentes del sitio.
"""
import os, html, urllib.parse

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WA = "50768413993"
SITE = "https://www.amtechsecurity.net"

VERTICALES = {
    "seguridad": "Seguridad Física Digital",
    "infra": "Infraestructura Tecnológica",
    "ciber": "Ciberseguridad",
}
# Marcas por vertical en el hub (una marca puede repetirse)
HUB = {
    "seguridad": ["hikvision", "dahua", "unifi", "meraki"],
    "infra": ["unifi", "meraki", "fortinet", "dell", "hp", "apc", "commscope", "superior", "cablofil"],
    "ciber": ["microsoft", "fortinet", "unifi", "meraki"],
}

BRANDS = {
"hikvision": {
    "name": "Hikvision", "tier": "Entrada → Mid", "badge": "ENTRADA",
    "verticals": ["seguridad"], "logo": "hikvision.svg",
    "segment": ["Comercios", "Residencial", "PH", "Oficinas"],
    "desc": "Hikvision es el fabricante de videovigilancia número uno a nivel mundial, con presencia y soporte local en Panamá. AMTECH trabaja con Hikvision como marca principal para proyectos de entrada y mediano tamaño, cubriendo el 70% de los requerimientos de videovigilancia del mercado panameño.",
    "apps": ["Cámaras IP y analógicas 2MP–8MP (Bullet, Dome, PTZ)", "DVR / NVR con analítica de vídeo básica", "Control de acceso biométrico y por tarjeta", "Videoporteros DS-KH y video intercomunicadores", "Cámaras con detección de rostros y lectura de placas (LPR)", "Alarmas, sensores y sirenas"],
    "range": "B/. 300 – B/. 6,000",
    "notas": [("Por qué AMTECH la eligió", "Disponibilidad local garantizada, repuestos en Panamá, amplio catálogo y precio competitivo para proyectos SMB.")],
},
"dahua": {
    "name": "Dahua", "tier": "Entrada → Mid", "badge": "ENTRADA",
    "verticals": ["seguridad"], "logo": "dahua.svg",
    "segment": ["Comercios", "Residencial", "PH", "Oficinas"],
    "desc": "Dahua Technology es una de las marcas de videovigilancia con mayor crecimiento en Panamá, ofreciendo analítica inteligente de IA bajo su línea WizSense a precios accesibles para el mercado local.",
    "apps": ["Cámaras IP y HDCVI Full-Color con IA (WizSense)", "DVR / NVR WizSense con analítica inteligente", "Control de acceso con reconocimiento facial", "Videoporteros y video comunicadores IP", "Barreras vehiculares con LPR integrado", "Cámaras térmicas de entrada"],
    "range": "B/. 300 – B/. 6,000",
    "notas": [("Por qué AMTECH la eligió", "Alternativa de calidad a Hikvision con mayor énfasis en IA integrada a precio accesible.")],
},
"unifi": {
    "name": "Ubiquiti UniFi", "tier": "Profesional → Premium", "badge": "PREMIUM",
    "verticals": ["seguridad", "infra", "ciber"], "logo": "ubiquiti.svg",
    "segment": ["SMB", "Comercios", "PH", "Oficinas modernas", "Residencial alto"],
    "desc": "Ubiquiti UniFi es el ecosistema tecnológico de referencia de AMTECH para el segmento SMB en Panamá. Una sola plataforma cubre videovigilancia, control de acceso, networking WiFi/cableado y seguridad de red, todo gestionado desde UniFi OS. Su combinación de precio competitivo, calidad profesional y ecosistema integrado lo convierte en la primera recomendación para la mayoría de los proyectos.",
    "apps": {
        "Seguridad Física Digital": ["UniFi Protect – Cámaras IP 4K con app nativa", "NVR integrado en ecosistema UniFi OS", "UniFi Access – Control de acceso unificado con tarjeta y app", "G4 Doorbell / G4 Intercom – Videoportero integrado"],
        "Infraestructura Tecnológica": ["Switches PoE 8–48 puertos (USW series)", "APs WiFi 6/6E de alta densidad (U6-Lite, U6-Pro, U6-Mesh)", "Gateways UniFi (UDR, UDM-SE, UDM-Pro) con firewall integrado", "VLANs, QoS y segmentación de red", "Redes mesh para cobertura multi-piso"],
        "Ciberseguridad (capa base)": ["Segmentación de red con VLANs (datos, cámaras, invitados, IoT)", "Reglas de firewall y control de tráfico entre subredes", "IDS/IPS básico en UDM-Pro y UDM-SE", "Portal cautivo para WiFi de invitados", "Fundación segura de red antes de escalar a Fortinet"],
    },
    "range": "B/. 2,500 – B/. 12,000 (seguridad)",
    "notas": [("Por qué AMTECH la eligió", "El ecosistema más rentable y completo para proyectos SMB. Una sola plataforma para toda la tecnología del cliente.")],
},
"meraki": {
    "name": "Cisco Meraki", "tier": "Enterprise", "badge": "ENTERPRISE",
    "verticals": ["seguridad", "infra", "ciber"], "logo": None,
    "segment": ["Empresas medianas", "Multi-sede", "Corporativo"],
    "desc": "Cisco Meraki es la plataforma cloud-managed de Cisco para organizaciones que necesitan gestión centralizada de múltiples sedes, visibilidad avanzada y cumplimiento. AMTECH utiliza Meraki como solución enterprise que cubre videovigilancia, networking y seguridad desde un solo dashboard global.",
    "apps": {
        "Seguridad Física Digital": ["Meraki MV – Cámaras cloud con IA local", "Analítica avanzada: conteo de personas, detección de movimiento", "Retención de video flexible: 7–90 días"],
        "Infraestructura Tecnológica": ["Switches MS series cloud-managed (acceso, distribución, core)", "APs MR series WiFi 6/6E enterprise", "Routers MX series con SD-WAN integrado", "Dashboard global centralizado con analítica de red", "Licencias anuales por dispositivo (modelo SaaS)"],
        "Ciberseguridad": ["MX Security Appliances – NGFW cloud-managed", "Advanced Malware Protection (AMP) con Cisco Talos", "Filtrado de contenido web y control de aplicaciones", "SD-WAN seguro con failover automático", "VPN site-to-site y client-to-site desde dashboard"],
    },
    "range": "B/. 8,000 – B/. 25,000+ (seguridad)",
    "notas": [("Modelo comercial", "Hardware + licencias anuales por dispositivo — renovación recurrente."), ("Por qué AMTECH la eligió", "La solución enterprise más completa para clientes corporativos y multi-sede con Cisco como estándar.")],
},
"fortinet": {
    "name": "Fortinet", "tier": "Premium", "badge": "PREMIUM",
    "verticals": ["infra", "ciber"], "logo": "fortinet.svg",
    "segment": ["PYME avanzada", "Empresa mediana", "Multi-sede", "Corporativo"],
    "desc": "Fortinet es la plataforma de seguridad integral que AMTECH recomienda cuando el cliente necesita tanto infraestructura de red sólida como protección perimetral avanzada. El ecosistema Fortinet integra switches, APs, firewall UTM y gestión centralizada bajo una misma consola, convirtiéndolo en la elección natural para proyectos donde la red y la ciberseguridad deben funcionar como un solo sistema.",
    "apps": {
        "Infraestructura Tecnológica": ["FortiSwitch – Switching gestionado y seguro integrado a FortiGate", "FortiAP – WiFi empresarial controlado por FortiGate", "Segmentación de red con VLANs y políticas de acceso granulares", "Gestión unificada de red y seguridad desde FortiGate"],
        "Ciberseguridad": ["FortiGate – UTM/NGFW: firewall, IPS, antivirus de red, filtrado web", "FortiClient – Seguridad de endpoint y VPN empresarial", "FortiAnalyzer – Logs centralizados y visibilidad de amenazas", "FortiManager – Gestión centralizada de políticas de seguridad", "VPN SSL e IPSec para trabajo remoto y sucursales", "Control de navegación y filtrado de contenido por categoría y horario"],
    },
    "notas": [("Modelo comercial", "Hardware + suscripción anual UTM Bundle — renovación recurrente."), ("Por qué AMTECH la eligió", "Único ecosistema que unifica red y ciberseguridad en una plataforma sólida y probada. La elección natural cuando el cliente tiene datos sensibles o necesita VPN.")],
},
"dell": {
    "name": "Dell", "tier": "Profesional", "badge": "PROFESIONAL",
    "verticals": ["infra"], "logo": "dell.svg",
    "segment": ["Empresas", "PH", "Corporativo"],
    "desc": "Dell Technologies es la marca líder en servidores y cómputo empresarial que AMTECH recomienda para proyectos que requieren infraestructura de servidores confiable, con soporte ProSupport disponible en Panamá.",
    "apps": ["PowerEdge – Servidores rack y torre para NVR, backup y virtualización", "PowerVault – Almacenamiento NAS/DAS", "OptiPlex / Latitude – Workstations y notebooks empresariales", "Soporte ProSupport con garantía Next Business Day", "Servidores para Microsoft Hyper-V y VMware"],
    "notas": [],
},
"hp": {
    "name": "HP", "tier": "Profesional", "badge": "PROFESIONAL",
    "verticals": ["infra"], "logo": "hp.svg",
    "segment": ["Empresas", "Oficinas", "Corporativo"],
    "desc": "HP Enterprise ofrece una línea completa de servidores, workstations y notebooks corporativos que AMTECH integra en proyectos de infraestructura tecnológica.",
    "apps": ["ProLiant – Servidores rack y torre SMB/Enterprise", "EliteBook / ProBook – Notebooks corporativos", "Z Workstations – Alto rendimiento técnico", "Impresoras y multifuncionales empresariales", "HP Care Pack – Soporte y garantía extendida"],
    "notas": [],
},
"apc": {
    "name": "APC by Schneider Electric", "tier": "Transversal", "badge": "TRANSVERSAL",
    "verticals": ["infra"], "logo": None,
    "segment": ["Todos los segmentos"],
    "desc": "APC by Schneider Electric es la marca de referencia para protección eléctrica. En Panamá, donde la inestabilidad eléctrica es una realidad, AMTECH incluye soluciones APC en toda propuesta con equipos críticos.",
    "apps": ["UPS Back-UPS y Smart-UPS (500VA – 10kVA+) para redes y servidores", "Reguladores de voltaje para cámaras, switches y routers", "Smart-UPS con Network Management Card para gestión remota", "Racks y gabinetes NetShelter (piso y pared)", "PDUs inteligentes y protecciones eléctricas"],
    "notas": [("Propuesta de valor", "Protege la inversión en equipos instalados. Toda solución AMTECH que incluya equipos críticos va protegida.")],
},
"commscope": {
    "name": "CommScope", "tier": "Premium", "badge": "PREMIUM",
    "verticals": ["infra"], "logo": "commscope.svg",
    "segment": ["Empresas", "PH", "Corporativo", "Data Center"],
    "desc": "CommScope es la marca de cableado estructurado certificado que AMTECH utiliza para proyectos corporativos que requieren garantía extendida, documentación formal de canal y máximo rendimiento.",
    "apps": ["Cableado Cat6 / Cat6A certificado SYSTIMAX", "Fibra óptica monomodo y multimodo OM3/OM4", "Patch panels y keystone jacks de alto rendimiento", "Certificación de canales con garantía extendida 15–25 años", "Soluciones para data centers y salas de telecomunicaciones"],
    "notas": [],
},
"superior": {
    "name": "Superior", "tier": "Entrada", "badge": "ENTRADA",
    "verticals": ["infra"], "logo": None,
    "segment": ["SMB", "Comercios", "Residencial"],
    "desc": "Superior es el cable de referencia para proyectos SMB de volumen en Panamá, con alta disponibilidad en distribuidores locales y precio competitivo para instalaciones de entrada y mediana escala.",
    "apps": ["Cable UTP Cat5e / Cat6 para proyectos de volumen", "Cable coaxial RG59 / RG6 para sistemas CCTV", "Cables eléctricos para alimentación de dispositivos", "Alta disponibilidad y distribución inmediata en Panamá"],
    "notas": [],
},
"cablofil": {
    "name": "Cablofil", "tier": "Transversal", "badge": "TRANSVERSAL",
    "verticals": ["infra"], "logo": None,
    "segment": ["Toda instalación con rack o canalización"],
    "desc": "Cablofil es el sistema de bandejas portacables de malla metálica que AMTECH incluye en toda instalación profesional. Diferencia visiblemente una instalación técnica de una informal y es parte de la promesa de calidad y orden de AMTECH.",
    "apps": ["Bandejas portacables de malla metálica (wire mesh)", "Escalerillas y soportes para tendido aéreo", "Uniones, curvas y soportes de pared", "Compatible con cableado Cat6, fibra óptica y cableado eléctrico"],
    "notas": [],
},
"microsoft": {
    "name": "Microsoft", "tier": "Fundación", "badge": "FUNDACIÓN",
    "verticals": ["ciber"], "logo": "microsoft.svg",
    "segment": ["Toda empresa con Windows"],
    "desc": "Microsoft es la capa de fundación de la ciberseguridad para cualquier empresa que opere con Windows. AMTECH gestiona licencias de Microsoft 365 Business Premium y sus componentes de seguridad como primera línea de protección digital.",
    "apps": ["Microsoft 365 Business Premium – Suite + seguridad integrada", "Microsoft Defender for Business – Antivirus/EDR gestionado", "Entra ID (Azure AD) – Identidad, MFA y acceso condicional", "Microsoft Intune – MDM para gestión de dispositivos", "Microsoft Purview – Protección de datos y DLP básico", "OneDrive + SharePoint – Backup y colaboración segura"],
    "notas": [("Modelo comercial", "Licencia mensual por usuario — AMTECH gestiona y cobra un margen de reventa mensual recurrente.")],
},
}

E = html.escape

def head(title, desc, canonical):
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<link rel="icon" type="image/png" href="/assets/logo-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/marcas.css">
</head>
<body>"""

def header(marcas_activa=False):
    return f"""
<header>
  <nav class="nav">
    <a href="/" class="marca"><img src="/assets/logo-icon.png" alt="AM TECH Security"><span class="nombre">AM <span>TECH</span><small>Security</small></span></a>
    <div class="nav-links">
      <a href="/">Inicio</a>
      <a href="/marcas/"{' class="activo"' if marcas_activa else ''}>Marcas</a>
      <a href="/#servicios">Servicios</a>
      <a href="/#contacto">Contacto</a>
      <a href="https://wa.me/{WA}?text={urllib.parse.quote('Hola, quiero una cotización con AM TECH Security')}" target="_blank" rel="noopener" class="btn">Cotizar</a>
    </div>
  </nav>
</header>"""

FOOTER = f"""
<footer>
  <div class="contenedor">
    <a href="/" class="marca"><img src="/assets/logo-icon.png" alt="AM TECH Security"><span class="nombre">AM <span>TECH</span><small>Security</small></span></a>
    <p>Protegemos · Conectamos · Aseguramos</p>
    <p><a href="tel:+{WA}">+507 6841-3993</a> · <a href="mailto:info@amtechsecurity.net">info@amtechsecurity.net</a> · <a href="/marcas/">Todas las marcas</a></p>
    <p>© <span id="y"></span> AM TECH Security · Panamá</p>
  </div>
  <script>document.getElementById('y').textContent=new Date().getFullYear()</script>
</body>
</html>"""

def logo_html_card(b):
    if b["logo"]:
        return f'<span class="logo-box"><img src="/assets/marcas/{b["logo"]}" alt="{E(b["name"])}" loading="lazy"></span>'
    return f'<span class="logo-box"><span class="wm">{E(b["name"])}</span></span>'

def render_apps(apps):
    if isinstance(apps, dict):
        out = []
        for sec, items in apps.items():
            lis = "".join(f"<li>{E(i)}</li>" for i in items)
            out.append(f'<div class="app-seccion"><h3>{E(sec)}</h3><ul class="app-lista">{lis}</ul></div>')
        return "\n".join(out)
    lis = "".join(f"<li>{E(i)}</li>" for i in apps)
    return f'<ul class="app-lista">{lis}</ul>'

def render_subpage(slug, b):
    vert_key = b["verticals"][0]
    vert = VERTICALES[vert_key]
    verts_txt = " · ".join(VERTICALES[v] for v in b["verticals"])
    canonical = f"{SITE}/marcas/{slug}/"
    title = f'{b["name"]} en Panamá | AMTECH Security'
    desc = f'AMTECH Security implementa soluciones {b["name"]} en Panamá para {", ".join(b["segment"]).lower()}. {b["desc"].split(".")[0]}. Contáctenos.'
    wa = f'https://wa.me/{WA}?text=' + urllib.parse.quote(f'Hola, quiero un diagnóstico sin costo (interés: {b["name"]})')

    if b["logo"]:
        marca_visual = f'<img class="marca-logo" src="/assets/marcas/{b["logo"]}" alt="{E(b["name"])}">'
    else:
        marca_visual = f'<div class="marca-wordmark">{E(b["name"])}</div>'

    notas = "".join(
        f'<div class="nota-box"><div class="et">{E(lab)}</div><p>{E(txt)}</p></div>'
        for lab, txt in b["notas"]
    )
    tags = "".join(f"<span>{E(s)}</span>" for s in b["segment"])
    rango = f'<div class="meta-bloque"><div class="et">Rango de proyecto</div><div class="rango">{E(b["range"])}</div></div>' if b.get("range") else ""

    return f"""{head(title, desc, canonical)}
{header(marcas_activa=True)}
<div class="contenedor">
  <nav class="breadcrumb"><a href="/">Inicio</a><span>›</span><a href="/marcas/">Marcas</a><span>›</span>{E(vert)}<span>›</span>{E(b["name"])}</nav>

  <section class="marca-hero">
    <div class="eyebrow">{E(verts_txt)} · {E(b["tier"])}</div>
    {marca_visual}
    <h1>{E(b["name"])}</h1>
    <p class="desc">{E(b["desc"])}</p>
    <div class="meta-row">
      <div class="meta-bloque"><div class="et">Tier</div><span class="tier">{E(b["badge"])}</span></div>
      <div class="meta-bloque"><div class="et">Segmento objetivo</div><div class="tags">{tags}</div></div>
      {rango}
    </div>
  </section>

  <section class="aplicaciones">
    <h2>Aplicaciones en AMTECH</h2>
    {render_apps(b["apps"])}
    {notas}
  </section>

  <section class="cta-marca">
    <h2>¿Te interesa una solución {E(b["name"])}?</h2>
    <p>Te asesoramos sin costo y diseñamos la propuesta a la medida de tu proyecto.</p>
    <div class="cta-acciones">
      <a class="btn" href="{wa}" target="_blank" rel="noopener">Solicitar diagnóstico sin costo</a>
      <a class="btn-borde" href="/marcas/">Ver todas las marcas</a>
    </div>
  </section>
</div>
{FOOTER}"""

def render_hub():
    canonical = f"{SITE}/marcas/"
    title = "Marcas y Tecnologías | AMTECH Security Panamá"
    desc = "Portafolio de marcas que AMTECH Security implementa en Panamá: videovigilancia, redes, cableado, protección eléctrica y ciberseguridad. Hikvision, Dahua, UniFi, Fortinet, Microsoft y más."
    secciones = []
    sub = {
        "seguridad": "Videovigilancia, control de acceso y monitoreo inteligente.",
        "infra": "Redes, WiFi, servidores, cableado estructurado y protección eléctrica.",
        "ciber": "Protección perimetral, identidad, endpoints y continuidad.",
    }
    for vkey, vname in VERTICALES.items():
        cards = []
        for slug in HUB[vkey]:
            b = BRANDS[slug]
            cards.append(f"""      <a class="marca-card" href="/marcas/{slug}/">
        {logo_html_card(b)}
        <h3>{E(b["name"])}</h3>
        <span class="tier">{E(b["badge"])}</span>
        <span class="ver">Ver soluciones →</span>
      </a>""")
        secciones.append(f"""  <section class="vertical">
    <h2>{E(vname)}</h2>
    <p class="vsub">{E(sub[vkey])}</p>
    <div class="marcas-grid">
{chr(10).join(cards)}
    </div>
  </section>""")
    wa = f'https://wa.me/{WA}?text=' + urllib.parse.quote('Hola, no sé qué necesito. Quiero un diagnóstico sin costo')
    return f"""{head(title, desc, canonical)}
{header(marcas_activa=True)}
<div class="contenedor">
  <nav class="breadcrumb"><a href="/">Inicio</a><span>›</span>Marcas</nav>
  <section class="hub-hero">
    <h1>Nuestras <span class="grad-texto">marcas y tecnologías</span></h1>
    <p>Seleccionamos cada marca por su soporte local, garantía, escalabilidad y relación costo-beneficio. Trabajamos solo con tecnologías que podemos respaldar en Panamá.</p>
  </section>
{chr(10).join(secciones)}
  <section class="hub-cta">
    <h2>¿No sabe qué necesita?</h2>
    <p>Solicite un diagnóstico sin costo y le recomendamos la solución correcta.</p>
    <a class="btn" href="{wa}" target="_blank" rel="noopener">Solicitar diagnóstico sin costo</a>
  </section>
</div>
{FOOTER}"""

def render_sitemap():
    urls = ["/", "/marcas/"] + [f"/marcas/{slug}/" for slug in BRANDS]
    items = "".join(f"  <url><loc>{SITE}{u}</loc></url>\n" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}</urlset>\n'

def main():
    md = os.path.join(BASE, "marcas")
    os.makedirs(md, exist_ok=True)
    with open(os.path.join(md, "index.html"), "w", encoding="utf-8") as f:
        f.write(render_hub())
    n = 0
    for slug, b in BRANDS.items():
        d = os.path.join(md, slug)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "index.html"), "w", encoding="utf-8") as f:
            f.write(render_subpage(slug, b))
        n += 1
    with open(os.path.join(BASE, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(render_sitemap())
    print(f"Hub + {n} subpáginas + sitemap.xml generados en {md}")

if __name__ == "__main__":
    main()
