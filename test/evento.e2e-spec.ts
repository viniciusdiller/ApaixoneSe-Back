import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";

describe("Eventos - Apenas Admin (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenComum: string;
  let tokenAdmin: string;
  let eventoCriadoId: string;

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

    const userComum = await prisma.user.create({
      data: {
        nome: "User Event",
        email: "user@event.com",
        senha: "123",
        usuario: "userevent",
        perfil: "USUARIO",
      },
    });
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Event",
        email: "admin@event.com",
        senha: "123",
        usuario: "adminevent",
        perfil: "ADMIN",
      },
    });

    tokenComum = jwtService.sign({
      sub: userComum.id,
      perfil: userComum.perfil,
    });
    tokenAdmin = jwtService.sign({
      sub: userAdmin.id,
      perfil: userAdmin.perfil,
    });
  });

  it("1. GET /eventos - Listar publicamente (200)", () => {
    return request(app.getHttpServer()).get("/eventos").expect(200);
  });

  it("2. POST /eventos - Utilizador Comum TENTA criar evento (403)", () => {
    return request(app.getHttpServer())
      .post("/eventos")
      .set("Authorization", `Bearer ${tokenComum}`)
      .send({
        titulo: "Festa Fake",
        descricao: "Teste",
        data: new Date().toISOString(),
        local: "Praça",
      })
      .expect(403); // O Admin Guard bloqueia!
  });

  it("3. POST /eventos - Admin cria evento com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/eventos")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        titulo: "Saquarema Surf Festival",
        descricao: "Maior campeonato!",
        data: new Date().toISOString(),
        local: "Praia de Itaúna",
      })
      .expect(201);

    eventoCriadoId = resposta.body.id;
  });

  it("4. DELETE /eventos/:id - Utilizador Comum TENTA apagar (403)", () => {
    return request(app.getHttpServer())
      .delete(`/eventos/${eventoCriadoId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .expect(403);
  });

  it("5. DELETE /eventos/:id - Admin apaga o evento (204)", () => {
    return request(app.getHttpServer())
      .delete(`/eventos/${eventoCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["user@event.com", "admin@event.com"] } },
    });
    await app.close();
  });
});
