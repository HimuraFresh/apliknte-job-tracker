import { ImageResponse } from "next/og";

// La imagen que sale al compartir el enlace (WhatsApp, LinkedIn...): solo la palabra.
export const alt = "Apliknte. Tus candidaturas de empleo, ordenadas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TAGLINE = "Tus candidaturas de empleo, ordenadas";

// Geist desde Google Fonts, solo con las letras que se usan.
// Sin red devuelve null y la imagen se genera con la fuente por defecto.
async function geist(weight: number, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Geist:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const file = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return file ? await (await fetch(file)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [bold, regular] = await Promise.all([geist(700, "Apliknte."), geist(400, TAGLINE)]);
  const fonts = [
    ...(bold ? [{ name: "Geist", data: bold, weight: 700 as const }] : []),
    ...(regular ? [{ name: "Geist", data: regular, weight: 400 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 176,
            fontWeight: 700,
            color: "#1d4ed8",
            letterSpacing: -6,
          }}
        >
          {/* El generador deja hueco tras letterSpacing negativo: el margen pega el punto a la palabra */}
          Apliknte<span style={{ color: "#38bdf8", marginLeft: -26 }}>.</span>
        </div>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 400, color: "#64748b" }}>
          {TAGLINE}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
