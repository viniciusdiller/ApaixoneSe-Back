import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { Test } from "@nestjs/testing";
import * as jwt from "jsonwebtoken";
import request from "supertest";
import { HospedagemController } from "./hospedagem.controller";
import { HospedagemApplication } from "../../application/applications/hospedagem.Application";
import { JwtStrategy } from "../../application/strategies/jwt.strategy";
import { StatusEstabelecimento } from "@prisma/client";
import { HospedagemRepository } from "../../data/repositories/hospedagem.repository";
import { UserRepository } from "../../data/repositories/user.repository";

const SECRET = "segredo-de-teste";

const bancoUsuarios: Record<string, any> = {};
const bancoHospedagem: Record<string, any> = {};

describe("HospedagemController - testes de segurança de atualização", () => {
  let app: INestApplication;

  const userRepoMock = {
    findById: jest.fn(async (id: string) => bancoUsuarios[id] ?? null),
    update: jest.fn(),
  };

  const hospedagemRepoMock = {
    findById: jest.fn(async (id: string) => bancoHospedagem[id] ?? null),
    update: jest.fn(async (id: string, data: any) => ({ ...bancoHospedagem[id], ...data })),
    delete: jest.fn(),
  };

    beforeAll(async () => {
    process.env.JWT_SECRET = SECRET;
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [HospedagemController],
      providers: [
        HospedagemApplication,
        {
          provide: HospedagemRepository,
          useValue: hospedagemRepoMock,
        },
        {
          provide: UserRepository,
          useValue: userRepoMock,
        },
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

        bancoHospedagem["hosp-1"] = {
      id: "hosp-1",
      nome: "Hotel",
      usuarioId: "user-1",
      status: StatusEstabelecimento.PENDENTE,
    };
  });

  afterAll(async () => {
    await app.close();
  });

  const getToken = (id: string, perfil: string) =>
    jwt.sign({ sub: id, email: "teste@teste.com", perfil }, SECRET);

  it("usuário comum atualiza a própria hospedagem com campos permitidos (200)", async () => {
    const res = await request(app.getHttpServer())
      .put("/hospedagem/hosp-1")
      .set("Authorization", `Bearer ${getToken("user-1", "USUARIO")}`)
      .send({ nome: "Novo Nome" });
    expect(res.status).toBe(200);
  });

  it("usuário comum tenta alterar o status da própria hospedagem (403)", async () => {
    const res = await request(app.getHttpServer())
      .put("/hospedagem/hosp-1")
      .set("Authorization", `Bearer ${getToken("user-1", "USUARIO")}`)
      .send({ status: StatusEstabelecimento.APROVADO });
    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Apenas administradores podem alterar o status");
  });

  it("usuário comum tenta alterar a hospedagem de outro usuário (403)", async () => {
    const res = await request(app.getHttpServer())
      .put("/hospedagem/hosp-1")
      .set("Authorization", `Bearer ${getToken("user-2", "USUARIO")}`)
      .send({ nome: "Hacked" });
    expect(res.status).toBe(403);
    expect(res.body.message).toContain("permissão");
  });

  it("admin atualiza o status de qualquer hospedagem (200)", async () => {
    const res = await request(app.getHttpServer())
      .put("/hospedagem/hosp-1")
      .set("Authorization", `Bearer ${getToken("admin-1", "ADMIN")}`)
      .send({ status: StatusEstabelecimento.APROVADO });
    expect(res.status).toBe(200);
  });
});