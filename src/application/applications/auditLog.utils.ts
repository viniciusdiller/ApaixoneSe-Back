const CAMPOS_SENSIVEIS = ["senha", "password", "token", "tokenhash"];

// Heuristica generica pra achar um "nome" legivel em qualquer entidade do
// sistema, sem precisar de um mapa recurso->campo mantido a mao. Cobre a
// grande maioria dos modelos (nome/titulo) e os casos especiais restantes
// (usuario, texto de local cultural/CAT).
export function extrairNomeLegivel(objeto: any): string | null {
  if (!objeto || typeof objeto !== "object") return null;
  const valor =
    objeto.nome ?? objeto.titulo ?? objeto.usuario ?? objeto.texto ?? null;
  if (typeof valor !== "string") return null;
  return valor.length > 120 ? `${valor.slice(0, 117)}...` : valor;
}

export function sanitizarObjeto(
  objeto: any,
): Record<string, unknown> | undefined {
  if (!objeto || typeof objeto !== "object") return undefined;
  const limpo: Record<string, unknown> = {};
  for (const [chave, valor] of Object.entries(objeto)) {
    if (CAMPOS_SENSIVEIS.includes(chave.toLowerCase())) continue;
    if (Buffer.isBuffer(valor)) continue;
    limpo[chave] = valor;
  }
  return Object.keys(limpo).length > 0 ? limpo : undefined;
}
