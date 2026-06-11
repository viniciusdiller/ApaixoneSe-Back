import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
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
  let donoId: string;

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

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["donoserv@teste.com", "adminserv@teste.com", "invasorserv@teste.com"],
        },
      },
    });

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

    donoId = userDono.id;
    tokenDono = jwtService.sign({ sub: userDono.id, perfil: userDono.perfil });
    tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });
    tokenInvasor = jwtService.sign({ sub: userInvasor.id, perfil: userInvasor.perfil });
  });

  it("1. GET /servico-turista - Listar (200)", () => {
    return request(app.getHttpServer()).get("/servico-turista").expect(200);
  });

  it("2. POST /servico-turista - Sem token deve retornar 401", () => {
    return request(app.getHttpServer())
      .post("/servico-turista")
      .field("nome", "Agência Sem Token")
      .field("tipo", "AGENCIA_TURISMO")
      .attach("logo", bufferImagem, "logo.png")
      .expect(401);
  });

  // AGENCIA_TURISMO exige logo — enviar 'foto' ao invés de 'logo' deve retornar 400
  it("3. POST /servico-turista - Agência sem Logo deve falhar (400)", () => {
    return request(app.getHttpServer())
      .post("/servico-turista")
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("nome", "Agência Bugada")
      .field("tipo", "AGENCIA_TURISMO")
      .attach("foto", bufferImagem, "foto.png")
      .expect(400);
  });

  // AGENCIA_TURISMO exige logo + comprovante — sem comprovante deve retornar 400
  it("4. POST /servico-turista - Agência sem comprovante deve falhar (400)", () => {
    return request(app.getHttpServer())
      .post("/servico-turista")
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("nome", "Agência Sem Comprovante")
      .field("tipo", "AGENCIA_TURISMO")
      .attach("logo", bufferImagem, "logo.png")
      .expect(400);
  });

  // ESPORTE_LAZER é o único tipo que não exige comprovante
  it("5. POST /servico-turista - ESPORTE_LAZER não exige comprovante (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/servico-turista")
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("nome", `EsporteE2E${Date.now()}`)
      .field("telefone", "999000000")
      .field("tipo", "ESPORTE_LAZER")
      .attach("logo", bufferImagem, "logo.png")
      .expect(201);

    // Apagar este registro extra antes de continuar
    const idTemp = resposta.body.id;
    if (idTemp) {
      await request(app.getHttpServer())
        .delete(`/servico-turista/${idTemp}`)
        .set("Authorization", `Bearer ${tokenAdmin}`);
    }
  });

  // AGENCIA_TURISMO: logo + comprovante obrigatórios
  it("6. POST /servico-turista - Criar Agência com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/servico-turista")
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("nome", `AgenciaE2E${Date.now()}`)
      .field("telefone", "999999999")
      .field("tipo", "AGENCIA_TURISMO")
      .attach("logo", bufferImagem, "logo.png")
      .attach("comprovante", bufferImagem, "comprovante.png")
      .expect(201);

    servicoCriadoId = resposta.body.id;
    expect(servicoCriadoId).toBeDefined();
  });

  it("7. GET /servico-turista/:id - Busca pelo ID criado (200)", () => {
    return request(app.getHttpServer())
      .get(`/servico-turista/${servicoCriadoId}`)
      .expect(200);
  });

  it("8. PUT /servico-turista/:id - Invasor tenta alterar (403)", () => {
    return request(app.getHttpServer())
      .put(`/servico-turista/${servicoCriadoId}`)
      .set("Authorization", `Bearer ${tokenInvasor}`)
      .field("telefone", "000")
      .expect(403);
  });

  it("9. PUT /servico-turista/:id - Dono atualiza próprio serviço (200)", () => {
    return request(app.getHttpServer())
      .put(`/servico-turista/${servicoCriadoId}`)
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("telefone", "888888888")
      .expect(200);
  });

  it("10. PUT /servico-turista/:id - Usuário tenta alterar status (403)", () => {
    return request(app.getHttpServer())
      .put(`/servico-turista/${servicoCriadoId}`)
      .set("Authorization", `Bearer ${tokenDono}`)
      .field("status", "APROVADO")
      .expect(403);
  });

  it("11. PUT /servico-turista/:id - Admin aprova (200)", () => {
    return request(app.getHttpServer())
      .put(`/servico-turista/${servicoCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("status", "APROVADO")
      .expect(200);
  });

  it("12. DELETE /servico-turista/:id - Invasor tenta apagar (403)", () => {
    return request(app.getHttpServer())
      .delete(`/servico-turista/${servicoCriadoId}`)
      .set("Authorization", `Bearer ${tokenInvasor}`)
      .expect(403);
  });

  it("13. DELETE /servico-turista/:id - Admin apaga (204)", () => {
    return request(app.getHttpServer())
      .delete(`/servico-turista/${servicoCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  it("14. GET /servico-turista/:id - Após deletar retorna 404", () => {
    return request(app.getHttpServer())
      .get(`/servico-turista/${servicoCriadoId}`)
      .expect(404);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["donoserv@teste.com", "adminserv@teste.com", "invasorserv@teste.com"],
        },
      },
    });

    const pastaServico = path.join(".", "uploads", "servico_turista");
    if (fs.existsSync(pastaServico))
      fs.rmSync(pastaServico, { recursive: true, force: true });

    await app.close();
  });
});
