/**
 * seed-admin.ts
 * ─────────────────────────────────────────────────────────────
 * Cria o primeiro usuário ADMIN de forma segura, sem expor
 * endpoint público e sem hardcode de credenciais no código.
 *
 * Todas as credenciais são lidas de variáveis de ambiente:
 *   ADMIN_NOME     → nome completo
 *   ADMIN_USUARIO  → username de login
 *   ADMIN_EMAIL    → e-mail de login
 *   ADMIN_SENHA    → senha em texto puro (será hasheada aqui)
 *
 * Uso:
 *   ADMIN_NOME="Vinicius" ADMIN_USUARIO="admin" \
 *   ADMIN_EMAIL="admin@apaixonese.com" ADMIN_SENHA="SenhaForte!123" \
 *   npm run seed:admin
 *
 * O script é IDEMPOTENTE: se o email ou o username já existir
 * no banco, apenas exibe aviso e encerra sem erros.
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // ── 1. Ler e validar variáveis de ambiente ─────────────────
  const nome    = process.env.ADMIN_NOME?.trim();
  const usuario = process.env.ADMIN_USUARIO?.trim();
  const email   = process.env.ADMIN_EMAIL?.trim();
  const senha   = process.env.ADMIN_SENHA;

  const missing: string[] = [];
  if (!nome)    missing.push("ADMIN_NOME");
  if (!usuario) missing.push("ADMIN_USUARIO");
  if (!email)   missing.push("ADMIN_EMAIL");
  if (!senha)   missing.push("ADMIN_SENHA");

  if (missing.length > 0) {
    console.error(
      `\n❌  Variáveis de ambiente ausentes: ${missing.join(", ")}\n` +
      `   Exemplo de uso:\n` +
      `   ADMIN_NOME="Seu Nome" ADMIN_USUARIO="admin" ` +
      `ADMIN_EMAIL="admin@email.com" ADMIN_SENHA="SenhaForte!" npm run seed:admin\n`
    );
    process.exit(1);
  }

  // Validação mínima de e-mail
  if (!email!.includes("@")) {
    console.error("\n❌  ADMIN_EMAIL inválido. Deve conter @.\n");
    process.exit(1);
  }

  // Senha mínima de 8 caracteres
  if (senha!.length < 8) {
    console.error("\n❌  ADMIN_SENHA muito curta. Mínimo 8 caracteres.\n");
    process.exit(1);
  }

  // ── 2. Verificar duplicatas (idempotência) ─────────────────
  const emailExiste = await (prisma as any).user.findUnique({
    where: { email },
  });
  if (emailExiste) {
    console.warn(`\n⚠️   Usuário com e-mail "${email}" já existe. Nenhuma alteração feita.\n`);
    return;
  }

  const usuarioExiste = await (prisma as any).user.findUnique({
    where: { usuario },
  });
  if (usuarioExiste) {
    console.warn(`\n⚠️   Username "${usuario}" já está em uso. Nenhuma alteração feita.\n`);
    return;
  }

  // ── 3. Hash da senha (mesmo algoritmo do UserApplication) ──
  const salt           = await bcrypt.genSalt(10);
  const senhaCriptografada = await bcrypt.hash(senha!, salt);

  // ── 4. Inserir no banco ────────────────────────────────────
  const admin = await (prisma as any).user.create({
    data: {
      nome,
      usuario,
      email,
      senha: senhaCriptografada,
      perfil: "ADMIN",
    },
  });

  console.log(`\n✅  Admin criado com sucesso!`);
  console.log(`   ID:      ${admin.id}`);
  console.log(`   Nome:    ${admin.nome}`);
  console.log(`   Usuario: ${admin.usuario}`);
  console.log(`   Email:   ${admin.email}`);
  console.log(`   Perfil:  ${admin.perfil}`);
  console.log(`   Em:      ${admin.createdAt}\n`);
}

main()
  .catch((e) => {
    console.error("\n❌  Erro inesperado:", e.message ?? e, "\n");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
