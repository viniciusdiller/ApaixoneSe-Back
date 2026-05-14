import { Module } from "@nestjs/common";
import { ApplicationModule } from "../application/application.module";
import { UserController } from "./controllers/user.controller";
import { AtividadeController } from "./controllers/atividade.controller";
@Module({
  imports: [ApplicationModule], // Precisa da Ponte (Application)
  controllers: [UserController, AtividadeController], // Avisa que as rotas estão aqui
})
export class PresentationModule {}
