import { Module } from "@nestjs/common";
import { PrismaService } from "./providers/db/prisma.Service";
import { UserRepository } from "./repositories/user.repository";
import { AtividadeRepository } from "./repositories/atividade.repository";
import { EventoRepository } from "./repositories/evento.repository";
import { GastronomiaRepository } from "./repositories/gastronomia.repository";
import { HospedagemRepository } from "./repositories/hospedagem.repository";
import { ServicoTuristaRepository } from "./repositories/servicoTurista.repository";
import { CatRepository } from "./repositories/cat.repository";

@Module({
  // Providers: O que este módulo sabe construir
  providers: [
    PrismaService,
    UserRepository,
    AtividadeRepository,
    EventoRepository,
    GastronomiaRepository,
    HospedagemRepository,
    ServicoTuristaRepository,
    CatRepository,
  ],

  // Exports: O que este módulo deixa os outros usarem
  exports: [
    PrismaService,
    UserRepository,
    AtividadeRepository,
    EventoRepository,
    GastronomiaRepository,
    HospedagemRepository,
    ServicoTuristaRepository,
    CatRepository,
  ],
})
export class DataModule {}
