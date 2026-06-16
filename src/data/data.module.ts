import { Module } from "@nestjs/common";
import { PrismaService } from "./providers/db/prisma.Service";
import { UserRepository } from "./repositories/user.repository";
import { GastronomiaRepository } from "./repositories/gastronomia.repository";
import { HospedagemRepository } from "./repositories/hospedagem.repository";
import { ServicoTuristaRepository } from "./repositories/servicoTurista.repository";
import { EventoRepository } from "./repositories/evento.repository";
import { EventoPrincipalRepository } from "./repositories/eventoPrincipal.repository";
import { AtividadeRepository } from "./repositories/atividade.repository";
import { PlanoViagemRepository } from "./repositories/planoViagem.repository";
import { ItemPlanoViagemRepository } from "./repositories/itemPlanoViagem.repository";
import { VisitaRepository } from "./repositories/visita.repository";
import { CatRepository } from "./repositories/cat.repository";
import { CatMovelRepository } from "./repositories/catMovel.repository";
import { CasaDeCambioRepository } from "./repositories/casaDeCambio.repository";
import { SecretariaTurismoRepository } from "./repositories/secretariaTurismo.repository";

@Module({
  providers: [
    PrismaService,
    UserRepository,
    GastronomiaRepository,
    HospedagemRepository,
    ServicoTuristaRepository,
    EventoRepository,
    EventoPrincipalRepository,
    AtividadeRepository,
    PlanoViagemRepository,
    ItemPlanoViagemRepository,
    VisitaRepository,
    CatRepository,
    CatMovelRepository,
    CasaDeCambioRepository,
    SecretariaTurismoRepository,
  ],
  exports: [
    PrismaService,
    UserRepository,
    GastronomiaRepository,
    HospedagemRepository,
    ServicoTuristaRepository,
    EventoRepository,
    EventoPrincipalRepository,
    AtividadeRepository,
    PlanoViagemRepository,
    ItemPlanoViagemRepository,
    VisitaRepository,
    CatRepository,
    CatMovelRepository,
    CasaDeCambioRepository,
    SecretariaTurismoRepository,
  ],
})
export class DataModule {}
