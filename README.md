# pathly

> Elige el movimiento que sirve al propósito.

Pathly es una herramienta personal de priorización. En lugar de gestionar listas interminables, te ayuda a clasificar tus acciones por instinto primero — y contrastar esa visión con la IA después.

---

## La idea

La mayoría de apps de productividad asumen que ya sabes qué es importante. Pathly parte de otra pregunta: *¿esto sirve a tu propósito o solo suma ruido?*

Cada acción se evalúa contra tus propósitos personales (editables, con iconos, colores y peso de importancia). Tú clasificas primero con el instinto. La IA opina después. El contraste entre ambas visiones es donde está el valor.

---

## Funcionalidades

**Captura** — Vuelca todas tus acciones sin filtrar. Sin orden, sin juicio.

**Propósitos editables** — Define tus propios propósitos con nombre, icono, color y peso (×1, ×2, ×3). Por defecto: Alma, Ingreso, Curiosidad.

**Swipe** — Las acciones aparecen una a una. Clasifica por instinto deslizando o con los botones. Si no tienes claro una acción, "mantener · IA decide".

**Tracker** — Checklist completa con todas tus acciones clasificadas. Marca como completada con un toque.

**Dashboard** — Métricas de progreso, distribución por propósito y barra de avance. La IA puede opinar sobre el panorama cuando la conectes.

**Hangar IA** — Análisis completo de todas las acciones de golpe: propósitos sugeridos, estimación de tiempo y razonamiento. El prompt incluye tus propósitos personalizados y sus pesos.

**Historial** — Cada sesión de clasificación queda registrada con fecha y distribución.

---

## Stack

- React 18 + Vite
- CSS variables (sin frameworks)
- Google Fonts: Fraunces + Instrument Sans
- IA: Gemini 2.0 Flash (opcional, ver más abajo)

---

## Instalación

```bash
git clone https://github.com/tu-usuario/pathly.git
cd pathly
npm install
npm run dev
```

---

## Deploy en Vercel

```bash
vercel --prod
```

O conecta el repositorio en [vercel.com/new](https://vercel.com/new) para deploys automáticos en cada push.

---

## Activar la IA (opcional)

La app funciona al 100% sin IA. Cuando quieras activarla:

1. Obtén una API Key gratuita en [Google AI Studio](https://aistudio.google.com)
2. En Vercel → Settings → Environment Variables, añade:

```
VITE_GEMINI_KEY=tu_api_key_aquí
```

3. En `src/App.jsx`, el prompt ya está construido dinámicamente con tus propósitos y pesos. Solo tienes que conectar la llamada a la API en el Hangar IA y el Dashboard.

---

## Roadmap

- [ ] Persistencia con localStorage
- [ ] Integración real con Gemini 2.0 Flash
- [ ] Opinión IA en Dashboard
- [ ] Modo revisión periódica ("¿sigues queriendo hacer esto?")
- [ ] Exportar sesión a Notion / CSV

---

## Origen

Pathly nació de una conversación socrática sobre qué significa realmente priorizar. La conclusión: no puedes priorizar bien si primero no sabes para qué. Los propósitos van antes que el plan.
