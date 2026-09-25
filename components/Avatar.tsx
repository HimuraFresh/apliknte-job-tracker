// Cinco avatares dibujados a mano, animales de oficina con la carpeta del logo en la mano.
// Son SVG dentro del codigo: no hay fotos que subir, ni que guardar, ni que borrar despues.
// Lo que de verdad los distingue de lejos es el color del fondo, uno para cada uno.

// La carpeta de app/icon.svg y una hoja suelta, en pequeno.
const CARPETA = (
  <>
    <path d="M0 4a3 3 0 0 1 3-3h6.5l2.2 3H21a3 3 0 0 1 3 3v13H0z" fill="#93c5fd" />
    <rect x="4.5" y="0.5" width="14" height="12" rx="2" fill="#fff" stroke="#bfdbfe" strokeWidth="1" />
    <path d="M7.5 4.5h8M7.5 8h10" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" />
    <rect x="0" y="8" width="24" height="13" rx="3" fill="#2563eb" />
  </>
);

const HOJA = (
  <>
    <rect x="0.5" y="0.5" width="17" height="21" rx="2.5" fill="#fff" stroke="#60a5fa" strokeWidth="1.2" />
    <path d="M4.5 6h9M4.5 10h10M4.5 14h7" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" />
  </>
);

// El orden manda: es lo que se guarda en la cuenta (0 a 4). No reordenar.
const CARAS = [
  // 0 · Gata
  <>
    <rect width="64" height="64" fill="#ffedd5" />
    <rect x="27" y="35" width="10" height="12" fill="#ea7a1e" />
    <rect x="8" y="45" width="48" height="28" rx="14" fill="#ffffff" />
    <path d="M27 45l5 5.5 5-5.5 4 2-9 7.5-9-7.5z" fill="#f1f5f9" />
    <path d="M19.5 18.5L17.5 7.5l10.5 4.5z" fill="#f97316" />
    <path d="M20.5 16.8l-1-5.6 6 2.4z" fill="#fbcfe8" />
    <path d="M44.5 18.5l2-11-10.5 4.5z" fill="#f97316" />
    <path d="M43.5 16.8l1-5.6-6 2.4z" fill="#fbcfe8" />
    <ellipse cx="32" cy="26" rx="14" ry="13" fill="#f97316" />
    <ellipse cx="32" cy="31" rx="9.5" ry="6.5" fill="#fff7ed" />
    <circle cx="26.5" cy="24" r="2.2" fill="#0f172a" />
    <circle cx="37.5" cy="24" r="2.2" fill="#0f172a" />
    <path d="M24.2 22.5q2.3-2.6 4.6 0M35.2 22.5q2.3-2.6 4.6 0" fill="none" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M32 28.4l2.2 2h-4.4z" fill="#f472b6" />
    <path d="M32 30.4v1.5M29.6 33q2.4 1.8 4.8 0" fill="none" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M23 30.6l-5-1.4M23 33l-5 1.2M41 30.6l5-1.4M41 33l5 1.2" fill="none" stroke="#fdba74" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M45.5 13.5l6-2.2v6.6z" fill="#38bdf8" />
    <path d="M45.5 13.5l-1.2-6 5.4 2.2z" fill="#38bdf8" />
    <circle cx="45.8" cy="13.2" r="1.8" fill="#0ea5e9" />
    <g transform="translate(32 48) rotate(-8) scale(0.8)">{CARPETA}</g>
    <circle cx="32.5" cy="55.5" r="4.6" fill="#f97316" />
  </>,

  // 1 · Lechuza
  <>
    <rect width="64" height="64" fill="#ede9fe" />
    <rect x="8" y="44" width="48" height="29" rx="14" fill="#ffffff" />
    <path d="M10 62c0-9 4-15 10-17l4 19z" fill="#a78bfa" />
    <path d="M54 62c0-9-4-15-10-17l-4 19z" fill="#a78bfa" />
    <circle cx="27" cy="47" r="1.7" fill="#8b5cf6" />
    <circle cx="32" cy="48.5" r="1.7" fill="#8b5cf6" />
    <circle cx="37" cy="47" r="1.7" fill="#8b5cf6" />
    <path d="M19 15l-2-9 8 5z" fill="#a78bfa" />
    <path d="M45 15l2-9-8 5z" fill="#a78bfa" />
    <ellipse cx="32" cy="26" rx="15" ry="14" fill="#a78bfa" />
    <path d="M32 13a15 14 0 0 0-14.7 11.5c3-1.5 5.5-1 7 .5 2-3 5-4.5 7.7-4.5s5.7 1.5 7.7 4.5c1.5-1.5 4-2 7-.5A15 14 0 0 0 32 13z" fill="#c4b5fd" />
    <circle cx="25.5" cy="26" r="6.2" fill="#f5f3ff" stroke="#4c1d95" strokeWidth="1.6" />
    <circle cx="38.5" cy="26" r="6.2" fill="#f5f3ff" stroke="#4c1d95" strokeWidth="1.6" />
    <path d="M31.7 26h0.6" stroke="#4c1d95" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="25.5" cy="26" r="2.4" fill="#0f172a" />
    <circle cx="38.5" cy="26" r="2.4" fill="#0f172a" />
    <path d="M32 31.5l3.2 4.5h-6.4z" fill="#f59e0b" />
    <path d="M45 16.5l5.5-2v6z" fill="#f472b6" />
    <path d="M45 16.5l-1-5.5 5 2z" fill="#f472b6" />
    <circle cx="45.3" cy="16.2" r="1.7" fill="#ec4899" />
    <g transform="translate(33 46) rotate(-7) scale(0.85)">{HOJA}</g>
    <circle cx="33" cy="54" r="4.4" fill="#a78bfa" />
  </>,

  // 2 · Oso
  <>
    <rect width="64" height="64" fill="#fef3c7" />
    <rect x="27" y="35" width="10" height="12" fill="#8a5a36" />
    <rect x="7" y="45" width="50" height="28" rx="14" fill="#ffffff" />
    <path d="M27 45l5 5.5 5-5.5 4 2-9 7.5-9-7.5z" fill="#e2e8f0" />
    <path d="M32 50.5l2.6 2.5-1.6 10h-2l-1.6-10z" fill="#2563eb" />
    <circle cx="19" cy="15" r="6" fill="#a1673f" />
    <circle cx="19" cy="15" r="3" fill="#c98f63" />
    <circle cx="45" cy="15" r="6" fill="#a1673f" />
    <circle cx="45" cy="15" r="3" fill="#c98f63" />
    <ellipse cx="32" cy="26" rx="15" ry="13.5" fill="#a1673f" />
    <ellipse cx="32" cy="31.5" rx="9.5" ry="7" fill="#e7c9a9" />
    <circle cx="26" cy="23.5" r="2.2" fill="#0f172a" />
    <circle cx="38" cy="23.5" r="2.2" fill="#0f172a" />
    <ellipse cx="32" cy="29" rx="3" ry="2.2" fill="#0f172a" />
    <path d="M32 31.2v2.2M29 34.2q3 2.2 6 0" fill="none" stroke="#0f172a" strokeWidth="1.3" strokeLinecap="round" />
    <g transform="translate(34 50.5) rotate(-9) scale(0.72)">{CARPETA}</g>
    <circle cx="37" cy="57.5" r="4.6" fill="#a1673f" />
  </>,

  // 3 · Conejo
  <>
    <rect width="64" height="64" fill="#e0f2fe" />
    <rect x="27" y="35" width="10" height="12" fill="#8fa0b5" />
    <rect x="7" y="45" width="50" height="28" rx="14" fill="#ffffff" />
    <path d="M27 45l5 5.5 5-5.5 4 2-9 7.5-9-7.5z" fill="#e2e8f0" />
    <path d="M32 50.5l2.6 2.5-1.6 10h-2l-1.6-10z" fill="#0284c7" />
    <ellipse cx="24" cy="10" rx="4.5" ry="11" transform="rotate(-10 24 10)" fill="#94a3b8" />
    <ellipse cx="24" cy="10.5" rx="2.2" ry="7.5" transform="rotate(-10 24 10.5)" fill="#fbcfe8" />
    <ellipse cx="40" cy="10" rx="4.5" ry="11" transform="rotate(10 40 10)" fill="#94a3b8" />
    <ellipse cx="40" cy="10.5" rx="2.2" ry="7.5" transform="rotate(10 40 10.5)" fill="#fbcfe8" />
    <ellipse cx="32" cy="27" rx="14" ry="12.5" fill="#94a3b8" />
    <ellipse cx="32" cy="32" rx="9" ry="6.5" fill="#e6ecf3" />
    <rect x="19.5" y="21" width="12" height="9.5" rx="4.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.6" />
    <rect x="32.5" y="21" width="12" height="9.5" rx="4.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.6" />
    <path d="M31.5 25.5h1" stroke="#334155" strokeWidth="1.6" />
    <circle cx="25.5" cy="25.8" r="2.2" fill="#0f172a" />
    <circle cx="38.5" cy="25.8" r="2.2" fill="#0f172a" />
    <path d="M32 30.5l2.4 2.2h-4.8z" fill="#f472b6" />
    <path d="M32 33.2v1.6M29.4 35.4q2.6 1.8 5.2 0" fill="none" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
    <g transform="translate(34 48) rotate(8) scale(0.85)">{HOJA}</g>
    <circle cx="36.5" cy="56.5" r="4.4" fill="#94a3b8" />
  </>,

  // 4 · Pinguino
  <>
    <rect width="64" height="64" fill="#dbeafe" />
    <rect x="25" y="36" width="14" height="10" fill="#1e293b" />
    <rect x="7" y="45" width="50" height="28" rx="14" fill="#ffffff" />
    <path d="M27 45l5 5.5 5-5.5 4 2-9 7.5-9-7.5z" fill="#e2e8f0" />
    <path d="M32 50.5l2.6 2.5-1.6 10h-2l-1.6-10z" fill="#2563eb" />
    <ellipse cx="32" cy="25" rx="14.5" ry="13.5" fill="#1e293b" />
    <path d="M32 16c5 0 8.5 4 8.5 9.5S37 34 32 34s-8.5-3-8.5-8.5S27 16 32 16z" fill="#f8fafc" />
    <circle cx="27" cy="23.5" r="2.3" fill="#0f172a" />
    <circle cx="37" cy="23.5" r="2.3" fill="#0f172a" />
    <path d="M32 27.5l5 4.5h-10z" fill="#f59e0b" />
    <g transform="translate(34 50.5) rotate(-8) scale(0.72)">{CARPETA}</g>
    <ellipse cx="37" cy="57.5" rx="4.8" ry="4.2" fill="#1e293b" />
  </>,
];

export const AVATARS = CARAS.length;

// Quien no ha elegido ninguno tiene el suyo igualmente, siempre el mismo, sacado del
// correo: asi nadie ve un hueco gris, y dos cuentas distintas casi nunca coinciden.
export const avatarFor = (email: string) =>
  [...email].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATARS;

export default function Avatar({ id, className = "h-10 w-10" }: { id: number; className?: string }) {
  const i = Number.isInteger(id) && id >= 0 && id < AVATARS ? id : 0;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      {/* el id se repite si sale el mismo avatar dos veces, pero recorta igual: es el mismo circulo */}
      <defs>
        <clipPath id={`avatar-${i}`}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#avatar-${i})`}>{CARAS[i]}</g>
    </svg>
  );
}
