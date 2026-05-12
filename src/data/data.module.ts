import { Module } from "@nestjs/common";
import { PrismaService } from "./providers/db/prisma.Service";
import { UserRepository } from "./repositories/user.repository";

@Module({
  // Providers: O que este módulo sabe construir
  providers: [PrismaService, UserRepository],

  // Exports: O que este módulo deixa os outros usarem
  exports: [PrismaService, UserRepository],
})
export class DataModule {}
