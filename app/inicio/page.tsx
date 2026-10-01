import { redirect } from "next/navigation";

// La portada vivio aqui mientras se construia. Se queda el desvio por si el enlace
// anda suelto en algun sitio.
export default function Inicio() {
  redirect("/");
}
