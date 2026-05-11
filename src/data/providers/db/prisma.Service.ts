import { Injectable, OnModuleInit, INestApplication } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Esse método é chamado automaticamente quando o servidor Nest liga
  async onModuleInit() {
    await this.$connect();
    console.log("Banco de dados conectado com sucesso!");
  }

  // Esse método garante que o banco desconecte graciosamente se o servidor cair
  async enableShutdownHooks(app: INestApplication) {
    process.on("beforeExit", async () => {
      await app.close();
    });
  }
}
