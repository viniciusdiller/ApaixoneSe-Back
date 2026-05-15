import { Module } from "@nestjs/common";
import { DataModule } from "../data/data.module";
import { UserApplication } from "./applications/user.Application";
import { AtividadeApplication } from "./applications/atividade.Application";
import { EventoApplication } from "./applications/evento.Application";
import { GastronomiaApplication } from "./applications/gastronomia.Application";

@Module({
  imports: [DataModule], // Precisa do banco de dados
  providers: [
    UserApplication,
    AtividadeApplication,
    EventoApplication,
    GastronomiaApplication,
  ],
  exports: [
    UserApplication,
    AtividadeApplication,
    EventoApplication,
    GastronomiaApplication,
  ], // Libera a ponte para o Controller usar
})
export class ApplicationModule {}
