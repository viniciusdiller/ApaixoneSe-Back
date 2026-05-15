import { Module } from "@nestjs/common";
import { DataModule } from "../data/data.module";
import { UserApplication } from "./applications/user.Application";
import { AtividadeApplication } from "./applications/atividade.Application";
import { EventoApplication } from "./applications/evento.Application";
import { GastronomiaApplication } from "./applications/gastronomia.Application";
import { JwtStrategy } from "../application/strategies/jsw.strategy";

@Module({
  imports: [DataModule], // Precisa do banco de dados
  providers: [
    UserApplication,
    AtividadeApplication,
    EventoApplication,
    GastronomiaApplication,
    JwtStrategy,
  ],
  exports: [
    UserApplication,
    AtividadeApplication,
    EventoApplication,
    GastronomiaApplication,
  ], // Libera a ponte para o Controller usar
})
export class ApplicationModule {}
