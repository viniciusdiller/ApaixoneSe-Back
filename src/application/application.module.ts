import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { DataModule } from "../data/data.module";
import { UserApplication } from "./applications/user.Application";
import { GastronomiaApplication } from "./applications/gastronomia.Application";
import { HospedagemApplication } from "./applications/hospedagem.Application";
import { ServicoTuristaApplication } from "./applications/servicoTurista.Application";
import { EventoApplication } from "./applications/evento.Application";
import { EventoPrincipalApplication } from "./applications/eventoPrincipal.Application";
import { AtividadeApplication } from "./applications/atividade.Application";
import { PlanoViagemApplication } from "./applications/planoViagem.Application";
import { ItemPlanoViagemApplication } from "./applications/itemPlanoViagem.Application";
import { VisitaApplication } from "./applications/visita.Application";
import { CatApplication } from "./applications/cat.Application";
import { CatMovelApplication } from "./applications/catMovel.Application";
import { CasaDeCambioApplication } from "./applications/casaDeCambio.Application";
import { SecretariaTurismoApplication } from "./applications/secretariaTurismo.Application";
import { FiquePorDentroApplication } from "./applications/fiquePorDentro.Application";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { EmailService } from "./services/email.service";

@Module({
  imports: [
    DataModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  providers: [
    JwtStrategy,
    EmailService,
    UserApplication,
    GastronomiaApplication,
    HospedagemApplication,
    ServicoTuristaApplication,
    EventoApplication,
    EventoPrincipalApplication,
    AtividadeApplication,
    PlanoViagemApplication,
    ItemPlanoViagemApplication,
    VisitaApplication,
    CatApplication,
    CatMovelApplication,
    CasaDeCambioApplication,
    SecretariaTurismoApplication,
    FiquePorDentroApplication,
  ],
  exports: [
    UserApplication,
    GastronomiaApplication,
    HospedagemApplication,
    ServicoTuristaApplication,
    EventoApplication,
    EventoPrincipalApplication,
    AtividadeApplication,
    PlanoViagemApplication,
    ItemPlanoViagemApplication,
    VisitaApplication,
    CatApplication,
    CatMovelApplication,
    CasaDeCambioApplication,
    SecretariaTurismoApplication,
    FiquePorDentroApplication,
  ],
})
export class ApplicationModule {}
