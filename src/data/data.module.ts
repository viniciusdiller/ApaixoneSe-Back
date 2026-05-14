import { Module } from "@nestjs/common";
import { PrismaService } from "./providers/db/prisma.Service";
import { UserRepository } from "./repositories/user.repository";
import { AtividadeRepository } from "./repositories/atividade.repository";

@Module({
  // Providers: O que este módulo sabe construir
  providers: [PrismaService, UserRepository, AtividadeRepository],

  // Exports: O que este módulo deixa os outros usarem
  exports: [PrismaService, UserRepository, AtividadeRepository],
})
export class DataModule {}
