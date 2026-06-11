import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";

describe("Atividades - Apenas Admin (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenComum: string;
  let tokenParceiro: string;
  let tokenAdmin: string;
  let atividadeCriadaId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        JwtModule.register({ secret: process.env.JWT_SECRET || "secreta" }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    await prisma.user.deleteMany({
      where: { email: { in: ["user@ativ.com", "parceiro@ativ.com", "admin@ativ.com"] } },
    });

    const userComum = await prisma.user.create({
      data: {
        nome: "User Ativ",
        email: "user@ativ.com",
        senha: "123",
        usuario: "userativ",
        perfil: "USUARIO",
      },
    });
    const userParceiro = await prisma.user.create({
      data: {
        nome: "Parceiro Ativ",
        email: "parceiro@ativ.com",
        senha: "123",
        usuario: "parceiroativ",
        perfil: "PARCEIRO",
      },
    });
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Ativ",
        email: "admin@ativ.com",
        senha: "123",
        usuario: "adminativ",
        perfil: "ADMIN",
      },
    });

    tokenComum = jwtService.sign({ sub: userComum.id, perfil: userComum.perfil });
    tokenParceiro = jwtService.sign({ sub: userParceiro.id, perfil: userParceiro.perfil });
    tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });
  });

  it("1. POST /atividades - User Comum TENTA criar atividade (403)", () => {
    return request(app.getHttpServer())
      .post("/atividades")
      .set("Authorization", `Bearer ${tokenComum}`)
      .send({
        titulo: "Trilha",
        descricao: "Andar no mato",
        local: "Serra",
        roteiro: "ECOLOGICO",
      })
      .expect(403);
  });

  it("2. POST /atividades - PARCEIRO TENTA criar atividade (403)", () => {
    return request(app.getHttpServer())
      .post("/atividades")
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .send({
        titulo: "Trilha do Parceiro",
        descricao: "Andar no mato",
        local: "Serra",
        roteiro: "ECOLOGICO",
      })
      .expect(403);
  });

  it("3. POST /atividades - Admin cria atividade (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/atividades")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        titulo: "Passeio de Barco",
        descricao: "Lagoa top",
        local: "Lagoa",
        roteiro: "ESPORTE_E_AVENTURA",
      })
      .expect(201);

    atividadeCriadaId = resposta.body.id;
  });

  it("4. PUT /atividades/:id - PARCEIRO TENTA editar atividade (403)", () => {
    return request(app.getHttpServer())
      .put(`/atividades/${atividadeCriadaId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .send({ descricao: "Tentativa indevida" })
      .expect(403);
  });

  it("5. DELETE /atividades/:id - PARCEIRO TENTA apagar atividade (403)", () => {
    return request(app.getHttpServer())
      .delete(`/atividades/${atividadeCriadaId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .expect(403);
  });

  it("6. DELETE /atividades/:id - Admin apaga (204)", () => {
    return request(app.getHttpServer())
      .delete(`/atividades/${atividadeCriadaId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["user@ativ.com", "parceiro@ativ.com", "admin@ativ.com"] } },
    });
    await app.close();
  });
});
