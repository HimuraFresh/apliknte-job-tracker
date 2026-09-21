// Banderas dibujadas: los emojis de bandera no se ven en Windows (salen las letras).
export default function Flag({ code }: { code: "es" | "en" }) {
  return (
    <svg
      viewBox="0 0 60 40"
      aria-hidden="true"
      className="h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10"
    >
      {code === "es" ? (
        <>
          <rect width="60" height="40" fill="#c60b1e" />
          <rect y="10" width="60" height="20" fill="#ffc400" />
        </>
      ) : (
        <>
          {/* Reino Unido, simplificada para verse bien a 16 px */}
          <rect width="60" height="40" fill="#012169" />
          <path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
          <path d="M0 0L60 40M60 0L0 40" stroke="#c8102e" strokeWidth="3" />
          <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="12" />
          <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="7" />
        </>
      )}
    </svg>
  );
}
