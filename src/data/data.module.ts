import { Module } from "@nestjs/common";
import { PrismaService } from "./providers/db/prisma.Service";
import { UserRepository } from "./repositories/user.repository";
import { AtividadeRepository } from "./repositories/atividade.repository";
import { EventoRepository } from "./repositories/evento.repository";

@Module({
  // Providers: O que este módulo sabe construir
  providers: [
    PrismaService,
    UserRepository,
    AtividadeRepository,
    EventoRepository,
  ],

  // Exports: O que este módulo deixa os outros usarem
  exports: [
    PrismaService,
    UserRepository,
    AtividadeRepository,
    EventoRepository,
  ],
})
export class DataModule {}
