import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";
import * as fs from "fs";
import * as path from "path";

// Buffer de imagem PNG 1x1 válida para o sharp processar
const bufferImagem = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

describe("Fique Por Dentro - Galeria ordenada, apenas Admin altera (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenUsuario: string;
  let tokenParceiro: string;
  let tokenAdmin: string;

  // IDs das imagens criadas — usados nos testes de DELETE
  let idImagem1: string;
  let idImagem2: string;

  // ──────────────────────────────────────────────────────────────────────────
  // SETUP
  // ──────────────────────────────────────────────────────────────────────────
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        JwtModule.register({ secret: process.env.JWT_SECRET || "secreta" }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Limpa registros de testes anteriores
    await prisma.fiquePorDentro.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "usuario@fiquepordentro.com",
            "parceiro@fiquepordentro.com",
            "admin@fiquepordentro.com",
          ],
        },
      },
    });

    // Cria os 3 tipos de usuário para os testes
    const userUsuario = await prisma.user.create({
      data: {
        nome: "Usuário Fique Por Dentro",
        email: "usuario@fiquepordentro.com",
        senha: "123",
        usuario: "usuariofiquepordentro",
        perfil: "USUARIO",
      },
    });

    const userParceiro = await prisma.user.create({
      data: {
        nome: "Parceiro Fique Por Dentro",
        email: "parceiro@fiquepordentro.com",
        senha: "123",
        usuario: "parceirofiquepordentro",
        perfil: "PARCEIRO",
      },
    });

    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Fique Por Dentro",
        email: "admin@fiquepordentro.com",
        senha: "123",
        usuario: "adminfiquepordentro",
        perfil: "ADMIN",
      },
    });

    tokenUsuario = jwtService.sign({
      sub: userUsuario.id,
      perfil: userUsuario.perfil,
    });
    tokenParceiro = jwtService.sign({
      sub: userParceiro.id,
      perfil: userParceiro.perfil,
    });
    tokenAdmin = jwtService.sign({
      sub: userAdmin.id,
      perfil: userAdmin.perfil,
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCO 1: POST /fique-por-dentro — Controle de acesso
  // ══════════════════════════════════════════════════════════════════════════

  it("1. POST /fique-por-dentro — Sem token deve retornar 401", () => {
    return request(app.getHttpServer())
      .post("/fique-por-dentro")
      .field("ordem", "1")
      .attach("imagem", bufferImagem, "foto.png")
      .expect(401);
  });

  it("2. POST /fique-por-dentro — USUARIO tenta adicionar imagem (403)", () => {
    return request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .field("ordem", "1")
      .attach("imagem", bufferImagem, "foto.png")
      .expect(403);
  });

  it("3. POST /fique-por-dentro — PARCEIRO tenta adicionar imagem (403)", () => {
    return request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("ordem", "1")
      .attach("imagem", bufferImagem, "foto.png")
      .expect(403);
  });

  it("4. POST /fique-por-dentro — Sem arquivo de imagem deve retornar 400", () => {
    return request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("ordem", "1")
      .expect(400);
  });

  it("5. POST /fique-por-dentro — Ordem inválida (ex: '6') deve retornar 400", () => {
    return request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("ordem", "6")
      .attach("imagem", bufferImagem, "foto.png")
      .expect(400);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCO 2: POST — Criação real das imagens
  // ══════════════════════════════════════════════════════════════════════════

  it("6. POST /fique-por-dentro — ADMIN adiciona imagem na posição '1' (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("ordem", "1")
      .attach("imagem", bufferImagem, "foto1.png")
      .expect(201);

    expect(resposta.body.id).toBeDefined();
    expect(resposta.body.ordem).toBe("1");
    expect(resposta.body.imagemUrl).toContain("imagem_1_");

    idImagem1 = resposta.body.id;
  });

  it("7. POST /fique-por-dentro — ADMIN adiciona imagem na posição '3' (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("ordem", "3")
      .attach("imagem", bufferImagem, "foto3.png")
      .expect(201);

    expect(resposta.body.ordem).toBe("3");
    expect(resposta.body.imagemUrl).toContain("imagem_3_");

    idImagem2 = resposta.body.id;
  });

  it("8. POST /fique-por-dentro — Tenta adicionar NOVAMENTE na posição '1' (409 Conflict)", () => {
    return request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("ordem", "1")
      .attach("imagem", bufferImagem, "foto_duplicada.png")
      .expect(409);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCO 3: GET /fique-por-dentro — Consulta pública ordenada
  // ══════════════════════════════════════════════════════════════════════════

  it("9. GET /fique-por-dentro — Retorna lista ordenada sem token (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .get("/fique-por-dentro")
      .expect(200);

    expect(Array.isArray(resposta.body)).toBe(true);
    expect(resposta.body.length).toBe(2);
    // Deve vir ordenado: ordem "1" antes de "3"
    expect(resposta.body[0].ordem).toBe("1");
    expect(resposta.body[1].ordem).toBe("3");
  });

  it("10. GET /fique-por-dentro — USUARIO pode consultar (200)", () => {
    return request(app.getHttpServer())
      .get("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .expect(200);
  });

  it("11. GET /fique-por-dentro — PARCEIRO pode consultar (200)", () => {
    return request(app.getHttpServer())
      .get("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .expect(200);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCO 4: DELETE /fique-por-dentro/:id — Remove UMA imagem
  // ══════════════════════════════════════════════════════════════════════════

  it("12. DELETE /fique-por-dentro/:id — Sem token deve retornar 401", () => {
    return request(app.getHttpServer())
      .delete(`/fique-por-dentro/${idImagem1}`)
      .expect(401);
  });

  it("13. DELETE /fique-por-dentro/:id — USUARIO tenta deletar (403)", () => {
    return request(app.getHttpServer())
      .delete(`/fique-por-dentro/${idImagem1}`)
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .expect(403);
  });

  it("14. DELETE /fique-por-dentro/:id — PARCEIRO tenta deletar (403)", () => {
    return request(app.getHttpServer())
      .delete(`/fique-por-dentro/${idImagem1}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .expect(403);
  });

  it("15. DELETE /fique-por-dentro/:id — ADMIN deleta a imagem '1' (204)", async () => {
    await request(app.getHttpServer())
      .delete(`/fique-por-dentro/${idImagem1}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  it("16. GET /fique-por-dentro — Após deletar '1', só deve restar a imagem '3'", async () => {
    const resposta = await request(app.getHttpServer())
      .get("/fique-por-dentro")
      .expect(200);

    expect(resposta.body.length).toBe(1);
    // A imagem '3' permanece intacta — DELETE não afeta as outras
    expect(resposta.body[0].ordem).toBe("3");
  });

  it("17. POST /fique-por-dentro — Pode adicionar novamente na posição '1' após deletar (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("ordem", "1")
      .attach("imagem", bufferImagem, "foto1_nova.png")
      .expect(201);

    expect(resposta.body.ordem).toBe("1");
  });

  it("18. DELETE /fique-por-dentro/:id — ID inexistente deve retornar 404", () => {
    return request(app.getHttpServer())
      .delete("/fique-por-dentro/id-que-nao-existe")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(404);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCO 5: Limite máximo de 5 imagens
  // ══════════════════════════════════════════════════════════════════════════

  it("19. POST — Preenche posições '2', '4' e '5' para atingir o limite de 5 imagens", async () => {
    await request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("ordem", "2")
      .attach("imagem", bufferImagem, "foto2.png")
      .expect(201);

    await request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("ordem", "4")
      .attach("imagem", bufferImagem, "foto4.png")
      .expect(201);

    await request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("ordem", "5")
      .attach("imagem", bufferImagem, "foto5.png")
      .expect(201);
  });

  it("20. POST — Com 5 imagens, qualquer nova tentativa retorna 409", () => {
    // Todas as posições 1-5 estão ocupadas, então 409 por limite atingido
    return request(app.getHttpServer())
      .post("/fique-por-dentro")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("ordem", "1")
      .attach("imagem", bufferImagem, "foto_extra.png")
      .expect(409);
  });

  it("21. GET — Com 5 imagens, retorna todas ordenadas de '1' a '5'", async () => {
    const resposta = await request(app.getHttpServer())
      .get("/fique-por-dentro")
      .expect(200);

    expect(resposta.body.length).toBe(5);
    expect(resposta.body.map((i: any) => i.ordem)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEARDOWN: limpa banco e arquivos físicos
  // ──────────────────────────────────────────────────────────────────────────
  afterAll(async () => {
    await prisma.fiquePorDentro.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "usuario@fiquepordentro.com",
            "parceiro@fiquepordentro.com",
            "admin@fiquepordentro.com",
          ],
        },
      },
    });

    // Remove arquivos físicos gerados durante os testes
    const pastaUpload = path.join(".", "uploads", "fique-por-dentro");
    if (fs.existsSync(pastaUpload)) {
      fs.rmSync(pastaUpload, { recursive: true, force: true });
    }

    await app.close();
  });
});
