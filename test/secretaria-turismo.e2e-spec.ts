import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";
import * as fs from "fs";
import * as path from "path";

describe("Secretaria de Turismo - CRUD e Permissões (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenComum: string;
  let tokenAdmin: string;
  let secretariaId: string;
  let turistandoId: string;
  let projetoId: string;

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

    const userComum = await prisma.user.create({
      data: {
        nome: "User Secretaria",
        email: "user@secretaria.com",
        senha: "123",
        usuario: "usersecretaria",
        perfil: "USUARIO",
      },
    });
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Secretaria",
        email: "admin@secretaria.com",
        senha: "123",
        usuario: "adminsecretaria",
        perfil: "ADMIN",
      },
    });

    tokenComum = jwtService.sign({ sub: userComum.id, perfil: userComum.perfil });
    tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });
  });

  // ========== SECRETARIA PRINCIPAL ==========

  it("1. GET /secretaria-turismo - Deve listar publicamente (200)", () => {
    return request(app.getHttpServer()).get("/secretaria-turismo").expect(200);
  });

  it("2. POST /secretaria-turismo - Sem token deve bloquear (401)", () => {
    return request(app.getHttpServer())
      .post("/secretaria-turismo")
      .field("textoExplicativo", "Texto sem token")
      .expect(401);
  });

  it("3. POST /secretaria-turismo - User comum TENTA criar (403)", () => {
    return request(app.getHttpServer())
      .post("/secretaria-turismo")
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("textoExplicativo", "Tentativa de invasão")
      .expect(403);
  });

  it("4. POST /secretaria-turismo - Admin cria com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/secretaria-turismo")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("textoExplicativo", "Bem-vindo à Secretaria de Turismo de Saquarema!")
      .expect(201);

    secretariaId = resposta.body.id;
    expect(secretariaId).toBeDefined();
  });

  it("5. PUT /secretaria-turismo/:id - User comum TENTA alterar texto (403)", () => {
    return request(app.getHttpServer())
      .put(`/secretaria-turismo/${secretariaId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("textoExplicativo", "Texto invasor")
      .expect(403);
  });

  it("6. PUT /secretaria-turismo/:id - Admin atualiza texto (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/secretaria-turismo/${secretariaId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("textoExplicativo", "Texto institucional atualizado")
      .expect(200);

    expect(resposta.body.textoExplicativo).toBe("Texto institucional atualizado");
  });

  // ========== TURISTANDO ==========

  it("7. POST /secretaria-turismo/:id/turistando - User comum TENTA adicionar bloco (403)", () => {
    return request(app.getHttpServer())
      .post(`/secretaria-turismo/${secretariaId}/turistando`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("titulo", "Bloco invasor")
      .field("descricao", "Tentativa")
      .expect(403);
  });

  it("8. POST /secretaria-turismo/:id/turistando - Admin adiciona bloco com imagem (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/secretaria-turismo/${secretariaId}/turistando`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Praias de Saquarema")
      .field("descricao", "As melhores praias da região")
      .attach("imagens", bufferImagem, "praia.png")
      .expect(201);

    turistandoId = resposta.body.id;
    expect(turistandoId).toBeDefined();
  });

  it("9. PUT /secretaria-turismo/turistando/:id - User comum TENTA editar bloco (403)", () => {
    return request(app.getHttpServer())
      .put(`/secretaria-turismo/turistando/${turistandoId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("titulo", "Título invasor")
      .expect(403);
  });

  it("10. PUT /secretaria-turismo/turistando/:id - Admin edita bloco (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/secretaria-turismo/turistando/${turistandoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Praias Atualizadas")
      .expect(200);

    expect(resposta.body.titulo).toBe("Praias Atualizadas");
  });

  // ========== PROJETOS ==========

  it("11. POST /secretaria-turismo/:id/projeto - User comum TENTA adicionar projeto (403)", () => {
    return request(app.getHttpServer())
      .post(`/secretaria-turismo/${secretariaId}/projeto`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("titulo", "Projeto invasor")
      .field("descricao", "Tentativa")
      .expect(403);
  });

  it("12. POST /secretaria-turismo/:id/projeto - Admin adiciona projeto com imagem (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/secretaria-turismo/${secretariaId}/projeto`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Curso de Guia")
      .field("descricao", "Capacitação para guias de turismo")
      .attach("imagem", bufferImagem, "projeto.png")
      .expect(201);

    projetoId = resposta.body.id;
    expect(projetoId).toBeDefined();
  });

  it("13. PUT /secretaria-turismo/projeto/:id - User comum TENTA editar projeto (403)", () => {
    return request(app.getHttpServer())
      .put(`/secretaria-turismo/projeto/${projetoId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .field("titulo", "Título invasor")
      .expect(403);
  });

  it("14. PUT /secretaria-turismo/projeto/:id - Admin edita projeto (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/secretaria-turismo/projeto/${projetoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Curso de Guia Atualizado")
      .expect(200);

    expect(resposta.body.titulo).toBe("Curso de Guia Atualizado");
  });

  // ========== LIMPEZA ==========

  it("15. DELETE /secretaria-turismo/turistando/:id - Admin apaga bloco (204)", () => {
    return request(app.getHttpServer())
      .delete(`/secretaria-turismo/turistando/${turistandoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  it("16. DELETE /secretaria-turismo/projeto/:id - Admin apaga projeto (204)", () => {
    return request(app.getHttpServer())
      .delete(`/secretaria-turismo/projeto/${projetoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  it("17. DELETE /secretaria-turismo/:id - User comum TENTA apagar secretaria (403)", () => {
    return request(app.getHttpServer())
      .delete(`/secretaria-turismo/${secretariaId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .expect(403);
  });

  it("18. DELETE /secretaria-turismo/:id - Admin apaga secretaria (204)", () => {
    return request(app.getHttpServer())
      .delete(`/secretaria-turismo/${secretariaId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["user@secretaria.com", "admin@secretaria.com"] } },
    });
    const pastaSecretaria = path.join(".", "uploads", "secretaria");
    if (fs.existsSync(pastaSecretaria))
      fs.rmSync(pastaSecretaria, { recursive: true, force: true });
    await app.close();
  });
});
