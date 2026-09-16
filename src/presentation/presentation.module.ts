import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { ApplicationModule } from "../application/application.module";
import { AuditLogInterceptor } from "./interceptors/auditLog.interceptor";
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
import { FiquePorDentroController } from "./controllers/fiquePorDentro.controller";
import { PontoAguaController } from "./controllers/pontoAgua.controller";
import { LocalCulturalController } from "./controllers/localCultural.controller";
import { ClicksController } from "./controllers/clicks.controller";
import { AuditLogController } from "./controllers/auditLog.controller";

@Module({
  imports: [
    ApplicationModule,
    ThrottlerModule.forRoot([{ name: "clicks", ttl: 60000, limit: 30 }]),
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor }],
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
    FiquePorDentroController,
    PontoAguaController,
    LocalCulturalController,
    ClicksController,
    AuditLogController,
  ],
})
export class PresentationModule {}
