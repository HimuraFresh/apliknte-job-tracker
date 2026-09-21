import { ImageResponse } from "next/og";

// La imagen que sale al compartir el enlace (WhatsApp, LinkedIn...): solo la palabra.
// WhatsApp en el movil la recorta a un cuadrado central y la encoge, asi que la palabra
// cabe entera en ese cuadrado (630x630). La frase no va aqui: WhatsApp ya la escribe al
// lado a partir de la descripcion, y en miniatura era ilegible.
export const alt = "Apliknte. Tus candidaturas de empleo, ordenadas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Geist desde Google Fonts, solo con las letras que se usan.
// Sin red devuelve null y la imagen se genera con la fuente por defecto.
async function geistBold(text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Geist:wght@700&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const file = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return file ? await (await fetch(file)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const bold = await geistBold("Apliknte.");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 140,
            fontWeight: 700,
            color: "#1d4ed8",
            letterSpacing: -5,
          }}
        >
          {/* El generador deja hueco tras letterSpacing negativo: el margen pega el punto a la palabra */}
          Apliknte<span style={{ color: "#38bdf8", marginLeft: -21 }}>.</span>
        </div>
      </div>
    ),
    { ...size, fonts: bold ? [{ name: "Geist", data: bold, weight: 700 as const }] : [] },
  );
}
