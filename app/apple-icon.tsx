import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icono al guardar la web en la pantalla de inicio: la carpeta de app/icon.svg
// sobre blanco. iOS redondea las esquinas, asi que el fondo llega hasta el borde.
export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "app/icon.svg"));
  const src = `data:image/svg+xml;base64,${svg.toString("base64")}`;

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
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no admite next/image */}
        <img src={src} width={136} height={117} alt="" />
      </div>
    ),
    size,
  );
}
