import { Module } from "@nestjs/common";
import { ApplicationModule } from "../application/application.module";
import { UserController } from "./controllers/user.controller";

@Module({
  imports: [ApplicationModule], // Precisa da Ponte (Application)
  controllers: [UserController], // Avisa que as rotas estão aqui
})
export class PresentationModule {}
