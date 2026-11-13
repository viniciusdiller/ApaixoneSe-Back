import { BadRequestException, HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaExceptionFilter } from "./prisma-exception.filter";
import {
  AllExceptionsFilter,
  MENSAGEM_ERRO_INESPERADO,
} from "./all-exceptions.filter";

function criarHostFalso() {
  const res: any = {
    statusCode: 0,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };
  const req = { method: "POST", url: "/api/servico-turista" };
  const host: any = {
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => req,
    }),
  };
  return { host, res };
}

function criarErroPrisma(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError("Erro Prisma simulado", {
    code,
    clientVersion: "6.0.0",
    meta,
  });
}

describe("PrismaExceptionFilter e AllExceptionsFilter", () => {
  const prismaFilter = new PrismaExceptionFilter();
  const allFilter = new AllExceptionsFilter();

  it("P2002 retorna 409 com o nome do campo", () => {
    const { host, res } = criarHostFalso();
    prismaFilter.catch(
      criarErroPrisma("P2002", { target: "hospedagens_cnpj_key" }),
      host,
    );

    expect(res.statusCode).toBe(HttpStatus.CONFLICT);
    expect(res.body.message).toEqual(["Este cnpj já está cadastrado(a)."]);
  });

  it("P2025 retorna 404 amigável em vez de 500", () => {
    const { host, res } = criarHostFalso();
    prismaFilter.catch(criarErroPrisma("P2025"), host);

    expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(res.body.message).toBe("Registro não encontrado.");
  });

  it("P2000 e P2003 retornam 400 amigável em vez de 500", () => {
    const r1 = criarHostFalso();
    prismaFilter.catch(criarErroPrisma("P2000"), r1.host);
    expect(r1.res.statusCode).toBe(HttpStatus.BAD_REQUEST);

    const r2 = criarHostFalso();
    prismaFilter.catch(criarErroPrisma("P2003"), r2.host);
    expect(r2.res.statusCode).toBe(HttpStatus.BAD_REQUEST);
  });

  it("PrismaClientValidationError retorna 400 sem vazar detalhes do schema", () => {
    const { host, res } = criarHostFalso();
    const err = new Prisma.PrismaClientValidationError(
      "Invalid value for argument `validade`",
      { clientVersion: "6.0.0" },
    );
    prismaFilter.catch(err, host);

    expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body.message).toBe("Os dados enviados são inválidos.");
  });

  it("AllExceptionsFilter preserva HttpException (status e mensagem)", () => {
    const { host, res } = criarHostFalso();
    allFilter.catch(new BadRequestException("Tipo de arquivo inválido."), host);

    expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body.message).toBe("Tipo de arquivo inválido.");
  });

  it("AllExceptionsFilter converte erro genérico em 500 com mensagem amigável (nunca 'Internal server error')", () => {
    const { host, res } = criarHostFalso();
    allFilter.catch(
      new Error("Input buffer contains unsupported image format"),
      host,
    );

    expect(res.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.body.message).toBe(MENSAGEM_ERRO_INESPERADO);
    expect(res.body.message).not.toBe("Internal server error");
  });
});
