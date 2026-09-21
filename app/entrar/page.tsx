import EntrarForm from "./EntrarForm";

// /auth/callback nos devuelve aqui con ?error=link si el enlace del correo no vale.
export default async function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  const { error } = await searchParams;
  return <EntrarForm linkError={error === "link"} />;
}
