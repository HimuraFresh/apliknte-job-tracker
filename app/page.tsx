import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";


const BLOQUES = [
  {
    guia: "Apuntar",
    titulo: "Una candidatura en veinte segundos",
    texto:
      "Empresa y puesto se autocompletan con lo que ya has escrito antes; el resto son botones. Si tardas más de lo que tardarías en anotarlo en un papel, no lo vas a usar.",
    src: "/bloque-apuntar.webp",
    oscuro: "/bloque-apuntar-oscuro.webp",
    alt: "El formulario de nueva candidatura, con empresa, puesto, estado y modalidad",
    ancho: 760,
    alto: 644,
  },
  {
    guia: "No perder el hilo",
    titulo: "Te avisa de a quién toca dar el toque",
    texto:
      "A los quince días la ficha te lo dice sola. Y si con esa empresa no hay a quién escribir, lo aplazas o lo apagas: la que no quieres seguir deja de darte la lata.",
    src: "/bloque-aviso.webp",
    oscuro: "/bloque-aviso-oscuro.webp",
    alt: "Tres candidaturas en la lista, una de ellas avisando de que deberías haber contactado hace un día",
    ancho: 896,
    alto: 628,
  },
  {
    guia: "Empezar",
    titulo: "Trae tu hoja de cálculo entera",
    texto:
      "Arrastras el CSV o pegas las celdas y te las reconoce aunque tus columnas se llamen de otra manera. No empiezas de cero ni pierdes lo que llevas apuntado.",
    src: "/bloque-importar.webp",
    oscuro: "/bloque-importar-oscuro.webp",
    alt: "El panel de importar, con sus tres formas de traer la hoja de cálculo",
    ancho: 820,
    alto: 333,
  },
];


// La portada publica: lo primero que ve quien no tiene cuenta. Quien si la tiene no
// pasa por aqui, el middleware lo manda derecho al panel.
export default function Inicio() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-5xl px-6 pb-16 pt-14 sm:px-8 sm:pt-20">
        <h1 className="baja text-3xl sm:text-4xl" style={{ animationDelay: "100ms" }}>
          <Logo />
        </h1>

        <p className="mt-8 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          <span className="baja block" style={{ animationDelay: "250ms" }}>
            Tus candidaturas,
          </span>
          <span className="sube block" style={{ animationDelay: "250ms" }}>
            <span className="text-brand">ordenadas</span>.
          </span>
        </p>

        <p className="sube mt-5 max-w-xl text-lg text-muted sm:text-xl" style={{ animationDelay: "700ms" }}>
          Apunta a qué trabajos echas el currículum y no pierdas el hilo. Te avisa de a
          cuáles toca dar el toque y las ves todas de un vistazo.
        </p>

        <div className="sube mt-8 flex flex-wrap items-center gap-4" style={{ animationDelay: "1000ms" }}>
          <Link
            href="/entrar"
            className="rounded-xl bg-brand px-6 py-3.5 text-base font-medium text-on-solid transition hover:opacity-90"
          >
            Crear cuenta gratis
          </Link>
          <Link href="/entrar" className="tap text-base text-muted transition hover:text-foreground">
            Ya tengo cuenta
          </Link>
        </div>

        <p className="sube mt-5 text-sm text-muted" style={{ animationDelay: "1250ms" }}>Gratis · Sin anuncios · Código abierto</p>

        {/* La app de verdad, no un dibujo. En el movil se enseña su propia pantalla
            de movil, que es como la usa la gente. */}
        <div
          className="crece mt-12 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl sm:mt-16"
          style={{ animationDelay: "1400ms" }}
        >
          <Image
            src="/app-escritorio.webp"
            alt="La pantalla de Apliknte con las candidaturas, sus estados y el aviso de seguimiento"
            width={1120}
            height={1020}
            priority
            className="solo-claro hidden w-full sm:block"
          />
          <Image
            src="/app-escritorio-oscuro.webp"
            alt=""
            aria-hidden
            width={1120}
            height={1020}
            priority
            className="solo-oscuro hidden w-full sm:block"
          />
          <Image
            src="/app-movil.webp"
            alt="Apliknte en el móvil, con la lista de candidaturas"
            width={540}
            height={1020}
            priority
            className="solo-claro w-full sm:hidden"
          />
          <Image
            src="/app-movil-oscuro.webp"
            alt=""
            aria-hidden
            width={540}
            height={1020}
            priority
            className="solo-oscuro w-full sm:hidden"
          />
        </div>
      </section>

      {/* Tres bloques grandes, uno por lo que de verdad hace la app. Cada uno con su
          propia captura: no son dibujos ni promesas, es la pantalla que te vas a
          encontrar. Se alternan de lado en el ordenador; en el movil van apilados. */}
      <section className="mx-auto grid w-full max-w-5xl gap-16 px-6 py-8 sm:gap-24 sm:px-8 sm:py-16">
        {BLOQUES.map((b, i) => (
          <article
            key={b.src}
            className={`grid items-center gap-8 sm:grid-cols-2 sm:gap-14 ${
              i % 2 === 1 ? "sm:[&>figure]:order-first" : ""
            }`}
          >
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand">{b.guia}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{b.titulo}</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">{b.texto}</p>
            </div>
            <figure className="m-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
              {[b.src, b.oscuro].map((src, n) => (
                <Image
                  key={src}
                  src={src}
                  alt={n === 0 ? b.alt : ""}
                  width={b.ancho}
                  height={b.alto}
                  aria-hidden={n === 1}
                  className={`w-full ${n === 0 ? "solo-claro" : "solo-oscuro"}`}
                />
              ))}
            </figure>
          </article>
        ))}
      </section>

      {/* El cierre: el mismo boton de arriba, para quien ha bajado leyendo y ya no lo
          tiene a mano, y los enlaces que uno busca antes de registrarse en algo. */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-4 sm:px-8 sm:pb-28">
        <div className="rounded-3xl border border-border bg-surface px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Empieza por las que ya tienes apuntadas
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Crear la cuenta lleva un minuto y traer tu hoja de cálculo, otro. No hay nada
            que pagar ni que configurar.
          </p>
          <Link
            href="/entrar"
            className="mt-8 inline-block rounded-xl bg-brand px-6 py-3.5 text-base font-medium text-on-solid transition hover:opacity-90"
          >
            Crear cuenta gratis
          </Link>
          <p className="mt-6 text-sm text-muted">
            Tus datos en servidores europeos · Puedes borrar tu cuenta entera cuando quieras
          </p>
        </div>

        <nav className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted">
          <Link href="/ayuda" className="tap transition hover:text-foreground">
            Ayuda
          </Link>
          <Link href="/privacidad" className="tap transition hover:text-foreground">
            Privacidad
          </Link>
          <a
            href="https://github.com/HimuraFresh/apliknte-job-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="tap transition hover:text-foreground"
          >
            El código, en GitHub
          </a>
        </nav>
      </section>
    </main>
  );
}
