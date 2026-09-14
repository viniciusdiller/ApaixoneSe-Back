import { ForbiddenException } from "@nestjs/common";
import { AcaoAuditoria } from "@prisma/client";
import { AuditLogApplication } from "./auditLog.Application";
import { AuditLogRepository } from "../../data/repositories/auditLog.repository";
import { UserRepository } from "../../data/repositories/user.repository";
import { AuditLog } from "../../data/entities/auditLog.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

describe("AuditLogApplication", () => {
  let application: AuditLogApplication;
  let repo: jest.Mocked<AuditLogRepository>;
  let userRepo: jest.Mocked<UserRepository>;

  const admin: IUsuarioLogado = { id: "admin-1", perfil: "ADMIN" };
  const parceiro: IUsuarioLogado = { id: "parceiro-1", perfil: "PARCEIRO" };
  const usuarioComum: IUsuarioLogado = { id: "user-1", perfil: "USUARIO" };

  beforeEach(() => {
    repo = {
      registrar: jest.fn(),
      listar: jest.fn(),
    } as unknown as jest.Mocked<AuditLogRepository>;

    userRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    application = new AuditLogApplication(repo, userRepo);
  });

  describe("listar", () => {
    it("lança ForbiddenException quando o usuário não é ADMIN", async () => {
      await expect(application.listar(usuarioComum, {})).rejects.toThrow(
        ForbiddenException,
      );
      expect(repo.listar).not.toHaveBeenCalled();
    });

    it("lança ForbiddenException para PARCEIRO (dono de negócio não é admin)", async () => {
      await expect(application.listar(parceiro, {})).rejects.toThrow(
        ForbiddenException,
      );
      expect(repo.listar).not.toHaveBeenCalled();
    });

    it("permite a consulta e repassa o filtro quando o usuário é ADMIN", async () => {
      const pagina = { items: [], total: 0, page: 1, pageSize: 20 };
      repo.listar.mockResolvedValue(pagina);

      const filtro = { acao: AcaoAuditoria.EXCLUIR, page: 2 };
      const resultado = await application.listar(admin, filtro);

      expect(repo.listar).toHaveBeenCalledWith(filtro);
      expect(resultado).toBe(pagina);
    });
  });

  describe("registrar", () => {
    it("usa o nome atual do admin como snapshot em adminNome", async () => {
      userRepo.findById.mockResolvedValue({ nome: "Letícia Majosene" } as any);
      repo.registrar.mockImplementation(async (log) => log);

      await application.registrar({
        adminId: "admin-1",
        acao: AcaoAuditoria.EDITAR,
        recurso: "Gastronomia",
      });

      expect(repo.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: "admin-1",
          adminNome: "Letícia Majosene",
          acao: AcaoAuditoria.EDITAR,
          recurso: "Gastronomia",
        }),
      );
      expect(repo.registrar.mock.calls[0][0]).toBeInstanceOf(AuditLog);
    });

    it("usa 'Desconhecido' quando o admin não é encontrado (conta removida)", async () => {
      userRepo.findById.mockResolvedValue(null);
      repo.registrar.mockImplementation(async (log) => log);

      await application.registrar({
        adminId: "admin-removido",
        acao: AcaoAuditoria.EXCLUIR,
        recurso: "Hospedagem",
      });

      expect(repo.registrar).toHaveBeenCalledWith(
        expect.objectContaining({ adminNome: "Desconhecido" }),
      );
    });

    it("normaliza campos opcionais ausentes para null em vez de undefined", async () => {
      userRepo.findById.mockResolvedValue({ nome: "Admin" } as any);
      repo.registrar.mockImplementation(async (log) => log);

      await application.registrar({
        adminId: "admin-1",
        acao: AcaoAuditoria.EDITAR,
        recurso: "User",
      });

      expect(repo.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          recursoId: null,
          descricao: null,
          detalhes: null,
          ip: null,
        }),
      );
    });
  });
});
