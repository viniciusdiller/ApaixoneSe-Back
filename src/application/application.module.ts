import { Module } from "@nestjs/common";
import { DataModule } from "../data/data.module";
import { UserApplication } from "./applications/user.Application";
import { UserRepository } from "../data/repositories/user.repository";
import { AtividadeApplication } from "./applications/atividade.Application";
import { EventoApplication } from "./applications/evento.Application";
import { GastronomiaApplication } from "./applications/gastronomia.Application";
import { JwtStrategy } from "./strategies/jwt.strategy";

import { HospedagemApplication } from "./applications/hospedagem.Application";

@Module({
  imports: [DataModule], // Precisa do banco de dados
  providers: [
    UserApplication,
    AtividadeApplication,
    EventoApplication,
    GastronomiaApplication,
    UserRepository,
    JwtStrategy,
    HospedagemApplication,
  ],
  exports: [
    UserApplication,
    AtividadeApplication,
    EventoApplication,
    GastronomiaApplication,
    HospedagemApplication,
  ], // Libera a ponte para o Controller usar
})
export class ApplicationModule {}
