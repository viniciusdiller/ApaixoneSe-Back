import { Module } from "@nestjs/common";
import { DataModule } from "../src/data/providers/db/data.module";

@Module({
  // Aqui nós avisamos a aplicação principal que o módulo de banco de dados existe
  imports: [DataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
