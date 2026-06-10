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
import { VisitaController } from "./controllers/visita.controller";
import { EventoPrincipalController } from "./controllers/eventoPrincipal.controller";
import { CasaDeCambioController } from "./controllers/casaDeCambio.controller";
import { SecretariaTurismoController } from "./controllers/secretariaTurismo.controller";

@Module({
  imports: [ApplicationModule],
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
    VisitaController,
    EventoPrincipalController,
    CasaDeCambioController,
    SecretariaTurismoController,
  ],
})
export class PresentationModule {}
