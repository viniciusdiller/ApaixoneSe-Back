import { Module } from "@nestjs/common";
import { PrismaService } from "../db/prisma.Service";

@Module({
  // Providers: O que este módulo constrói e gerencia (nosso serviço do Prisma)
  providers: [PrismaService],

  // Exports: O que este módulo permite que outros módulos (como o de Usuários) usem
  exports: [PrismaService],
})
export class DataModule {}
