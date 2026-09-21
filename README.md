# Apliknte — job application tracker

*[Leer en español](#español)*

A small web app to log job applications in seconds and always know which ones
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

Date logic has a small test suite: `npm test`.

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

Una pequeña web para registrar candidaturas de empleo en segundos y saber
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

### Cómo se hizo

Construida con [Claude Code](https://claude.com/claude-code) y los plugins
agent-skills, ponytail, graphify y ui-ux-pro-max (detalle arriba, en la
sección *How it was built*). Las decisiones de producto y su porqué están en
[`docs/intent/tracker.md`](docs/intent/tracker.md).

### Arrancarla en local

Necesitas Node.js 20 o superior y un proyecto gratuito de Supabase.

1. Clona el repositorio y ejecuta `npm install`.
2. En Supabase, abre **SQL Editor** y ejecuta
   [`supabase/schema.sql`](supabase/schema.sql).
3. Copia `.env.example` como `.env.local` y rellena la URL del proyecto y la
   clave publishable, que están en **Project Settings → API Keys**. Nunca
   pongas aquí la clave secreta (`service_role`).
4. `npm run dev` y abre http://localhost:3000.

Las comprobaciones de fechas se ejecutan con `npm test`.

Cualquier crítica, sugerencia o mejora es bienvenida.

### Licencia

[MIT](LICENSE) © 2026 Román Diaz Yari
