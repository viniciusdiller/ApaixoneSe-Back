import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../data/providers/db/prisma.Service";

const RETENCAO_DIAS = 45;

/**
 * VPS com disco limitado - audit_logs nao pode crescer indefinidamente.
 * Roda todo dia a meia-noite e apaga fisicamente (deleteMany) tudo que
 * passou da janela de retencao (45 dias). createdAt tem indice dedicado
 * (@@index([createdAt]) no schema) pra esse filtro nao virar full table
 * scan conforme a tabela cresce.
 */
@Injectable()
export class AuditCleanupService {
  private readonly logger = new Logger(AuditCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async limparLogsAntigos(): Promise<void> {
    const limite = new Date();
    limite.setDate(limite.getDate() - RETENCAO_DIAS);

    try {
      const resultado = await this.prisma.auditLog.deleteMany({
        where: { createdAt: { lt: limite } },
      });
      this.logger.log(
        `Cleanup: ${resultado.count} logs antigos deletados (anteriores a ${limite.toISOString()}).`,
      );
    } catch (error) {
      this.logger.error("Cleanup: falha ao deletar logs antigos.", error);
    }
  }
}
