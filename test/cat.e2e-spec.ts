import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";
import * as fs from "fs";
import * as path from "path";

describe("CAT - Apenas Admin (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenComum: string;
  let tokenAdmin: string;
  let catCriadoId: string;

  // Buffer de imagem PNG mínima válida (1x1 pixel)
  const bufferImagem = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
  );

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        JwtModule.register({ secret: process.env.JWT_SECRET || "secreta" }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Replicar o ValidationPipe global do main.ts
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Limpar qualquer CAT residual de execuções anteriores
    await prisma.cat.deleteMany({});

    const userComum = await prisma.user.create({
      data: {
        nome: "User Cat",
        email: "user@cat.com",
        senha: "123",
        usuario: "usercat",
        perfil: "USUARIO",
      },
    });
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Cat",
        email: "admin@cat.com",
        senha: "123",
        usuario: "admincat",
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

  it("1. POST /cat - Sem token deve bloquear (401)", () => {
    return request(app.getHttpServer())
      .post("/cat")
      .field("texto", "Mapa Sem Token")
      .attach("imagens", bufferImagem, "imagem.png")
      .expect(401);
  });

  it("2. POST /cat - User TENTA criar CAT (403)", () => {
    return request(app.getHttpServer())
      .post("/cat")
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("texto", "Mapa Turístico Falso")
      .attach("imagens", bufferImagem, "imagem.png")
      .expect(403);
  });

  it("3. POST /cat - Admin cria CAT com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/cat")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("texto", "Informações Oficiais do CAT de Saquarema")
      .attach("imagens", bufferImagem, "imagem.png")
      .expect(201);

    catCriadoId = resposta.body.id;
    expect(catCriadoId).toBeDefined();
  });

  it("4. GET /cat - Deve listar publicamente (200)", () => {
    return request(app.getHttpServer()).get("/cat").expect(200);
  });

  it("5. GET /cat/:id - Deve buscar pelo ID (200)", () => {
    return request(app.getHttpServer())
      .get(`/cat/${catCriadoId}`)
      .expect(200);
  });

  it("6. POST /cat - Admin TENTA criar um segundo CAT (400 - já existe)", () => {
    return request(app.getHttpServer())
      .post("/cat")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("texto", "Segundo CAT — deve falhar")
      .attach("imagens", bufferImagem, "imagem2.png")
      .expect(400);
  });

  it("7. PUT /cat/:id - User TENTA atualizar CAT (403)", () => {
    return request(app.getHttpServer())
      .put(`/cat/${catCriadoId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("texto", "Tentativa de invasão")
      .expect(403);
  });

  it("8. PUT /cat/:id - Admin atualiza CAT (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/cat/${catCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("texto", "Texto atualizado com sucesso")
      .expect(200);

    expect(resposta.body.texto).toBe("Texto atualizado com sucesso");
  });

  it("9. DELETE /cat/:id - User TENTA apagar CAT (403)", () => {
    return request(app.getHttpServer())
      .delete(`/cat/${catCriadoId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .expect(403);
  });

  it("10. DELETE /cat/:id - Admin apaga o CAT (204)", () => {
    return request(app.getHttpServer())
      .delete(`/cat/${catCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.cat.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: ["user@cat.com", "admin@cat.com"] } },
    });

    const pastaCat = path.join(".", "uploads", "cat");
    if (fs.existsSync(pastaCat))
      fs.rmSync(pastaCat, { recursive: true, force: true });

    await app.close();
  });
});
