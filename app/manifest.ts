import type { MetadataRoute } from "next";

// Lo justo para poder instalarla desde el movil: nombre, iconos y que se abra sin la barra
// del navegador. Sin trabajador de servicio a proposito: no funciona sin conexion, pero
// tampoco se queda nadie con una copia vieja de la app al desplegar.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Apliknte",
    short_name: "Apliknte",
    description: "Tus candidaturas de empleo, ordenadas",
    lang: "es",
    // Instalada se entra directo al panel; sin sesion, el middleware lleva a /entrar.
    start_url: "/panel",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      // Android recorta el icono a la forma que use el movil: este lleva mas margen.
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
