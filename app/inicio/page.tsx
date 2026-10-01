import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import { title } from "@/lib/title";

export const generateMetadata = () => title("Inicio", "Home");

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
    </main>
  );
}
