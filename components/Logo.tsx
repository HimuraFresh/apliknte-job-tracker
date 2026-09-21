import Image from "next/image";

// La marca: la carpeta de app/icon.svg y "Apliknte." Su tamano lo marca el texto que la rodea.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.3em] font-bold tracking-tight text-brand-strong ${className}`}
    >
      <Image
        src="/icon.svg"
        alt=""
        width={88}
        height={76}
        unoptimized
        priority
        className="h-[1.1em] w-auto"
      />
      <span>
        Apliknte<span className="text-accent">.</span>
      </span>
    </span>
  );
}
