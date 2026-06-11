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

  let tokenAdmin: string;
  let tokenUsuario: string;
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

    // Limpar dados residuais
    await prisma.user.deleteMany({
      where: { email: { in: ["admin@secretaria.com", "user@secretaria.com"] } },
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
    const userComum = await prisma.user.create({
      data: {
        nome: "User Secretaria",
        email: "user@secretaria.com",
        senha: "123",
        usuario: "usersecretaria",
        perfil: "USUARIO",
      },
    });

    tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });
    tokenUsuario = jwtService.sign({ sub: userComum.id, perfil: userComum.perfil });
  });

  // ===== SECRETARIA PRINCIPAL =====

  it("1. GET /secretaria-turismo - Listar (200)", () => {
    return request(app.getHttpServer()).get("/secretaria-turismo").expect(200);
  });

  it("2. POST /secretaria-turismo - Sem token retorna 401", () => {
    return request(app.getHttpServer())
      .post("/secretaria-turismo")
      .field("titulo", "Secretaria Sem Auth")
      .expect(401);
  });

  it("3. POST /secretaria-turismo - Usuário comum TENTA criar (403)", () => {
    return request(app.getHttpServer())
      .post("/secretaria-turismo")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .field("titulo", "Tentativa de usuário")
      .expect(403);
  });

  it("4. POST /secretaria-turismo - Admin cria com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/secretaria-turismo")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Secretaria de Turismo de Saquarema")
      .field("texto", "Texto institucional da secretaria")
      .expect(201);

    secretariaId = resposta.body.id;
    expect(secretariaId).toBeDefined();
  });

  it("5. PUT /secretaria-turismo/:id - Usuário comum TENTA alterar texto (403)", () => {
    return request(app.getHttpServer())
      .put(`/secretaria-turismo/${secretariaId}`)
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .field("titulo", "Invasão de usuário")
      .expect(403);
  });

  it("6. PUT /secretaria-turismo/:id - Admin atualiza texto (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/secretaria-turismo/${secretariaId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Secretaria Atualizada")
      .expect(200);

    expect(resposta.body.titulo).toBe("Secretaria Atualizada");
  });

  // ===== TURISTANDO =====

  it("7. POST /secretaria-turismo/:id/turistando - Usuário TENTA criar (403)", () => {
    return request(app.getHttpServer())
      .post(`/secretaria-turismo/${secretariaId}/turistando`)
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .field("titulo", "Tentativa")
      .expect(403);
  });

  it("8. POST /secretaria-turismo/:id/turistando - Admin cria bloco (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/secretaria-turismo/${secretariaId}/turistando`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Passeio à Lagoa de Saquarema")
      .field("texto", "Descrição do passeio")
      .attach("imagens", bufferImagem, "passeio.png")
      .expect(201);

    turistandoId = resposta.body.id;
    expect(turistandoId).toBeDefined();
  });

  it("9. PUT /secretaria-turismo/turistando/:id - Usuário TENTA alterar (403)", () => {
    return request(app.getHttpServer())
      .put(`/secretaria-turismo/turistando/${turistandoId}`)
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .field("titulo", "Invasão")
      .expect(403);
  });

  it("10. PUT /secretaria-turismo/turistando/:id - Admin atualiza (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/secretaria-turismo/turistando/${turistandoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Passeio Atualizado")
      .expect(200);

    expect(resposta.body.titulo).toBe("Passeio Atualizado");
  });

  // ===== PROJETOS =====

  it("11. POST /secretaria-turismo/:id/projeto - Usuário TENTA criar (403)", () => {
    return request(app.getHttpServer())
      .post(`/secretaria-turismo/${secretariaId}/projeto`)
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .field("titulo", "Projeto Invasor")
      .expect(403);
  });

  it("12. POST /secretaria-turismo/:id/projeto - Admin cria projeto (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/secretaria-turismo/${secretariaId}/projeto`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Projeto Turismo Sustentável")
      .field("texto", "Descrição do projeto")
      .attach("imagem", bufferImagem, "projeto.png")
      .expect(201);

    projetoId = resposta.body.id;
    expect(projetoId).toBeDefined();
  });

  it("13. PUT /secretaria-turismo/projeto/:id - Usuário TENTA alterar (403)", () => {
    return request(app.getHttpServer())
      .put(`/secretaria-turismo/projeto/${projetoId}`)
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .field("titulo", "Invasão")
      .expect(403);
  });

  it("14. PUT /secretaria-turismo/projeto/:id - Admin atualiza (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/secretaria-turismo/projeto/${projetoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Projeto Atualizado")
      .expect(200);

    expect(resposta.body.titulo).toBe("Projeto Atualizado");
  });

  // ===== DELEÇÕES =====

  it("15. DELETE /secretaria-turismo/turistando/:id - Usuário TENTA deletar (403)", () => {
    return request(app.getHttpServer())
      .delete(`/secretaria-turismo/turistando/${turistandoId}`)
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .expect(403);
  });

  it("16. DELETE /secretaria-turismo/turistando/:id - Admin deleta (204)", () => {
    return request(app.getHttpServer())
      .delete(`/secretaria-turismo/turistando/${turistandoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  it("17. DELETE /secretaria-turismo/projeto/:id - Admin deleta projeto (204)", () => {
    return request(app.getHttpServer())
      .delete(`/secretaria-turismo/projeto/${projetoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  it("18. DELETE /secretaria-turismo/:id - Usuário TENTA deletar secretaria (403)", () => {
    return request(app.getHttpServer())
      .delete(`/secretaria-turismo/${secretariaId}`)
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .expect(403);
  });

  it("19. DELETE /secretaria-turismo/:id - Admin deleta secretaria (204)", () => {
    return request(app.getHttpServer())
      .delete(`/secretaria-turismo/${secretariaId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["admin@secretaria.com", "user@secretaria.com"] } },
    });

    const pastaSecretaria = path.join(".", "uploads", "secretaria");
    if (fs.existsSync(pastaSecretaria))
      fs.rmSync(pastaSecretaria, { recursive: true, force: true });

    await app.close();
  });
});
