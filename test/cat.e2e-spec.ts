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
  let tokenParceiro: string;
  let tokenAdmin: string;
  let catCriadoId: string;

  // Buffer de imagem PNG 1x1 válida para o sharp conseguir processar
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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    await prisma.cat.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: ["user@cat.com", "parceiro@cat.com", "admin@cat.com"] } },
    });

    const userComum = await prisma.user.create({
      data: {
        nome: "User Cat",
        email: "user@cat.com",
        senha: "123",
        usuario: "usercat",
        perfil: "USUARIO",
      },
    });
    const userParceiro = await prisma.user.create({
      data: {
        nome: "Parceiro Cat",
        email: "parceiro@cat.com",
        senha: "123",
        usuario: "parceirocat",
        perfil: "PARCEIRO",
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

    tokenComum = jwtService.sign({ sub: userComum.id, perfil: userComum.perfil });
    tokenParceiro = jwtService.sign({ sub: userParceiro.id, perfil: userParceiro.perfil });
    tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });
  });

  it("1. POST /cat - Sem token deve retornar 401", () => {
    return request(app.getHttpServer())
      .post("/cat")
      .field("texto", "Mapa sem auth")
      .attach("imagens", bufferImagem, "mapa.png")
      .expect(401);
  });

  it("2. POST /cat - Usuário comum TENTA subir um mapa (403)", () => {
    return request(app.getHttpServer())
      .post("/cat")
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("texto", "Mapa Turístico Falso")
      .attach("imagens", bufferImagem, "mapa.png")
      .expect(403);
  });

  it("3. POST /cat - PARCEIRO TENTA subir um mapa (403)", () => {
    return request(app.getHttpServer())
      .post("/cat")
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("texto", "Mapa do Parceiro")
      .attach("imagens", bufferImagem, "mapa.png")
      .expect(403);
  });

  it("4. POST /cat - Admin sobe um mapa com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/cat")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("texto", "Mapa Oficial de Saquarema")
      .attach("imagens", bufferImagem, "mapa.png")
      .expect(201);

    catCriadoId = resposta.body.id;
    expect(catCriadoId).toBeDefined();
  });

  it("5. POST /cat - Admin tenta criar um segundo CAT (400 - já existe)", () => {
    return request(app.getHttpServer())
      .post("/cat")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("texto", "Duplicado")
      .attach("imagens", bufferImagem, "mapa.png")
      .expect(400);
  });

  it("6. GET /cat - Lista todos (200)", () => {
    return request(app.getHttpServer()).get("/cat").expect(200);
  });

  it("7. GET /cat/:id - Busca pelo ID criado (200)", () => {
    return request(app.getHttpServer())
      .get(`/cat/${catCriadoId}`)
      .expect(200);
  });

  it("8. PUT /cat/:id - Usuário comum TENTA atualizar (403)", () => {
    return request(app.getHttpServer())
      .put(`/cat/${catCriadoId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("texto", "Tentativa indevida")
      .expect(403);
  });

  it("9. PUT /cat/:id - PARCEIRO TENTA atualizar (403)", () => {
    return request(app.getHttpServer())
      .put(`/cat/${catCriadoId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("texto", "Tentativa do parceiro")
      .expect(403);
  });

  it("10. PUT /cat/:id - Admin atualiza o texto (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/cat/${catCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("texto", "Texto Atualizado pelo Admin")
      .expect(200);

    expect(resposta.body.texto).toBe("Texto Atualizado pelo Admin");
  });

  it("11. DELETE /cat/:id - PARCEIRO TENTA apagar o mapa (403)", () => {
    return request(app.getHttpServer())
      .delete(`/cat/${catCriadoId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .expect(403);
  });

  it("12. DELETE /cat/:id - Admin apaga o mapa (204)", () => {
    return request(app.getHttpServer())
      .delete(`/cat/${catCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  it("13. GET /cat/:id - Após deletar retorna 404", () => {
    return request(app.getHttpServer())
      .get(`/cat/${catCriadoId}`)
      .expect(404);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["user@cat.com", "parceiro@cat.com", "admin@cat.com"] } },
    });

    const pastaCat = path.join(".", "uploads", "cat");
    if (fs.existsSync(pastaCat))
      fs.rmSync(pastaCat, { recursive: true, force: true });

    await app.close();
  });
});
