import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";
import * as fs from "fs";
import * as path from "path";

describe("Servico Turista - CRUD e Permissões (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenDono: string;
  let tokenAdmin: string;
  let tokenInvasor: string;
  let servicoCriadoId: string;

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
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    const userDono = await prisma.user.create({
      data: {
        nome: "Dono Serv",
        email: "donoserv@teste.com",
        senha: "123",
        usuario: "donoserv",
        perfil: "USUARIO",
      },
    });
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Serv",
        email: "adminserv@teste.com",
        senha: "123",
        usuario: "adminserv",
        perfil: "ADMIN",
      },
    });
    const userInvasor = await prisma.user.create({
      data: {
        nome: "Invasor Serv",
        email: "invasorserv@teste.com",
        senha: "123",
        usuario: "invasorserv",
        perfil: "USUARIO",
      },
    });

    tokenDono = jwtService.sign({ sub: userDono.id, perfil: userDono.perfil });
    tokenAdmin = jwtService.sign({
      sub: userAdmin.id,
      perfil: userAdmin.perfil,
    });
    tokenInvasor = jwtService.sign({
      sub: userInvasor.id,
      perfil: userInvasor.perfil,
    });
  });

  it("1. GET /servico-turista - Listar (200)", () => {
    return request(app.getHttpServer()).get("/servico-turista").expect(200);
  });

  it("2. POST /servico-turista - Agência sem Logo deve falhar (400)", () => {
    return (
      request(app.getHttpServer())
        .post("/servico-turista")
        .set("Authorization", `Bearer ${tokenDono}`)
        .field("nome", "Agência Bugada")
        .field("tipo", "AGENCIA_TURISMO")
        // Enviando 'foto' em vez de 'logo' para testar a validação do controller
        .attach("foto", bufferImagem, "foto.png")
        .expect(400)
    );
  });

  it("3. POST /servico-turista - Criar Agência com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/servico-turista")
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("nome", "Agencia E2E")
      .field("telefone", "999999999")
      .field("tipo", "AGENCIA_TURISMO")
      .attach("logo", bufferImagem, "logo.png") // Agência pede logo
      .expect(201);

    servicoCriadoId = resposta.body.id;
  });

  it("4. PUT /servico-turista/:id - Invasor tenta alterar (403)", () => {
    return request(app.getHttpServer())
      .put(`/servico-turista/${servicoCriadoId}`)
      .set("Authorization", `Bearer ${tokenInvasor}`)
      .field("telefone", "000")
      .expect(403);
  });

  it("5. PUT /servico-turista/:id - Admin aprova (200)", () => {
    return request(app.getHttpServer())
      .put(`/servico-turista/${servicoCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("status", "APROVADO")
      .expect(200);
  });

  it("6. DELETE /servico-turista/:id - Admin apaga (204)", () => {
    return request(app.getHttpServer())
      .delete(`/servico-turista/${servicoCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "donoserv@teste.com",
            "adminserv@teste.com",
            "invasorserv@teste.com",
          ],
        },
      },
    });
    const pastaFisica = path.join(
      ".",
      "uploads",
      "Servico_Turista",
      "Agencias de Turismo",
      "agencia_e2e",
    );
    if (fs.existsSync(pastaFisica))
      fs.rmSync(pastaFisica, { recursive: true, force: true });
    await app.close();
  });
});
