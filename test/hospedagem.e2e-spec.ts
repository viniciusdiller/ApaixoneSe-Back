import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";
import * as fs from "fs";
import * as path from "path";

describe("Hospedagem - CRUD e Permissões (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenDono: string;
  let tokenAdmin: string;
  let tokenInvasor: string;
  let hospedagemCriadaId: string;

  const cnpjTeste = `CNPJ-HOSP-${Date.now()}`;

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

    const userDono = await prisma.user.create({
      data: {
        nome: "Dono Hosp",
        email: "donohosp@teste.com",
        senha: "123",
        usuario: "donohosp",
        perfil: "USUARIO",
      },
    });
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Hosp",
        email: "adminhosp@teste.com",
        senha: "123",
        usuario: "adminhosp",
        perfil: "ADMIN",
      },
    });
    const userInvasor = await prisma.user.create({
      data: {
        nome: "Invasor Hosp",
        email: "invasorhosp@teste.com",
        senha: "123",
        usuario: "invasorhosp",
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

  it("1. GET /hospedagem - Listar publicamente (200)", () => {
    return request(app.getHttpServer()).get("/hospedagem").expect(200);
  });

  it("2. POST /hospedagem - Criar Hospedagem (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/hospedagem")
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("nome", "Pousada E2E")
      .field("telefone", "999999999")
      .field("endereco", "Rua Praia, 1")
      .field("textoDiferencial", "Piscina aquecida e vista mar!")
      .field("cnpj", cnpjTeste)
      .field("responsavelNome", "Dono")
      .field("responsavelCpf", "11122233344")
      .attach("logo", bufferImagem, "logo.png")
      .attach("documentoPdf", bufferPdf, "doc.pdf")
      .expect(201);

    hospedagemCriadaId = resposta.body.id;
  });

  it("3. PUT /hospedagem/:id - Invasor tenta alterar (403)", () => {
    return request(app.getHttpServer())
      .put(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenInvasor}`)
      .field("telefone", "000")
      .expect(403);
  });

  it("4. PUT /hospedagem/:id - Dono tenta aprovar sozinho (403)", () => {
    return request(app.getHttpServer())
      .put(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("status", "APROVADO")
      .expect(403);
  });

  it("5. PUT /hospedagem/:id - Admin aprova (200)", () => {
    return request(app.getHttpServer())
      .put(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("status", "APROVADO")
      .expect(200);
  });

  it("6. DELETE /hospedagem/:id - Invasor tenta apagar (403)", () => {
    return request(app.getHttpServer())
      .delete(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenInvasor}`)
      .expect(403);
  });

  it("7. DELETE /hospedagem/:id - Admin apaga (204)", () => {
    return request(app.getHttpServer())
      .delete(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "donohosp@teste.com",
            "adminhosp@teste.com",
            "invasorhosp@teste.com",
          ],
        },
      },
    });
    const pastaFisica = path.join(".", "uploads", "Hospedagem", "pousada_e2e");
    if (fs.existsSync(pastaFisica))
      fs.rmSync(pastaFisica, { recursive: true, force: true });
    await app.close();
  });
});
