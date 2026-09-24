import { cookies } from "next/headers";
import Logo from "@/components/Logo";
import { title } from "@/lib/title";

export const generateMetadata = () => title("Ayuda", "Help");

// Las preguntas del principio son inventadas, de lo que creemos que va a preguntar la
// gente. Segun lleguen dudas de verdad por Sugerencias, se van anadiendo aqui.
export default async function Ayuda() {
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

      <div className="mt-8 grid gap-6">
        {t.faq.map((f) => (
          <section key={f.q}>
            <h2 className="font-medium">{f.q}</h2>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">{f.a}</p>
          </section>
        ))}
      </div>

      {/* La direccion, ademas de enlazada, escrita: si no tienes correo configurado en el
          movil, el enlace no hace nada y al menos se puede copiar. */}
      <div className="mt-10 rounded-2xl border border-border bg-surface p-4">
        <p className="font-medium">{t.moreTitle}</p>
        <p className="mt-1 text-[15px] leading-relaxed text-muted">
          {t.moreText}{" "}
          <a href="mailto:apliknte@gmail.com" className="text-brand hover:underline">
            apliknte@gmail.com
          </a>
          . {t.moreSuggest}
        </p>
      </div>
    </main>
  );
}

const ES = {
  back: "Volver",
  title: "Ayuda",
  moreTitle: "¿No está tu pregunta?",
  moreText: "Escríbenos a",
  moreSuggest: "Si es una idea o un fallo, el botón Sugerencias del menú es más rápido.",
  faq: [
    {
      q: "¿Cuánto cuesta?",
      a: "Nada. Ni ahora ni luego: no hay planes de pago ni anuncios. Buscar trabajo ya cuesta bastante.",
    },
    {
      q: "¿Tengo que descargar algo?",
      a: "No hace falta, funciona en el navegador. Pero si la quieres con su icono en la pantalla de inicio, entra en el menú y toca «Instalar en el móvil». Son dos segundos.",
    },
    {
      q: "¿Qué tengo que rellenar para apuntar una candidatura?",
      a: "Con la empresa y el puesto ya vale. El sueldo, la modalidad, el enlace o las notas son opcionales y puedes añadirlos cuando quieras con Editar. La idea es que apuntar una te lleve veinte segundos.",
    },
    {
      q: "¿Qué es la fecha de seguimiento?",
      a: "El recordatorio para dar el toque; por defecto te avisa a los 15 días. Si con esa empresa no hay a quién escribir, toca el aviso y dile «No hace falta contactar» y deja de darte la lata. O aplázalo 7 días si prefieres esperar un poco más.",
    },
    {
      q: "Marqué una como rechazada y ha desaparecido.",
      a: "Tranquilo, no se ha borrado. Las rechazadas y las retiradas salen de la lista para que veas solo lo que sigue vivo. Están todas en el botón «Rechazadas».",
    },
    {
      q: "¿Puedo guardar mi CV?",
      a: "Sí, en PDF y hasta 5 MB. Puedes tener varias versiones y marcar cuál mandaste a cada sitio, que luego nunca te acuerdas. Están en el menú, en «Mis CVs».",
    },
    {
      q: "¿Quién ve mis candidaturas?",
      a: "Solo tú. Ni otros usuarios ni las empresas. Está contado con detalle en Privacidad.",
    },
    {
      q: "Quiero la app en inglés, o en modo oscuro.",
      a: "Las dos cosas están en el menú de arriba a la derecha, y se quedan guardadas para la próxima vez.",
    },
    {
      q: "No me acuerdo de la contraseña.",
      a: "Pulsa «He olvidado mi contraseña» en la pantalla de entrar y te llega un correo para ponerte otra. Si no aparece, mira en spam.",
    },
    {
      q: "Tengo mis candidaturas en un Excel, ¿puedo traerlas?",
      a: "Todavía no, pero es lo siguiente que estamos haciendo. Si son pocas, apuntarlas a mano se hace más rápido de lo que parece.",
    },
    {
      q: "Quiero borrar mi cuenta.",
      a: "Puedes tú mismo, en el menú → «Borrar mi cuenta». Se va todo: candidaturas, CVs y cuenta. No guardamos copias, así que no hay vuelta atrás.",
    },
  ],
};

const EN = {
  back: "Back",
  title: "Help",
  moreTitle: "Can't find your question?",
  moreText: "Write to us at",
  moreSuggest: "If it's an idea or a bug, the Suggestions button in the menu is quicker.",
  faq: [
    {
      q: "How much does it cost?",
      a: "Nothing. Not now, not later: no paid plans, no ads. Job hunting is expensive enough already.",
    },
    {
      q: "Do I have to download anything?",
      a: "No need, it runs in your browser. But if you want it with its own icon on your home screen, open the menu and tap “Install on your phone”. Takes two seconds.",
    },
    {
      q: "What do I have to fill in to save an application?",
      a: "The company and the role are enough. Salary, work mode, link and notes are optional and you can add them later with Edit. The point is that saving one takes twenty seconds.",
    },
    {
      q: "What's the follow-up date?",
      a: "It's the reminder to chase them up; by default it nudges you 15 days after you applied. If there's nobody to write to at that company, tap the notice and pick “No need to follow up” and it stops bothering you. Or push it 7 days if you'd rather wait a bit longer.",
    },
    {
      q: "I marked one as rejected and it vanished.",
      a: "Don't worry, nothing was deleted. Rejected and withdrawn ones leave the list so you only see what's still alive. They're all in the “Rejected” button.",
    },
    {
      q: "Can I store my CV here?",
      a: "Yes, as PDF, up to 5 MB. You can keep several versions and mark which one you sent where, because you never remember later. They live in the menu, under “My CVs”.",
    },
    {
      q: "Who can see my applications?",
      a: "Only you. Not other users, not the companies. It's explained in detail on the Privacy page.",
    },
    {
      q: "I want the app in Spanish, or in dark mode.",
      a: "Both are in the menu at the top right, and they're remembered for next time.",
    },
    {
      q: "I forgot my password.",
      a: "Tap “I forgot my password” on the sign-in screen and you'll get an email to set a new one. If it doesn't show up, check your spam folder.",
    },
    {
      q: "My applications are in a spreadsheet, can I bring them over?",
      a: "Not yet, but it's the next thing we're building. If there aren't many, typing them in goes faster than you'd think.",
    },
    {
      q: "I want to delete my account.",
      a: "You can do it yourself, in the menu → “Delete my account”. Everything goes: applications, CVs and the account itself. We keep no copies, so there's no undo.",
    },
  ],
};
