import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
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

  const bufferPdf = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj",
    "utf-8",
  );

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

  it("1. POST /cat - User TENTA subir um mapa (403)", () => {
    return request(app.getHttpServer())
      .post("/cat")
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("texto", "Mapa Turístico Falso")
      .attach("arquivo", bufferPdf, "mapa.pdf")
      .expect(403);
  });

  it("2. POST /cat - Admin sobe um mapa com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/cat")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("texto", "Mapa Oficial de Saquarema")
      .attach("arquivo", bufferPdf, "mapa.pdf")
      .expect(201);

    catCriadoId = resposta.body.id;
  });

  it("3. DELETE /cat/:id - Admin apaga o mapa (204)", () => {
    return request(app.getHttpServer())
      .delete(`/cat/${catCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["user@cat.com", "admin@cat.com"] } },
    });

    // Limpeza super poderosa: Apaga qualquer pasta que o teste do CAT tenha criado
    const pastaCat = path.join(".", "uploads", "Cat");
    if (fs.existsSync(pastaCat))
      fs.rmSync(pastaCat, { recursive: true, force: true });

    await app.close();
  });
});
