# Apliknte — job application tracker

*[Leer en español](#español)*

A web app to log job applications in seconds and always know which ones
need a follow-up. It replaces the spreadsheet most of us end up with: three
columns at first, an unreadable endless scroll two months later.

## What it does

- **Log an application in ~20 seconds.** Company and role autocomplete from
  what you've typed before; work mode, status and source are one-tap buttons.
- **Follow-up reminders.** A follow-up date is suggested 15 days after you
  apply (and assigned automatically if you skip it). Cards turn amber when
  it's overdue, until you mark it as done.
- **Status from the card.** Tap the status badge to move an application
  forward: no reply → they reached out → 1st/2nd/3rd interview → offer →
  hired, or rejected / withdrew.
- **Summary at a glance.** Active, waiting for a reply, interviewing, and
  follow-ups due.
- **Edit and delete**, with a two-tap confirmation for deleting.
- **Spanish and English**, switchable at any time.
- **Accounts** with email and password, including password reset.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Supabase](https://supabase.com): Postgres, auth, and row-level security so
  every user can only ever read and write their own rows
- [Tailwind CSS 4](https://tailwindcss.com)
- Deployed on [Vercel](https://vercel.com)

Everything runs on free tiers.

## How it was built

This project was built with [Claude Code](https://claude.com/claude-code),
using a few plugins that change how the model works:

- **[agent-skills](https://github.com/addyosmani/agent-skills)** (Addy Osmani):
  a structured interview before writing any code, to pin down what the tool
  actually had to solve.
- **[ponytail](https://github.com/DietrichGebert/ponytail)**: pushes towards
  the simplest solution that works. Several planned features were dropped
  because of it (a one-off importer, a pre-loaded list of 1,000 companies, an
  ad slot with no advertisers).
- **[graphify](https://github.com/Graphify-Labs/graphify)** and
  **[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)**:
  installed for the upcoming phases (code map and visual design).

The product decisions and their reasoning are written down in
[`docs/intent/tracker.md`](docs/intent/tracker.md) (in Spanish).

## Run it locally

You need Node.js 20+ and a free Supabase project.

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/HimuraFresh/apliknte-job-tracker.git
   cd apliknte-job-tracker
   npm install
   ```
2. In your Supabase project, open **SQL Editor** and run
   [`supabase/schema.sql`](supabase/schema.sql). It creates the tables and the
   row-level security policies.
3. Copy `.env.example` to `.env.local` and fill in your project URL and
   publishable (anon) key, from **Project Settings → API Keys**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```
   Never put the `service_role` / secret key in this app.
4. Start it and open http://localhost:3000:
   ```bash
   npm run dev
   ```

Date logic is covered by automated tests: `npm test`.

## Roadmap

- [x] Accounts, quick entry, status and follow-up from the card, edit/delete, summary
- [ ] Public deployment
- [ ] Search, filters, and grouping by company and by role
- [ ] Upload CVs as PDF and tag which one you sent
- [ ] Visual polish and installable mobile app (PWA)
- [ ] CSV export

Feedback, issues and pull requests are very welcome.

## License

[MIT](LICENSE) © 2026 Román Diaz Yari

---

## Español

Una aplicación web para registrar candidaturas de empleo en segundos y saber
siempre a cuáles toca hacer seguimiento. Sustituye a la hoja de cálculo con la
que casi todos acabamos: tres columnas al principio y un scroll infinito que
nadie entiende a los dos meses.

### Qué hace

- **Registrar una candidatura en unos 20 segundos.** Empresa y puesto se
  autocompletan con lo que ya escribiste; modalidad, estado y vía son botones.
- **Avisos de seguimiento.** Propone una fecha a 15 días de la aplicación (y
  la asigna sola si no eliges ninguna). La ficha se pone en ámbar cuando se
  pasa la fecha, hasta que marcas que ya contactaste.
- **Estado desde la propia ficha**: sin respuesta → me contactaron → 1ª, 2ª,
  3ª entrevista → oferta recibida → contratado, o rechazado / me retiré.
- **Resumen de un vistazo**: en marcha, sin respuesta, en entrevistas y
  seguimientos pendientes.
- **Editar y borrar**, con confirmación en dos toques para borrar.
- **Español e inglés**, se cambia en cualquier momento.
- **Cuentas** con correo y contraseña, incluida la recuperación.

### Tecnologías

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Supabase](https://supabase.com): Postgres, autenticación y seguridad a
  nivel de fila, para que cada usuario solo pueda leer y escribir sus propios
  datos
- [Tailwind CSS 4](https://tailwindcss.com)
- Desplegada en [Vercel](https://vercel.com)

Todo funciona con planes gratuitos.

### Cómo se hizo

Este proyecto se construyó con [Claude Code](https://claude.com/claude-code),
usando varios plugins que cambian la forma de trabajar del modelo:

- **[agent-skills](https://github.com/addyosmani/agent-skills)** (Addy Osmani):
  una entrevista estructurada antes de escribir código, para concretar qué
  problema tenía que resolver de verdad la herramienta.
- **[ponytail](https://github.com/DietrichGebert/ponytail)**: empuja hacia la
  solución más simple que funcione. Por eso se descartaron varias funciones
  previstas (un importador de un solo uso, una lista precargada de 1.000
  empresas y un espacio publicitario sin anunciantes).
- **[graphify](https://github.com/Graphify-Labs/graphify)** y
  **[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)**:
  instalados para las próximas fases (mapa del código y diseño visual).

Las decisiones de producto y su porqué están en
[`docs/intent/tracker.md`](docs/intent/tracker.md).

### Arrancarla en local

Necesitas Node.js 20 o superior y un proyecto gratuito de Supabase.

1. Clona el repositorio e instala las dependencias:
   ```bash
   git clone https://github.com/HimuraFresh/apliknte-job-tracker.git
   cd apliknte-job-tracker
   npm install
   ```
2. En tu proyecto de Supabase, abre **SQL Editor** y ejecuta
   [`supabase/schema.sql`](supabase/schema.sql). Crea las tablas y las reglas
   de seguridad a nivel de fila.
3. Copia `.env.example` como `.env.local` y rellena la URL del proyecto y la
   clave publishable (anon), que están en **Project Settings → API Keys**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```
   Nunca pongas en esta app la clave secreta (`service_role`).
4. Arráncala y abre http://localhost:3000:
   ```bash
   npm run dev
   ```

La lógica de fechas está cubierta por tests automáticos: `npm test`.

### Hoja de ruta

- [x] Cuentas, alta rápida, estado y seguimiento desde la ficha, editar y borrar, resumen
- [ ] Despliegue público
- [ ] Buscador, filtros y agrupación por empresa y por puesto
- [ ] Subir CVs en PDF y marcar cuál enviaste
- [ ] Pulido visual y app instalable en el móvil (PWA)
- [ ] Exportar a CSV

Cualquier crítica, sugerencia, issue o pull request es bienvenida.

### Licencia

[MIT](LICENSE) © 2026 Román Diaz Yari
