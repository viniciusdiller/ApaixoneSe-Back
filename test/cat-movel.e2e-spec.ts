import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";
import * as fs from "fs";
import * as path from "path";

describe("CAT Móvel - Singleton, apenas Admin altera (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenUsuario: string;
  let tokenParceiro: string;
  let tokenAdmin: string;

  // Buffer de imagem PNG 1x1 válida para o sharp conseguir processar
  const bufferImagem = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
  );

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
    await prisma.catMovel.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "usuario@catmovel.com",
            "parceiro@catmovel.com",
            "admin@catmovel.com",
          ],
        },
      },
    });

    // Cria os 3 tipos de usuário
    const userUsuario = await prisma.user.create({
      data: {
        nome: "Usuário Cat Móvel",
        email: "usuario@catmovel.com",
        senha: "123",
        usuario: "usuariocatmovel",
        perfil: "USUARIO",
      },
    });

    const userParceiro = await prisma.user.create({
      data: {
        nome: "Parceiro Cat Móvel",
        email: "parceiro@catmovel.com",
        senha: "123",
        usuario: "parceirocatmovel",
        perfil: "PARCEIRO",
      },
    });

    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Cat Móvel",
        email: "admin@catmovel.com",
        senha: "123",
        usuario: "admincatmovel",
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
  // BLOCO 1: POST /cat-movel  —  Configuração inicial
  // ══════════════════════════════════════════════════════════════════════════

  it("1. POST /cat-movel — Sem token deve retornar 401", () => {
    return request(app.getHttpServer())
      .post("/cat-movel")
      .field("titulo", "CAT sem auth")
      .field("descricao", "Descrição sem auth")
      .attach("imagem", bufferImagem, "foto.png")
      .expect(401);
  });

  it("2. POST /cat-movel — USUARIO tenta configurar (403)", () => {
    return request(app.getHttpServer())
      .post("/cat-movel")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .field("titulo", "Tentativa de Usuário")
      .field("descricao", "Não deve funcionar")
      .attach("imagem", bufferImagem, "foto.png")
      .expect(403);
  });

  it("3. POST /cat-movel — PARCEIRO tenta configurar (403)", () => {
    return request(app.getHttpServer())
      .post("/cat-movel")
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("titulo", "Tentativa de Parceiro")
      .field("descricao", "Não deve funcionar")
      .attach("imagem", bufferImagem, "foto.png")
      .expect(403);
  });

  it("4. POST /cat-movel — Sem mídia deve retornar 400 (mesmo sendo Admin)", () => {
    return request(app.getHttpServer())
      .post("/cat-movel")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "CAT sem mídia")
      .field("descricao", "Esqueci de anexar a mídia")
      .expect(400);
  });

  it("5. POST /cat-movel — Com imagem E vídeo ao mesmo tempo deve retornar 400", () => {
    const bufferVideo = Buffer.from("fakevideodata");
    return request(app.getHttpServer())
      .post("/cat-movel")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "CAT com duas mídias")
      .field("descricao", "Isso é inválido")
      .attach("imagem", bufferImagem, "foto.png")
      .attach("video", bufferVideo, "video.mp4")
      .expect(400);
  });

  it("6. POST /cat-movel — ADMIN configura com imagem com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/cat-movel")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "CAT Móvel Oficial")
      .field("descricao", "Venha nos visitar na praça central!")
      .attach("imagem", bufferImagem, "foto.png")
      .expect(201);

    expect(resposta.body.id).toBeDefined();
    expect(resposta.body.titulo).toBe("CAT Móvel Oficial");
    expect(resposta.body.imagemUrl).toBeDefined();
    expect(resposta.body.videoUrl).toBeNull();
  });

  it("7. POST /cat-movel — ADMIN tenta criar um segundo CAT Móvel (409 Conflict)", () => {
    return request(app.getHttpServer())
      .post("/cat-movel")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "Segundo CAT")
      .field("descricao", "Não deve ser possível")
      .attach("imagem", bufferImagem, "foto2.png")
      .expect(409);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCO 2: GET /cat-movel  —  Consulta pública
  // ══════════════════════════════════════════════════════════════════════════

  it("8. GET /cat-movel — Qualquer um pode consultar (200)", () => {
    return request(app.getHttpServer())
      .get("/cat-movel")
      .expect(200)
      .expect((res) => {
        expect(res.body.titulo).toBe("CAT Móvel Oficial");
        expect(res.body.descricao).toBe("Venha nos visitar na praça central!");
      });
  });

  it("9. GET /cat-movel — USUARIO pode consultar (200)", () => {
    return request(app.getHttpServer())
      .get("/cat-movel")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .expect(200);
  });

  it("10. GET /cat-movel — PARCEIRO pode consultar (200)", () => {
    return request(app.getHttpServer())
      .get("/cat-movel")
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .expect(200);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCO 3: PUT /cat-movel  —  Atualização (apenas Admin)
  // ══════════════════════════════════════════════════════════════════════════

  it("11. PUT /cat-movel — Sem token deve retornar 401", () => {
    return request(app.getHttpServer())
      .put("/cat-movel")
      .field("titulo", "Tentativa sem auth")
      .expect(401);
  });

  it("12. PUT /cat-movel — USUARIO tenta atualizar (403)", () => {
    return request(app.getHttpServer())
      .put("/cat-movel")
      .set("Authorization", `Bearer ${tokenUsuario}`)
      .field("titulo", "Atualização indevida")
      .expect(403);
  });

  it("13. PUT /cat-movel — PARCEIRO tenta atualizar (403)", () => {
    return request(app.getHttpServer())
      .put("/cat-movel")
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("titulo", "Atualização indevida")
      .expect(403);
  });

  it("14. PUT /cat-movel — ADMIN atualiza apenas o título (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put("/cat-movel")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("titulo", "CAT Móvel Atualizado")
      .expect(200);

    expect(resposta.body.titulo).toBe("CAT Móvel Atualizado");
    // Descrição e mídia não enviadas — devem permanecer iguais
    expect(resposta.body.descricao).toBe("Venha nos visitar na praça central!");
    expect(resposta.body.imagemUrl).toBeDefined();
  });

  it("15. PUT /cat-movel — ADMIN troca a imagem por um vídeo (200)", async () => {
    const bufferVideo = Buffer.from("fakevideodata");

    const resposta = await request(app.getHttpServer())
      .put("/cat-movel")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .attach("video", bufferVideo, "novo-video.mp4")
      .expect(200);

    expect(resposta.body.videoUrl).toBeDefined();
    // imagemUrl deve ter sido zerada ao trocar para vídeo
    expect(resposta.body.imagemUrl).toBeNull();
  });

  it("16. PUT /cat-movel — Enviar imagem E vídeo juntos deve retornar 400", () => {
    const bufferVideo = Buffer.from("fakevideodata");
    return request(app.getHttpServer())
      .put("/cat-movel")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .attach("imagem", bufferImagem, "foto.png")
      .attach("video", bufferVideo, "video.mp4")
      .expect(400);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCO 4: Consistência do singleton após alterações
  // ══════════════════════════════════════════════════════════════════════════

  it("17. GET /cat-movel — Confirma dados após atualizações (título e mídia novos)", () => {
    return request(app.getHttpServer())
      .get("/cat-movel")
      .expect(200)
      .expect((res) => {
        expect(res.body.titulo).toBe("CAT Móvel Atualizado");
        expect(res.body.videoUrl).toBeDefined();
        expect(res.body.imagemUrl).toBeNull();
      });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEARDOWN: limpa banco e arquivos físicos
  // ──────────────────────────────────────────────────────────────────────────
  afterAll(async () => {
    await prisma.catMovel.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "usuario@catmovel.com",
            "parceiro@catmovel.com",
            "admin@catmovel.com",
          ],
        },
      },
    });

    // Remove arquivos físicos gerados durante os testes
    const pastaUpload = path.join(".", "uploads", "cat-movel");
    if (fs.existsSync(pastaUpload)) {
      fs.rmSync(pastaUpload, { recursive: true, force: true });
    }

    await app.close();
  });
});
