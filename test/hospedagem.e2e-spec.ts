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
  let tokenParceiro: string; // 🤝 Parceiro: usuário aprovado com hospedagem própria
  let hospedagemCriadaId: string;
  let hospedagemParceiroId: string;

  const cnpjTeste = `CNPJ-HOSP-${Date.now()}`;
  const cnpjParceiro = `CNPJ-HOSP-PARC-${Date.now()}`;

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
            "donohosp@teste.com",
            "adminhosp@teste.com",
            "invasorhosp@teste.com",
            "parceiro@hosp.com",
          ],
        },
      },
    });

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
    // 🤝 PARCEIRO: usuário com perfil já promovido
    const userParceiro = await prisma.user.create({
      data: {
        nome: "Parceiro Hosp",
        email: "parceiro@hosp.com",
        senha: "123",
        usuario: "parceirohosp",
        perfil: "PARCEIRO",
      },
    });

    tokenDono = jwtService.sign({ sub: userDono.id, perfil: userDono.perfil });
    tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });
    tokenInvasor = jwtService.sign({ sub: userInvasor.id, perfil: userInvasor.perfil });
    tokenParceiro = jwtService.sign({ sub: userParceiro.id, perfil: userParceiro.perfil });
  });

  it("1. GET /hospedagem - Listar publicamente (200)", () => {
    return request(app.getHttpServer()).get("/hospedagem").expect(200);
  });

  it("2. POST /hospedagem - Dono cria Hospedagem (201)", async () => {
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

  it("3. POST /hospedagem - PARCEIRO pode criar sua própria Hospedagem (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/hospedagem")
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("nome", "Pousada do Parceiro")
      .field("telefone", "888888888")
      .field("endereco", "Rua Parceiro, 99")
      .field("textoDiferencial", "Vista deslumbrante da lagoa!")
      .field("cnpj", cnpjParceiro)
      .field("responsavelNome", "Parceiro")
      .field("responsavelCpf", "99988877766")
      .attach("logo", bufferImagem, "logo.png")
      .attach("documentoPdf", bufferPdf, "doc.pdf")
      .expect(201);

    hospedagemParceiroId = resposta.body.id;
    expect(resposta.body.status).toBe("PENDENTE");
  });

  it("4. PUT /hospedagem/:id - Invasor tenta alterar hospedagem do Dono (403)", () => {
    return request(app.getHttpServer())
      .put(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenInvasor}`)
      .field("telefone", "000")
      .expect(403);
  });

  it("5. PUT /hospedagem/:id - PARCEIRO tenta alterar hospedagem do Dono (403)", () => {
    return request(app.getHttpServer())
      .put(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("telefone", "111")
      .expect(403);
  });

  it("6. DELETE /hospedagem/:id - PARCEIRO tenta apagar hospedagem do Dono (403)", () => {
    return request(app.getHttpServer())
      .delete(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .expect(403);
  });

  it("7. PUT /hospedagem/:id - Dono tenta aprovar sozinho (403)", () => {
    return request(app.getHttpServer())
      .put(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("status", "APROVADO")
      .expect(403);
  });

  it("8. PUT /hospedagem/:id - PARCEIRO tenta aprovar a própria hospedagem (403)", () => {
    return request(app.getHttpServer())
      .put(`/hospedagem/${hospedagemParceiroId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("status", "APROVADO")
      .expect(403);
  });

  it("9. PUT /hospedagem/:id - PARCEIRO pode editar a própria hospedagem (telefone) (200)", () => {
    return request(app.getHttpServer())
      .put(`/hospedagem/${hospedagemParceiroId}`)
      .set("Authorization", `Bearer ${tokenParceiro}`)
      .field("telefone", "777777777")
      .expect(200);
  });

  it("10. PUT /hospedagem/:id - Admin aprova a hospedagem do Dono (200)", () => {
    return request(app.getHttpServer())
      .put(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("status", "APROVADO")
      .expect(200);
  });

  it("11. DELETE /hospedagem/:id - Invasor tenta apagar (403)", () => {
    return request(app.getHttpServer())
      .delete(`/hospedagem/${hospedagemCriadaId}`)
      .set("Authorization", `Bearer ${tokenInvasor}`)
      .expect(403);
  });

  it("12. DELETE /hospedagem/:id - Admin apaga hospedagem do Parceiro (204)", () => {
    return request(app.getHttpServer())
      .delete(`/hospedagem/${hospedagemParceiroId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  it("13. DELETE /hospedagem/:id - Admin apaga hospedagem do Dono (204)", () => {
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
            "parceiro@hosp.com",
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
