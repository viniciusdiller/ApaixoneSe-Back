import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Checagem = {
  tabela: string;
  coluna: string;
  limite: number;
  rotulo: string; // coluna usada para você identificar o registro
};

// Mesmos limites que foram aplicados nos DTOs do lote 1
const CHECAGENS: Checagem[] = [
  // Praias e lagoas
  { tabela: "pontos_agua", coluna: "nome", limite: 150, rotulo: "nome" },
  { tabela: "pontos_agua", coluna: "descricaoCurta", limite: 191, rotulo: "nome" },
  { tabela: "pontos_agua", coluna: "descricao", limite: 5000, rotulo: "nome" },
  { tabela: "pontos_agua", coluna: "endereco", limite: 191, rotulo: "nome" },
  { tabela: "pontos_agua", coluna: "dificuldade", limite: 20, rotulo: "nome" },

  // Cultura
  { tabela: "locais_culturais", coluna: "nome", limite: 60, rotulo: "nome" },
  { tabela: "locais_culturais", coluna: "descricao", limite: 280, rotulo: "nome" },
  { tabela: "locais_culturais", coluna: "texto", limite: 5000, rotulo: "nome" },
  { tabela: "locais_culturais", coluna: "endereco", limite: 191, rotulo: "nome" },

  // Secretaria de turismo
  { tabela: "secretaria_turismo", coluna: "textoExplicativo", limite: 5000, rotulo: "id" },
  { tabela: "secretaria_turismo_turistando", coluna: "titulo", limite: 150, rotulo: "titulo" },
  { tabela: "secretaria_turismo_turistando", coluna: "texto", limite: 3000, rotulo: "titulo" },
  { tabela: "secretaria_turismo_projeto", coluna: "titulo", limite: 150, rotulo: "titulo" },
  { tabela: "secretaria_turismo_projeto", coluna: "descricao", limite: 3000, rotulo: "titulo" },

  // CAT e CAT Móvel
  { tabela: "cat", coluna: "texto", limite: 5000, rotulo: "id" },
  { tabela: "cat_movel", coluna: "titulo", limite: 150, rotulo: "titulo" },
  { tabela: "cat_movel", coluna: "descricao", limite: 2000, rotulo: "titulo" },
];

async function main() {
  console.log("\nConferindo os dados que já estão no banco...\n");

  let problemas = 0;

  for (const c of CHECAGENS) {
    const sql = `
      SELECT id, \`${c.rotulo}\` AS rotulo, CHAR_LENGTH(\`${c.coluna}\`) AS tamanho
      FROM \`${c.tabela}\`
      WHERE CHAR_LENGTH(\`${c.coluna}\`) > ${c.limite}
      ORDER BY tamanho DESC
      LIMIT 10
    `;

    let linhas: Array<{ id: string; rotulo: string | null; tamanho: number }>;
    try {
      linhas = await prisma.$queryRawUnsafe(sql);
    } catch (erro: any) {
      console.log(`?  ${c.tabela}.${c.coluna} — não deu para checar: ${erro.message}`);
      continue;
    }

    const rotuloLimite = `${c.tabela}.${c.coluna} (limite ${c.limite})`;

    if (linhas.length === 0) {
      console.log(`OK    ${rotuloLimite}`);
      continue;
    }

    problemas += linhas.length;
    console.log(`ATENÇÃO  ${rotuloLimite} — ${linhas.length} registro(s) acima do limite:`);
    for (const l of linhas) {
      console.log(`         ${Number(l.tamanho)} caracteres | ${l.rotulo ?? "(sem rótulo)"} | id ${l.id}`);
    }
  }

  console.log("");
  if (problemas === 0) {
    console.log("Tudo limpo. Nenhum registro atual passa dos novos limites.");
    console.log("Pode subir o lote 1 sem risco de travar edição no painel.\n");
  } else {
    console.log(`${problemas} registro(s) acima do limite.`);
    console.log("Esses itens continuam aparecendo no site normalmente, mas vão dar");
    console.log("erro 400 na primeira vez que alguém tentar EDITAR pelo painel.");
    console.log("Escolha: encurtar o texto no painel antes do deploy, ou aumentar");
    console.log("o limite daquele campo específico no DTO.\n");
  }
}

main()
  .catch((e) => {
    console.error("\nErro ao rodar a checagem:", e.message);
    console.error("Confira se o DATABASE_URL do .env aponta para o banco certo.\n");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
