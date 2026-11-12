import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { Test } from "@nestjs/testing";
import * as jwt from "jsonwebtoken";
import request from "supertest";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { ServicoTuristaController } from "./servicoTurista.controller";
import { ServicoTuristaApplication } from "../../application/applications/servicoTurista.Application";
import { JwtStrategy } from "../../application/strategies/jwt.strategy";
import { StatusEstabelecimento, TipoServicoTurista } from "@prisma/client";
import { ServicoTuristaRepository } from "../../data/repositories/servicoTurista.repository";
import { UserRepository } from "../../data/repositories/user.repository";

const SECRET = "segredo-de-teste";

const bancoUsuarios: Record<string, any> = {};
const bancoServicos: Record<string, any> = {};
const pastasCriadasEmTeste = new Set<string>();

describe("ServicoTuristaController - uploads, erros e autorização", () => {
  let app: INestApplication;
  let pngValido: Buffer;

  const userRepoMock = {
    findById: jest.fn(async (id: string) => bancoUsuarios[id] ?? null),
    update: jest.fn(),
  };

  const servicoRepoMock = {
    save: jest.fn(async (data: any) => ({ id: "novo-1", ...data })),
    findAll: jest.fn(async () => Object.values(bancoServicos)),
    findById: jest.fn(async (id: string) => bancoServicos[id] ?? null),
    update: jest.fn(async (id: string, data: any) => ({
      ...bancoServicos[id],
      ...data,
    })),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = SECRET;
    pngValido = await sharp({
      create: {
        width: 16,
        height: 16,
        channels: 3,
        background: { r: 20, g: 120, b: 80 },
      },
    })
      .png()
      .toBuffer();

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [ServicoTuristaController],
      providers: [
        ServicoTuristaApplication,
        { provide: ServicoTuristaRepository, useValue: servicoRepoMock },
        { provide: UserRepository, useValue: userRepoMock },
        {
          provide: JwtStrategy,
          useFactory: () => {
            const strategy = new JwtStrategy({} as any);
            (strategy as any).userApplication = {
              obterSituacaoAtual: async (id: string) => {
                const u = bancoUsuarios[id];
                return u ? { perfil: u.perfil, active: u.active } : null;
              },
            };
            (strategy as any).secretOrKey = SECRET;
            return strategy;
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    bancoUsuarios["admin-1"] = { id: "admin-1", perfil: "ADMIN", active: true };
    bancoUsuarios["user-1"] = { id: "user-1", perfil: "USUARIO", active: true };
    bancoUsuarios["user-2"] = { id: "user-2", perfil: "USUARIO", active: true };

    bancoServicos["serv-1"] = {
      id: "serv-1",
      tipo: TipoServicoTurista.GUIA_TURISMO,
      nome: "Guia Original Teste",
      telefone: "21999999999",
      cnpj: "11222333000181",
      idiomas: "Português",
      usuarioId: "user-1",
      status: StatusEstabelecimento.PENDENTE,
    };
  });

  afterAll(async () => {
    await app.close();
    for (const pasta of pastasCriadasEmTeste) {
      fs.rmSync(pasta, { recursive: true, force: true });
    }
  });

  const getToken = (id: string, perfil: string) =>
    jwt.sign({ sub: id, email: "teste@teste.com", perfil }, SECRET);

  const registrarPastaLimpeza = (nomeLimpo: string) => {
    const dir = path.join(".", "uploads", "servico_turista", nomeLimpo);
    pastasCriadasEmTeste.add(dir);
    return dir;
  };

  it("POST rejeita comprovante .docx com 400 (não 500) e não grava a foto no disco", async () => {
    const dir = registrarPastaLimpeza("guia_docx_teste");
    fs.rmSync(dir, { recursive: true, force: true });

    const docxBuffer = Buffer.from("PK\x03\x04conteudo-docx-invalido");

    const res = await request(app.getHttpServer())
      .post("/servico-turista")
      .set("Authorization", `Bearer ${getToken("user-1", "USUARIO")}`)
      .field("tipo", "GUIA_TURISMO")
      .field("nome", "Guia Docx Teste")
      .field("telefone", "21999999999")
      .field("cnpj", "11222333000181")
      .field("idiomas", "Português")
      .field("termoAceite", "true")
      .attach("foto", pngValido, {
        filename: "foto.png",
        contentType: "image/png",
      })
      .attach("comprovante", docxBuffer, {
        filename: "cadastur.docx",
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      'Tipo de arquivo inválido em "Comprovante Cadastur"',
    );
    expect(fs.existsSync(dir)).toBe(false);
    expect(servicoRepoMock.save).not.toHaveBeenCalled();
  });

  it("PUT com novo nome e apenas novo comprovante cria a pasta e retorna 200 (sem ENOENT)", async () => {
    const dir = registrarPastaLimpeza("guia_nome_alterado_teste");
    fs.rmSync(dir, { recursive: true, force: true });

    const pdfBuffer = Buffer.from("%PDF-1.4\ncadastur atualizado\n%%EOF");

    const res = await request(app.getHttpServer())
      .put("/servico-turista/serv-1")
      .set("Authorization", `Bearer ${getToken("user-1", "USUARIO")}`)
      .field("nome", "Guia Nome Alterado Teste")
      .attach("comprovante", pdfBuffer, {
        filename: "cadastur_novo.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(200);
    expect(fs.existsSync(dir)).toBe(true);
    expect(servicoRepoMock.update).toHaveBeenCalledWith(
      "serv-1",
      expect.objectContaining({
        nome: "Guia Nome Alterado Teste",
        comprovanteUrl: expect.stringMatching(
          /^\/uploads\/servico_turista\/guia_nome_alterado_teste\/comprovante_.*\.pdf$/,
        ),
      }),
    );
  });

  it("PUT por usuário que não é dono retorna 403 ANTES de gravar arquivo no disco", async () => {
    const dir = registrarPastaLimpeza("tentativa_invasao_teste");
    fs.rmSync(dir, { recursive: true, force: true });

    const res = await request(app.getHttpServer())
      .put("/servico-turista/serv-1")
      .set("Authorization", `Bearer ${getToken("user-2", "USUARIO")}`)
      .field("nome", "Tentativa Invasao Teste")
      .attach("foto", pngValido, {
        filename: "foto.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(403);
    expect(fs.existsSync(dir)).toBe(false);
    expect(servicoRepoMock.update).not.toHaveBeenCalled();
  });

  it("PUT com validade inválida retorna 400", async () => {
    const res = await request(app.getHttpServer())
      .put("/servico-turista/serv-1")
      .set("Authorization", `Bearer ${getToken("admin-1", "ADMIN")}`)
      .send({ validade: "data-invalida" });

    expect(res.status).toBe(400);
  });
});
