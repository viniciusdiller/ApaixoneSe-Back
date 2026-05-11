import { Module } from "@nestjs/common";
import { DataModule } from "../data/data.module";
import { UserApplication } from "./applications/user.Application";

@Module({
  imports: [DataModule], // Precisa do banco de dados
  providers: [UserApplication],
  exports: [UserApplication], // Libera a ponte para o Controller usar
})
export class ApplicationModule {}
