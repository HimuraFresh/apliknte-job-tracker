import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import { title } from "@/lib/title";

export const generateMetadata = () => title("Inicio", "Home");

const BLOQUES = [
  {
    guia: "Apuntar",
    titulo: "Una candidatura en veinte segundos",
    texto:
      "Empresa y puesto se autocompletan con lo que ya has escrito antes; el resto son botones. Si tardas más de lo que tardarías en anotarlo en un papel, no lo vas a usar.",
    src: "/bloque-apuntar.webp",
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
    alt: "Una candidatura con el aviso: deberías haber contactado hace un día",
    ancho: 820,
    alto: 123,
    aire: true,
  },
  {
    guia: "Empezar",
    titulo: "Trae tu hoja de cálculo entera",
    texto:
      "Arrastras el CSV o pegas las celdas y te las reconoce aunque tus columnas se llamen de otra manera. No empiezas de cero ni pierdes lo que llevas apuntado.",
    src: "/bloque-importar.webp",
    alt: "El panel de importar, con sus tres formas de traer la hoja de cálculo",
    ancho: 820,
    alto: 333,
  },
];


// La portada publica. Se construye aqui, en una direccion que no enlaza nadie, para
// poder verla sin tocar lo que hay publicado; cuando este lista, la raiz apuntara a
// esto en vez de mandar al formulario.
export default function Inicio() {
  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-5xl px-6 pb-16 pt-14 sm:px-8 sm:pt-20">
        <h1 className="text-3xl sm:text-4xl">
          <Logo />
        </h1>

        <p className="mt-8 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Tus candidaturas, <span className="text-brand">ordenadas</span>.
        </p>

        <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">
          Apunta a qué trabajos echas el currículum y no pierdas el hilo. Te avisa de a
          cuáles toca dar el toque y las ves todas de un vistazo.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
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

        <p className="mt-5 text-sm text-muted">Gratis · Sin anuncios · Código abierto</p>

        {/* La app de verdad, no un dibujo. En el movil se enseña su propia pantalla
            de movil, que es como la usa la gente. */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl sm:mt-16">
          <Image
            src="/app-escritorio.webp"
            alt="La pantalla de Apliknte con las candidaturas, sus estados y el aviso de seguimiento"
            width={1120}
            height={1020}
            priority
            className="hidden w-full sm:block"
          />
          <Image
            src="/app-movil.webp"
            alt="Apliknte en el móvil, con la lista de candidaturas"
            width={540}
            height={1020}
            priority
            className="w-full sm:hidden"
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
            <figure
              className={`m-0 overflow-hidden rounded-2xl border border-border shadow-lg ${
                b.aire ? "bg-background p-6 sm:p-10" : "bg-surface"
              }`}
            >
              <Image
                src={b.src}
                alt={b.alt}
                width={b.ancho}
                height={b.alto}
                className={`w-full ${b.aire ? "rounded-xl" : ""}`}
              />
            </figure>
          </article>
        ))}
      </section>
    </main>
  );
}
