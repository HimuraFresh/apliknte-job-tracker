# Apliknte — job application tracker

**Try it live: [apliknte.vercel.app](https://apliknte.vercel.app)** · *[Leer en español](#español)*

A web app to log job applications in seconds and always know which ones
need a follow-up. It replaces the spreadsheet most of us end up with: three
columns at first, an unreadable endless scroll two months later.

## What it does

- **Log an application in ~20 seconds.** Company and role autocomplete from
  what you've typed before (plus ~450 companies that hire in Spain); work
  mode, status and source are one-tap buttons.
- **Follow-up reminders.** A follow-up date is suggested 15 days after you
  apply (and assigned automatically if you skip it). Cards turn amber when
  it's overdue. Tap the notice to push it a week, or turn it off entirely for
  the companies where there's nobody to write to.
- **Compact cards.** Each card shows the essentials; tap it to see the
  details, the CV you sent and your notes (red flags, the recruiter's name…).
- **Status from the card.** Tap the status badge to move an application
  forward: no reply → they reached out → 1st/2nd/3rd interview → offer →
  hired, or rejected / withdrew.
- **Rejected ones get out of the way.** Rejected and withdrawn applications
  leave the list and wait behind a *Rejected* button, so you only see what's
  still alive.
- **Find anything.** Search by company or role, filter by work mode, source
  or date, or view by company or by role. The summary tiles (active, waiting,
  interviewing, follow-ups due) filter too.
- **CVs as PDF**, tagged by type ("Data CV", "ATS CV"…), so you know which one
  you sent where.
- **Edit and delete**, with a two-tap confirmation for deleting.
- **Install it on your phone (PWA).** No store and no download: install it
  from the browser and it gets its own icon and runs full screen.
- **Spanish and English, light and dark mode.**
- **Accounts** with email and password, including password reset.
- **Help and privacy pages**, and you can delete your account — with its
  applications and CVs — yourself, from the menu.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Supabase](https://supabase.com): Postgres, auth, and row-level security so
  every user can only ever read and write their own rows
- [Tailwind CSS 4](https://tailwindcss.com)
- Deployed on [Vercel](https://vercel.com) at [apliknte.vercel.app](https://apliknte.vercel.app)

Everything runs on free tiers.

## How it was built

This project was built with [Claude Code](https://claude.com/claude-code),
using a few plugins that change how the model works:

- **[agent-skills](https://github.com/addyosmani/agent-skills)** (Addy Osmani):
  a structured interview before writing any code, to pin down what the tool
  actually had to solve.
- **[ponytail](https://github.com/DietrichGebert/ponytail)**: pushes towards
  the simplest solution that works. Several planned features were dropped or
  trimmed because of it: a one-off importer, an ad slot with no advertisers,
  and a list of 1,000 companies that ended up as ~450 suggestions.
- **[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)**:
  used for the design pass — contrast ratios, touch target sizes and screen
  reader announcements were measured, not eyeballed.
- **[graphify](https://github.com/Graphify-Labs/graphify)**: a code map of the
  project.

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
   [`supabase/schema.sql`](supabase/schema.sql). It creates the tables, the CV
   storage, the row-level security policies and the function that lets a user
   delete their own account.
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

Dates, password rules and grouping are covered by automated tests: `npm test`.

## Roadmap

- [x] Accounts, quick entry, status and follow-up from the card, edit/delete, summary
- [x] Public deployment
- [x] Search, filters, and grouping by company and by role
- [x] Upload CVs as PDF and tag which one you sent
- [x] Expandable cards and notes
- [x] Installable mobile app (PWA)
- [x] Accessibility pass, help page, privacy policy and account deletion
- [ ] CSV import and export

Feedback, issues and pull requests are very welcome.

## License

[MIT](LICENSE) © 2026 Román Diaz Yari

---

## Español

**Pruébala: [apliknte.vercel.app](https://apliknte.vercel.app)**

Una aplicación web para registrar candidaturas de empleo en segundos y saber
siempre a cuáles toca hacer seguimiento. Sustituye a la hoja de cálculo con la
que casi todos acabamos: tres columnas al principio y un scroll infinito que
nadie entiende a los dos meses.

### Qué hace

- **Registrar una candidatura en unos 20 segundos.** Empresa y puesto se
  autocompletan con lo que ya escribiste (y con unas 450 empresas que
  contratan en España); modalidad, estado y vía son botones.
- **Avisos de seguimiento.** Propone una fecha a 15 días de la aplicación (y
  la asigna sola si no eliges ninguna). La ficha se pone en ámbar cuando se
  pasa la fecha. Toca el aviso para aplazarlo una semana, o para apagarlo del
  todo en esas empresas donde no hay a quién escribir.
- **Fichas compactas.** Cada ficha enseña lo esencial; al tocarla ves los
  detalles, el CV que enviaste y tus notas (red flags, el nombre del recruiter…).
- **Estado desde la propia ficha**: sin respuesta → me contactaron → 1ª, 2ª,
  3ª entrevista → oferta recibida → contratado, o rechazado / me retiré.
- **Las rechazadas no estorban.** Las rechazadas y las retiradas salen de la
  lista y esperan detrás de un botón *Rechazadas*, para que solo veas lo que
  sigue vivo.
- **Encuentra cualquier candidatura.** Busca por empresa o puesto, filtra por
  modalidad, vía o fecha, o míralas por empresa o por puesto. Los recuadros del
  resumen (en marcha, sin respuesta, en entrevistas, toca contactar) también
  filtran.
- **CVs en PDF** con su tipo ("CV Data", "CV ATS"…), para saber cuál enviaste
  a cada sitio.
- **Editar y borrar**, con confirmación en dos toques para borrar.
- **Instálala en el móvil (PWA).** Sin tiendas y sin descargas: se instala
  desde el navegador, se queda con su icono y se abre a pantalla completa.
- **Español e inglés, modo claro y oscuro.**
- **Cuentas** con correo y contraseña, incluida la recuperación.
- **Páginas de ayuda y privacidad**, y puedes borrar tu cuenta —con sus
  candidaturas y sus CVs— tú mismo, desde el menú.

### Tecnologías

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Supabase](https://supabase.com): Postgres, autenticación y seguridad a
  nivel de fila, para que cada usuario solo pueda leer y escribir sus propios
  datos
- [Tailwind CSS 4](https://tailwindcss.com)
- Desplegada en [Vercel](https://vercel.com) en [apliknte.vercel.app](https://apliknte.vercel.app)

Todo funciona con planes gratuitos.

### Cómo se hizo

Este proyecto se construyó con [Claude Code](https://claude.com/claude-code),
usando varios plugins que cambian la forma de trabajar del modelo:

- **[agent-skills](https://github.com/addyosmani/agent-skills)** (Addy Osmani):
  una entrevista estructurada antes de escribir código, para concretar qué
  problema tenía que resolver de verdad la herramienta.
- **[ponytail](https://github.com/DietrichGebert/ponytail)**: empuja hacia la
  solución más simple que funcione. Por eso se descartaron o recortaron varias
  funciones previstas: un importador de un solo uso, un espacio publicitario
  sin anunciantes y una lista de 1.000 empresas que se quedó en unas 450
  sugerencias.
- **[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)**:
  usado en el repaso de diseño: los contrastes, el tamaño de las zonas táctiles
  y los avisos para lectores de pantalla se midieron, no se miraron a ojo.
- **[graphify](https://github.com/Graphify-Labs/graphify)**: un mapa del código
  del proyecto.

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
   [`supabase/schema.sql`](supabase/schema.sql). Crea las tablas, el almacén
   de CVs, las reglas de seguridad a nivel de fila y la función con la que
   cada usuario puede borrar su propia cuenta.
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

Las fechas, las reglas de contraseña y la agrupación están cubiertas por
tests automáticos: `npm test`.

### Hoja de ruta

- [x] Cuentas, alta rápida, estado y seguimiento desde la ficha, editar y borrar, resumen
- [x] Despliegue público
- [x] Buscador, filtros y agrupación por empresa y por puesto
- [x] Subir CVs en PDF y marcar cuál enviaste
- [x] Fichas desplegables y notas
- [x] App instalable en el móvil (PWA)
- [x] Repaso de accesibilidad, ayuda, privacidad y borrado de cuenta
- [ ] Importar y exportar CSV

Cualquier crítica, sugerencia, issue o pull request es bienvenida.

### Licencia

[MIT](LICENSE) © 2026 Román Diaz Yari
