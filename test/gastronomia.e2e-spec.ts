import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";
import * as fs from "fs";
import * as path from "path";

describe("Gastronomia - CRUD e Permissões (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenDono: string;
  let tokenAdmin: string;
  let tokenInvasor: string;
  let tokenParceiro: string; // 🤝 Parceiro: usuário aprovado com estabelecimento próprio
  let restauranteCriadoId: string;
  let restauranteParceiroId: string;

  const cnpjTeste = `CNPJ-${Date.now()}`;
  const cnpjParceiro = `CNPJ-PARC-${Date.now()}`;

  const bufferImagem = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
  );
  const bufferPdf = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF",
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

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "dono@teste.com",
            "admin@teste.com",
            "invasor@teste.com",
            "parceiro@gastro.com",
          ],
        },
      },
    });

    const userDono = await prisma.user.create({
      data: {
        nome: "Dono Teste",
        email: "dono@teste.com",
        senha: "123",
        usuario: "donoteste",
        perfil: "USUARIO",
      },
    });
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Teste",
        email: "admin@teste.com",
        senha: "123",
        usuario: "adminteste",
        perfil: "ADMIN",
      },
    });
    const userInvasor = await prisma.user.create({
      data: {
        nome: "Invasor Teste",
        email: "invasor@teste.com",
        senha: "123",
        usuario: "invasorteste",
        perfil: "USUARIO",
      },
    });
    // 🤝 PARCEIRO: usuário com perfil já promovido
    const userParceiro = await prisma.user.create({
      data: {
        nome: "Parceiro Gastro",
        email: "parceiro@gastro.com",
        senha: "123",
        usuario: "parceirogastro",
        perfil: "PARCEIRO",
      },
    });

    tokenDono = jwtService.sign({ sub: userDono.id, perfil: userDono.perfil });
    tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });
    tokenInvasor = jwtService.sign({ sub: userInvasor.id, perfil: userInvasor.perfil });
    tokenParceiro = jwtService.sign({ sub: userParceiro.id, perfil: userParceiro.perfil });
  });

  // =========================================================
  // BATERIA DE TESTES
  // =========================================================

  it("1. GET /gastronomia - Deve listar publicamente (200 OK)", () => {
    return request(app.getHttpServer()).get("/gastronomia").expect(200);
  });

  it("2. POST /gastronomia - Deve BLOQUEAR quem não tem Token (401 Unauthorized)", () => {
    return request(app.getHttpServer()).post("/gastronomia").expect(401);
  });

  it("3. POST /gastronomia - Deve BLOQUEAR utilizador logado que não enviou as imagens (400 Bad Request)", () => {
    return request(app.getHttpServer())
      .post("/gastronomia")
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("nome", "Restaurante Falso")
      .expect(400);
  });

  it("4. POST /gastronomia - Deve CRIAR com sucesso sendo Usuário Comum (201 Created)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/gastronomia")
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("nome", "Restaurante E2E")
      .field("telefone", "999999999")
      .field("endereco", "Rua Teste, 123")
      .field("cnpj", cnpjTeste)
      .field("responsavelNome", "Dono")
      .field("responsavelCpf", "11122233344")
      .attach("logo", bufferImagem, "logo.png")
      .attach("documentoPdf", bufferPdf, "doc.pdf")
      .expect(201);

    restauranteCriadoId = resposta.body.id;
    expect(resposta.body.status).toBe("PENDENTE");
  });

  it("5. POST /gastronomia - PARCEIRO pode criar seu próprio restaurante (201 Created)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/gastronomia")
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("nome", "Restaurante do Parceiro")
      .field("telefone", "888888888")
      .field("endereco", "Rua Parceiro, 456")
      .field("cnpj", cnpjParceiro)
      .field("responsavelNome", "Parceiro")
      .field("responsavelCpf", "99988877766")
      .attach("logo", bufferImagem, "logo.png")
      .attach("documentoPdf", bufferPdf, "doc.pdf")
      .expect(201);

    restauranteParceiroId = resposta.body.id;
    expect(resposta.body.status).toBe("PENDENTE");
  });

  // =========================================================
  // TESTES DE SEGURANÇA — INVASOR
  // =========================================================

  it("6. PUT /gastronomia/:id - O INVASOR tenta editar o restaurante do Dono (403 Forbidden)", () => {
    return request(app.getHttpServer())
      .put(`/gastronomia/${restauranteCriadoId}`)
      .set("Authorization", `Bearer ${tokenInvasor}`)
      .field("telefone", "000000000")
      .expect(403);
  });

  it("7. DELETE /gastronomia/:id - O INVASOR tenta apagar o restaurante do Dono (403 Forbidden)", () => {
    return request(app.getHttpServer())
      .delete(`/gastronomia/${restauranteCriadoId}`)
      .set("Authorization", `Bearer ${tokenInvasor}`)
      .expect(403);
  });

  // =========================================================
  // TESTES DE SEGURANÇA — PARCEIRO
  // =========================================================

  it("8. PUT /gastronomia/:id - PARCEIRO tenta editar o restaurante do Dono (403 Forbidden)", () => {
    return request(app.getHttpServer())
      .put(`/gastronomia/${restauranteCriadoId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("telefone", "111111111")
      .expect(403);
  });

  it("9. DELETE /gastronomia/:id - PARCEIRO tenta apagar o restaurante do Dono (403 Forbidden)", () => {
    return request(app.getHttpServer())
      .delete(`/gastronomia/${restauranteCriadoId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .expect(403);
  });

  it("10. PUT /gastronomia/:id - PARCEIRO tenta aprovar o próprio restaurante (403 Forbidden)", () => {
    return request(app.getHttpServer())
      .put(`/gastronomia/${restauranteParceiroId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("status", "APROVADO")
      .expect(403);
  });

  it("11. PUT /gastronomia/:id - PARCEIRO pode editar seu próprio restaurante (telefone) (200 OK)", () => {
    return request(app.getHttpServer())
      .put(`/gastronomia/${restauranteParceiroId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("telefone", "777777777")
      .expect(200);
  });

  // =========================================================
  // CONTINUAÇÃO DOS TESTES ORIGINAIS
  // =========================================================

  it("12. PUT /gastronomia/:id - O Dono TENTA APROVAR o próprio restaurante (403 Forbidden)", () => {
    return request(app.getHttpServer())
      .put(`/gastronomia/${restauranteCriadoId}`)
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("status", "APROVADO")
      .expect(403);
  });

  it("13. PUT /gastronomia/:id - O ADMIN APROVA o restaurante do Dono (200 OK)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/gastronomia/${restauranteCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("status", "APROVADO")
      .expect(200);

    expect(resposta.body.status).toBe("APROVADO");
  });

  it("14. DELETE /gastronomia/:id - O ADMIN APAGA o restaurante do Parceiro (204 No Content)", () => {
    return request(app.getHttpServer())
      .delete(`/gastronomia/${restauranteParceiroId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  it("15. DELETE /gastronomia/:id - O ADMIN APAGA o restaurante do Dono (204 No Content)", () => {
    return request(app.getHttpServer())
      .delete(`/gastronomia/${restauranteCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  // =========================================================
  // LIMPEZA FINAL
  // =========================================================

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "dono@teste.com",
            "admin@teste.com",
            "invasor@teste.com",
            "parceiro@gastro.com",
          ],
        },
      },
    });

    const pastaFisica = path.join(".", "uploads", "Gastronomia", "restaurante_e2e");
    if (fs.existsSync(pastaFisica)) {
      fs.rmSync(pastaFisica, { recursive: true, force: true });
    }

    await app.close();
  });
});
