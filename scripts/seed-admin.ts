/**
 * seed-admin.ts
 *
 * Cria (ou atualiza) o usuário ADMIN inicial no banco.
 * NUNCA coloque credenciais aqui — tudo vem do .env.
 *
 * Como rodar no VPS (dentro da pasta do backend):
 *   npm run seed:admin
 *
 * Variáveis de ambiente necessárias no .env:
 *   ADMIN_SEED_NOME    = "Seu Nome"
 *   ADMIN_SEED_USUARIO = "admin"
 *   ADMIN_SEED_EMAIL   = "admin@seudominio.com"
 *   ADMIN_SEED_SENHA   = "UmaSenhaForte@2025"
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const nome = process.env.ADMIN_SEED_NOME;
  const usuario = process.env.ADMIN_SEED_USUARIO;
  const email = process.env.ADMIN_SEED_EMAIL;
  const senha = process.env.ADMIN_SEED_SENHA;

  // Valida que todas as variáveis estão presentes
  if (!nome || !usuario || !email || !senha) {
    console.error("\n❌ Erro: variáveis de ambiente faltando.");
    console.error(
      "   Adicione no .env: ADMIN_SEED_NOME, ADMIN_SEED_USUARIO, ADMIN_SEED_EMAIL, ADMIN_SEED_SENHA\n",
    );
    process.exit(1);
  }

  console.log(`\n🌱 Criando admin: ${email}...`);

  const senhaHash = await bcrypt.hash(senha, 10);

  // upsert: cria se não existir, atualiza se já existir (idempotente)
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      nome,
      usuario,
      senha: senhaHash,
      perfil: "ADMIN",
    },
    create: {
      nome,
      usuario,
      email,
      senha: senhaHash,
      perfil: "ADMIN",
    },
  });

  console.log(`✅ Admin criado/atualizado com sucesso!`);
  console.log(`   ID:      ${admin.id}`);
  console.log(`   Nome:    ${admin.nome}`);
  console.log(`   Usuário: ${admin.usuario}`);
  console.log(`   Email:   ${admin.email}`);
  console.log(`   Perfil:  ${admin.perfil}\n`);
}

main()
  .catch((e) => {
    console.error("\n❌ Erro ao executar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
