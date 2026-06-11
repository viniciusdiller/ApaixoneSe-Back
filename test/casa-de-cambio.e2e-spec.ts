import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";

describe("Casa de Câmbio - CRUD e Permissões (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenComum: string;
  let tokenAdmin: string;
  let casaCriadaId: string;

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
        nome: "User Cambio",
        email: "user@cambio.com",
        senha: "123",
        usuario: "usercambio",
        perfil: "USUARIO",
      },
    });
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Cambio",
        email: "admin@cambio.com",
        senha: "123",
        usuario: "admincambio",
        perfil: "ADMIN",
      },
    });

    tokenComum = jwtService.sign({ sub: userComum.id, perfil: userComum.perfil });
    tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });
  });

  it("1. GET /casa-de-cambio - Deve listar publicamente (200)", () => {
    return request(app.getHttpServer()).get("/casa-de-cambio").expect(200);
  });

  it("2. POST /casa-de-cambio - Sem token deve bloquear (401)", () => {
    return request(app.getHttpServer())
      .post("/casa-de-cambio")
      .send({ nome: "Câmbio Sem Token", telefone: "22999", endereco: "Rua X" })
      .expect(401);
  });

  it("3. POST /casa-de-cambio - User comum TENTA criar (403)", () => {
    return request(app.getHttpServer())
      .post("/casa-de-cambio")
      .set("Authorization", `Bearer ${tokenComum}`)
      .send({ nome: "Câmbio Falso", telefone: "22999", endereco: "Rua X" })
      .expect(403);
  });

  it("4. POST /casa-de-cambio - Admin cria com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/casa-de-cambio")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        nome: "Câmbio Oficial E2E",
        telefone: "+55 22 99999-9999",
        endereco: "Av. Principal, 100 - Saquarema",
      })
      .expect(201);

    casaCriadaId = resposta.body.id;
    expect(casaCriadaId).toBeDefined();
    expect(resposta.body.nome).toBe("Câmbio Oficial E2E");
  });

  it("5. GET /casa-de-cambio/:id - Deve buscar pelo ID (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/casa-de-cambio/${casaCriadaId}`)
      .expect(200);

    expect(resposta.body.id).toBe(casaCriadaId);
  });

  it("6. PUT /casa-de-cambio/:id - User comum TENTA atualizar (403)", () => {
    return request(app.getHttpServer())
      .put(`/casa-de-cambio/${casaCriadaId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .send({ telefone: "0000" })
      .expect(403);
  });

  it("7. PUT /casa-de-cambio/:id - Admin atualiza com sucesso (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/casa-de-cambio/${casaCriadaId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ telefone: "+55 22 88888-8888" })
      .expect(200);

    expect(resposta.body.telefone).toBe("+55 22 88888-8888");
  });

  it("8. DELETE /casa-de-cambio/:id - User comum TENTA apagar (403)", () => {
    return request(app.getHttpServer())
      .delete(`/casa-de-cambio/${casaCriadaId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .expect(403);
  });

  it("9. GET /casa-de-cambio/:id - ID inexistente retorna 404", () => {
    return request(app.getHttpServer())
      .get("/casa-de-cambio/id-que-nao-existe")
      .expect(404);
  });

  it("10. DELETE /casa-de-cambio/:id - Admin apaga com sucesso (204)", () => {
    return request(app.getHttpServer())
      .delete(`/casa-de-cambio/${casaCriadaId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["user@cambio.com", "admin@cambio.com"] } },
    });
    await app.close();
  });
});
