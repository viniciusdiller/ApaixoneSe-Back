import { Module } from "@nestjs/common";
import { ApplicationModule } from "../application/application.module";
import { UserController } from "./controllers/user.controller";
import { GastronomiaController } from "./controllers/gastronomia.controller";
import { HospedagemController } from "./controllers/hospedagem.controller";
import { ServicoTuristaController } from "./controllers/servicoTurista.controller";
import { EventoController } from "./controllers/evento.controller";
import { EventoPrincipalController } from "./controllers/eventoPrincipal.controller";
import { AtividadeController } from "./controllers/atividade.controller";
import { PlanoViagemController } from "./controllers/planoViagem.controller";
import { ItemPlanoViagemController } from "./controllers/itemPlanoViagem.controller";
import { VisitaController } from "./controllers/visita.controller";
import { CatController } from "./controllers/cat.controller";
import { CatMovelController } from "./controllers/catMovel.controller";
import { CasaDeCambioController } from "./controllers/casaDeCambio.controller";
import { SecretariaTurismoController } from "./controllers/secretariaTurismo.controller";

@Module({
  imports: [ApplicationModule],
  controllers: [
    UserController,
    GastronomiaController,
    HospedagemController,
    ServicoTuristaController,
    EventoController,
    EventoPrincipalController,
    AtividadeController,
    PlanoViagemController,
    ItemPlanoViagemController,
    VisitaController,
    CatController,
    CatMovelController,
    CasaDeCambioController,
    SecretariaTurismoController,
  ],
})
export class PresentationModule {}
