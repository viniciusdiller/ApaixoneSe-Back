import { AuditCleanupService } from "./auditCleanup.service";
import { PrismaService } from "../../data/providers/db/prisma.Service";

describe("AuditCleanupService", () => {
  let service: AuditCleanupService;
  let prisma: { auditLog: { deleteMany: jest.Mock } };

  beforeEach(() => {
    prisma = {
      auditLog: { deleteMany: jest.fn() },
    };
    service = new AuditCleanupService(prisma as unknown as PrismaService);
  });

  it("deleta logs mais antigos que 45 dias e loga a contagem", async () => {
    prisma.auditLog.deleteMany.mockResolvedValue({ count: 1500 });
    const logSpy = jest
      .spyOn((service as any).logger, "log")
      .mockImplementation(() => undefined);

    await service.limparLogsAntigos();

    expect(prisma.auditLog.deleteMany).toHaveBeenCalledTimes(1);
    const where = prisma.auditLog.deleteMany.mock.calls[0][0].where;
    const limite: Date = where.createdAt.lt;

    const diffDias =
      (Date.now() - limite.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDias).toBeGreaterThanOrEqual(44.99);
    expect(diffDias).toBeLessThanOrEqual(45.01);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("1500"));
  });

  it("nunca lanca - so loga o erro se o deleteMany falhar", async () => {
    prisma.auditLog.deleteMany.mockRejectedValue(new Error("conexao perdida"));
    const errorSpy = jest
      .spyOn((service as any).logger, "error")
      .mockImplementation(() => undefined);

    await expect(service.limparLogsAntigos()).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });
});
