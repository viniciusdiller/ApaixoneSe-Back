import { Module } from "@nestjs/common";
import { ApplicationModule } from "../application/application.module";
import { UserController } from "./controllers/user.controller";
import { AtividadeController } from "./controllers/atividade.controller";
import { EventoController } from "./controllers/evento.controller";
import { GastronomiaController } from "./controllers/gastronomia.controller";
import { HospedagemController } from "./controllers/hospedagem.controller";
import { ServicoTuristaController } from "./controllers/servicoTurista.controller";
import { PlanoViagemController } from "./controllers/planoViagem.controller";
import { ItemPlanoViagemController } from "./controllers/itemPlanoViagem.controller";
import { CatController } from "./controllers/cat.controller";

@Module({
  imports: [ApplicationModule], // Precisa da Ponte (Application)
  controllers: [
    UserController,
    AtividadeController,
    EventoController,
    GastronomiaController,
    HospedagemController,
    ServicoTuristaController,
    PlanoViagemController,
    ItemPlanoViagemController,
    CatController,
  ], // Avisa que as rotas estão aqui
})
export class PresentationModule {}
