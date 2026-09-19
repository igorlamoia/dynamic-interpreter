/**
 * Endereço do backend para código que roda NO SERVIDOR do Next.js (rotas de
 * API e getServerSideProps), ou seja, dentro do container do frontend.
 *
 * Não pode ser `NEXT_PUBLIC_API_URL`: o Next.js a substitui por literal no
 * build, inclusive no bundle de servidor, e ela costuma ser `localhost` ou a
 * URL pública. De dentro do container, `localhost` é o próprio frontend, e a
 * chamada falha com ECONNREFUSED. `INTERNAL_API_URL` não tem o prefixo
 * `NEXT_PUBLIC_`, então é lida em runtime; as composes a apontam para o DNS
 * interno do Docker.
 *
 * `||` em vez de `??` para que uma variável definida mas vazia caia no
 * fallback em vez de virar uma URL relativa.
 */
export function getServerApiUrl(): string {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
  );
}
