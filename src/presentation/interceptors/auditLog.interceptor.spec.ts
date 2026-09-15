import { CallHandler, ExecutionContext } from "@nestjs/common";
import { defer, firstValueFrom, of, throwError } from "rxjs";
import { AcaoAuditoria } from "@prisma/client";
import { AuditLogInterceptor } from "./auditLog.interceptor";
import { AuditLogApplication } from "../../application/applications/auditLog.Application";

function criarContext(
  req: any,
  controllerName = "GastronomiaController",
): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getClass: () => ({ name: controllerName }),
  } as unknown as ExecutionContext;
}

function criarHandler(fabricaObservable: () => any): CallHandler {
  return { handle: () => fabricaObservable() } as CallHandler;
}

describe("AuditLogInterceptor", () => {
  let auditLogApplication: jest.Mocked<AuditLogApplication>;
  let interceptor: AuditLogInterceptor;

  beforeEach(() => {
    auditLogApplication = {
      registrar: jest.fn().mockResolvedValue(undefined),
      buscarSnapshotAntesDeExcluir: jest
        .fn()
        .mockResolvedValue({ descricao: null, detalhes: null }),
    } as unknown as jest.Mocked<AuditLogApplication>;
    interceptor = new AuditLogInterceptor(auditLogApplication);
  });

  it("não registra quando não há usuário autenticado (rota pública)", async () => {
    const req: any = { method: "PUT", user: undefined, body: { nome: "x" } };
    await firstValueFrom(
      interceptor.intercept(criarContext(req), criarHandler(() => of({}))),
    );
    expect(auditLogApplication.registrar).not.toHaveBeenCalled();
  });

  it("não registra ações de usuários USUARIO", async () => {
    const req: any = {
      method: "PUT",
      user: { id: "u1", perfil: "USUARIO" },
      body: { nome: "x" },
    };
    await firstValueFrom(
      interceptor.intercept(criarContext(req), criarHandler(() => of({}))),
    );
    expect(auditLogApplication.registrar).not.toHaveBeenCalled();
  });

  it("não registra ações de PARCEIRO editando o próprio negócio", async () => {
    const req: any = { method: "DELETE", user: { id: "p1", perfil: "PARCEIRO" } };
    await firstValueFrom(
      interceptor.intercept(criarContext(req), criarHandler(() => of({}))),
    );
    expect(auditLogApplication.registrar).not.toHaveBeenCalled();
  });

  it("ignora GET e POST mesmo quando o usuário é ADMIN", async () => {
    const reqGet: any = { method: "GET", user: { id: "a1", perfil: "ADMIN" } };
    await firstValueFrom(
      interceptor.intercept(criarContext(reqGet), criarHandler(() => of({}))),
    );

    const reqPost: any = {
      method: "POST",
      user: { id: "a1", perfil: "ADMIN" },
      body: { nome: "novo" },
    };
    await firstValueFrom(
      interceptor.intercept(criarContext(reqPost), criarHandler(() => of({}))),
    );

    expect(auditLogApplication.registrar).not.toHaveBeenCalled();
  });

  it("não registra quando o handler falha (ex: ForbiddenException por falta de permissão)", async () => {
    const req: any = { method: "PUT", user: { id: "a1", perfil: "ADMIN" }, body: {} };
    const handler = criarHandler(() => throwError(() => new Error("falhou")));

    await expect(
      firstValueFrom(interceptor.intercept(criarContext(req), handler)),
    ).rejects.toThrow("falhou");

    expect(auditLogApplication.registrar).not.toHaveBeenCalled();
  });

  it("registra EXCLUIR em qualquer DELETE, com o id vindo dos params", async () => {
    const req: any = {
      method: "DELETE",
      user: { id: "admin-1", perfil: "ADMIN" },
      params: { id: "rec-1" },
      ip: "127.0.0.1",
    };

    await firstValueFrom(
      interceptor.intercept(
        criarContext(req, "EventoController"),
        criarHandler(() => of(undefined)),
      ),
    );

    expect(auditLogApplication.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: "admin-1",
        acao: AcaoAuditoria.EXCLUIR,
        recurso: "Evento",
        recursoId: "rec-1",
        ip: "127.0.0.1",
      }),
    );
  });

  it("busca o snapshot ANTES de excluir (o registro não existe mais depois) e usa o nome/dados retornados", async () => {
    auditLogApplication.buscarSnapshotAntesDeExcluir.mockResolvedValue({
      descricao: "Restaurante do Vineco",
      detalhes: { id: "g1", nome: "Restaurante do Vineco" },
    });
    const req: any = {
      method: "DELETE",
      user: { id: "admin-1", perfil: "ADMIN" },
      params: { id: "g1" },
    };

    await firstValueFrom(
      interceptor.intercept(
        criarContext(req, "GastronomiaController"),
        criarHandler(() => of(undefined)),
      ),
    );

    expect(auditLogApplication.buscarSnapshotAntesDeExcluir).toHaveBeenCalledWith(
      "Gastronomia",
      "g1",
    );
    expect(auditLogApplication.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        descricao: "Restaurante do Vineco",
        detalhes: { id: "g1", nome: "Restaurante do Vineco" },
      }),
    );
  });

  it("não deixa uma falha ao buscar o snapshot pré-exclusão impedir a exclusão de acontecer", async () => {
    auditLogApplication.buscarSnapshotAntesDeExcluir.mockRejectedValue(
      new Error("timeout"),
    );
    const req: any = {
      method: "DELETE",
      user: { id: "admin-1", perfil: "ADMIN" },
      params: { id: "g1" },
    };
    const handler = criarHandler(() => of({ ok: true }));

    const resultado = await firstValueFrom(
      interceptor.intercept(criarContext(req), handler),
    );

    expect(resultado).toEqual({ ok: true });
    expect(auditLogApplication.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ descricao: null, detalhes: null }),
    );
  });

  it("registra APROVAR quando o body pede status=APROVADO", async () => {
    const req: any = {
      method: "PUT",
      user: { id: "admin-1", perfil: "ADMIN" },
      params: { id: "g1" },
      body: { status: "APROVADO" },
    };
    await firstValueFrom(
      interceptor.intercept(criarContext(req), criarHandler(() => of({}))),
    );
    expect(auditLogApplication.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ acao: AcaoAuditoria.APROVAR }),
    );
  });

  it("registra REJEITAR quando o body pede status=REJEITADO", async () => {
    const req: any = {
      method: "PUT",
      user: { id: "admin-1", perfil: "ADMIN" },
      params: { id: "g1" },
      body: { status: "REJEITADO" },
    };
    await firstValueFrom(
      interceptor.intercept(criarContext(req), criarHandler(() => of({}))),
    );
    expect(auditLogApplication.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ acao: AcaoAuditoria.REJEITAR }),
    );
  });

  it("registra EDITAR como padrão para PUT/PATCH sem mudança de status", async () => {
    const req: any = {
      method: "PATCH",
      user: { id: "admin-1", perfil: "ADMIN" },
      params: { id: "u1" },
      body: { active: true },
    };
    await firstValueFrom(
      interceptor.intercept(
        criarContext(req, "UserController"),
        criarHandler(() => of({})),
      ),
    );
    expect(auditLogApplication.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ acao: AcaoAuditoria.EDITAR, recurso: "User" }),
    );
  });

  it("extrai a descrição do body priorizando nome, depois titulo, depois usuario", async () => {
    const req: any = {
      method: "PUT",
      user: { id: "admin-1", perfil: "ADMIN" },
      params: { id: "g1" },
      body: { nome: "Restaurante X", titulo: "ignorado" },
    };
    await firstValueFrom(
      interceptor.intercept(criarContext(req), criarHandler(() => of({}))),
    );
    expect(auditLogApplication.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ descricao: "Restaurante X" }),
    );
  });

  it("remove campos sensíveis (senha/token) dos detalhes gravados, mantendo o resto", async () => {
    const req: any = {
      method: "PUT",
      user: { id: "admin-1", perfil: "ADMIN" },
      params: { id: "u1" },
      body: {
        nome: "Fulano",
        senha: "123456",
        token: "abc",
        email: "fulano@teste.com",
      },
    };
    await firstValueFrom(
      interceptor.intercept(
        criarContext(req, "UserController"),
        criarHandler(() => of({})),
      ),
    );

    const chamada = auditLogApplication.registrar.mock.calls[0][0];
    expect(chamada.detalhes).toEqual({
      nome: "Fulano",
      email: "fulano@teste.com",
    });
  });

  it("só lê req.body depois do handler responder (multer/FileFieldsInterceptor preenche o body DEPOIS deste interceptor global)", async () => {
    // Regressão: ler req.body antes de next.handle() sempre pegava o body
    // vazio em rotas multipart, porque quem preenche req.body é o
    // FileFieldsInterceptor (local), que só roda quando o Observable do
    // handler é de fato subscrito - exatamente o que este teste simula.
    const req: any = {
      method: "PUT",
      user: { id: "admin-1", perfil: "ADMIN" },
      params: { id: "g1" },
      body: undefined,
    };
    const handler = criarHandler(() =>
      defer(() => {
        req.body = { nome: "Preenchido pelo multer" };
        return of({ id: "g1" });
      }),
    );

    await firstValueFrom(interceptor.intercept(criarContext(req), handler));

    expect(auditLogApplication.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ descricao: "Preenchido pelo multer" }),
    );
  });

  it("nunca deixa uma falha ao gravar o log quebrar a resposta ao admin", async () => {
    auditLogApplication.registrar.mockRejectedValue(
      new Error("banco fora do ar"),
    );
    const req: any = {
      method: "DELETE",
      user: { id: "admin-1", perfil: "ADMIN" },
      params: { id: "g1" },
    };

    const resultado = await firstValueFrom(
      interceptor.intercept(criarContext(req), criarHandler(() => of({ ok: true }))),
    );

    expect(resultado).toEqual({ ok: true });
  });
});
