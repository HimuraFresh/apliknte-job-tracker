import { cookies } from "next/headers";
import Logo from "@/components/Logo";
import { title } from "@/lib/title";

export const generateMetadata = () => title("Privacidad", "Privacy");

// El texto vive aqui y no en dict.ts: es largo, cambia poco y asi se lee de corrido.
// Publica a proposito (sin sesion): la gente tiene que poder leerla antes de registrarse.
export default async function Privacidad() {
  const en = (await cookies()).get("locale")?.value === "en";
  const t = en ? EN : ES;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <a href="/panel" className="text-xl">
          <Logo />
        </a>
        <a href="/panel" className="tap text-sm text-muted transition hover:text-foreground">
          ← {t.back}
        </a>
      </div>
      <h1 className="mt-6 text-2xl font-medium">{t.title}</h1>
      <p className="mt-1 text-sm text-muted">{t.updated}</p>

      <div className="mt-8 grid gap-6">
        {t.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-medium">{s.h}</h2>
            <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
}

const ES = {
  back: "Volver",
  title: "Privacidad",
  updated: "Última actualización: 24 de septiembre de 2026",
  sections: [
    {
      h: "Quién trata tus datos",
      p: "Apliknte. Para cualquier cosa relacionada con tus datos, escribe a apliknte@gmail.com y te contestamos.",
    },
    {
      h: "Qué guardamos",
      p: "Tu correo electrónico, para tener cuenta y poder entrar.\nLo que apuntas de cada candidatura: empresa, puesto, fechas, estado, salario, enlace y tus notas.\nLos CV en PDF que subas.\nNada más. No pedimos nombre, teléfono, dirección ni datos de pago.",
    },
    {
      h: "Dónde están",
      p: "En Supabase, con servidores en Fráncfort (Unión Europea). La aplicación se sirve desde Vercel. No se envían tus datos fuera de esos dos sitios.",
    },
    {
      h: "Quién puede verlos",
      p: "Solo tú. La base de datos tiene reglas que impiden que un usuario vea las filas de otro, y los PDF están en un almacén privado al que solo se accede con un enlace temporal generado para ti.\nQuien mantiene el servicio necesita acceso técnico a la base de datos; sin él no se pueden arreglar averías ni recuperar una copia de seguridad. Ese acceso está para eso. Si para resolver un problema que nos cuentes hiciera falta mirar una candidatura tuya, te lo pedimos antes.",
    },
    {
      h: "Cookies",
      p: "Solo las necesarias para que funcione: la de tu sesión, la del idioma y la del tema claro u oscuro. No hay publicidad ni rastreo, y por eso no verás un cartel de cookies.\nUsamos Vercel Analytics para saber cuánta gente entra y a qué páginas. No usa cookies ni identifica a nadie.",
    },
    {
      h: "Correos",
      p: "Solo te escribimos para confirmar tu cuenta o recuperar la contraseña. Salen de una cuenta de Gmail, así que Google procesa el envío. No hay boletines ni publicidad.",
    },
    {
      h: "Cuánto tiempo",
      p: "Mientras tengas la cuenta. Puedes borrarla cuando quieras desde el menú de la aplicación: se borran tu cuenta, tus candidaturas y tus CV, sin copias guardadas. Es inmediato y no tiene vuelta atrás.",
    },
    {
      h: "Tus derechos",
      p: "Puedes ver y corregir tus datos desde la propia aplicación, y borrarlos con el botón de borrar cuenta. Si quieres una copia de todo, pídela a apliknte@gmail.com.\nSi crees que no lo estamos haciendo bien, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).",
    },
    {
      h: "Si el proyecto cambia de manos",
      p: "Si algún día Apliknte se vendiera o se integrara en otra empresa, tus datos podrían transferirse a quien lo continúe. Te avisaríamos antes por correo, con tiempo para borrar tu cuenta si no te interesa.",
    },
    {
      h: "Cambios",
      p: "Si esta página cambia en algo importante, te avisamos por correo. La fecha de arriba dice cuándo se actualizó por última vez.",
    },
  ],
};

const EN = {
  back: "Back",
  title: "Privacy",
  updated: "Last updated: 24 September 2026",
  sections: [
    {
      h: "Who handles your data",
      p: "Apliknte. For anything about your data, write to apliknte@gmail.com and we'll get back to you.",
    },
    {
      h: "What we store",
      p: "Your email address, so you can have an account and sign in.\nWhat you write down for each application: company, role, dates, status, salary, link and your notes.\nThe CVs you upload as PDF.\nNothing else. We don't ask for your name, phone number, address or payment details.",
    },
    {
      h: "Where it lives",
      p: "On Supabase, with servers in Frankfurt (European Union). The app itself is served from Vercel. Your data isn't sent anywhere else.",
    },
    {
      h: "Who can see it",
      p: "Only you. The database has rules that stop one user from reading another user's rows, and the PDFs sit in a private store reachable only through a temporary link generated for you.\nWhoever runs the service needs technical access to the database; without it you can't fix breakages or restore a backup. That access is there for that. If fixing something you report meant opening one of your applications, we ask you first.",
    },
    {
      h: "Cookies",
      p: "Only the ones needed to make it work: your session, your language and your light or dark theme. There's no advertising and no tracking, which is why you won't see a cookie banner.\nWe use Vercel Analytics to know how many people visit and which pages. It uses no cookies and identifies no one.",
    },
    {
      h: "Emails",
      p: "We only email you to confirm your account or reset your password. They're sent from a Gmail account, so Google handles the delivery. No newsletters, no marketing.",
    },
    {
      h: "How long",
      p: "As long as you keep the account. You can delete it whenever you want from the app menu: your account, your applications and your CVs are removed, with no copies kept. It's immediate and can't be undone.",
    },
    {
      h: "Your rights",
      p: "You can see and correct your data inside the app, and delete it with the delete account button. If you want a copy of everything, ask at apliknte@gmail.com.\nIf you think we're getting this wrong, you can complain to the Spanish Data Protection Agency (aepd.es).",
    },
    {
      h: "If the project changes hands",
      p: "If Apliknte were ever sold or absorbed by another company, your data could be transferred to whoever continues it. We'd email you first, with time to delete your account if you'd rather not.",
    },
    {
      h: "Changes",
      p: "If anything important on this page changes, we'll email you. The date above says when it was last updated.",
    },
  ],
};
