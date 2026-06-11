import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";

describe("Evento Principal - Apenas Admin (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenComum: string;
  let tokenAdmin: string;
  let eventoCriadoId: string;

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

    // Garantir estado limpo
    await prisma.eventoPrincipal.deleteMany({});

    const userComum = await prisma.user.create({
      data: {
        nome: "User Evento",
        email: "user@evento.com",
        senha: "123",
        usuario: "userevento",
        perfil: "USUARIO",
      },
    });
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Evento",
        email: "admin@evento.com",
        senha: "123",
        usuario: "adminevento",
        perfil: "ADMIN",
      },
    });

    tokenComum = jwtService.sign({ sub: userComum.id, perfil: userComum.perfil });
    tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });
  });

  it("1. GET /evento-principal - Deve listar publicamente (200)", () => {
    return request(app.getHttpServer()).get("/evento-principal").expect(200);
  });

  it("2. POST /evento-principal - Sem token deve bloquear (401)", () => {
    return request(app.getHttpServer())
      .post("/evento-principal")
      .send({ titulo: "Evento Sem Token", data: "2026-12-01T00:00:00Z" })
      .expect(401);
  });

  it("3. POST /evento-principal - User comum TENTA criar (403)", () => {
    return request(app.getHttpServer())
      .post("/evento-principal")
      .set("Authorization", `Bearer ${tokenComum}`)
      .send({ titulo: "Evento Falso", data: "2026-12-01T00:00:00Z" })
      .expect(403);
  });

  it("4. POST /evento-principal - Admin cria com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/evento-principal")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        titulo: "Saquarema Pro 2026",
        etapa: "WSL Championship Tour",
        data: "2026-08-15T00:00:00Z",
      })
      .expect(201);

    eventoCriadoId = resposta.body.id;
    expect(eventoCriadoId).toBeDefined();
    expect(resposta.body.titulo).toBe("Saquarema Pro 2026");
  });

  it("5. GET /evento-principal/:id - Deve buscar pelo ID (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/evento-principal/${eventoCriadoId}`)
      .expect(200);

    expect(resposta.body.id).toBe(eventoCriadoId);
  });

  it("6. POST /evento-principal - Admin TENTA criar um segundo evento (400 - já existe)", () => {
    return request(app.getHttpServer())
      .post("/evento-principal")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ titulo: "Segundo Evento", data: "2026-09-01T00:00:00Z" })
      .expect(400);
  });

  it("7. PUT /evento-principal/:id - User comum TENTA atualizar (403)", () => {
    return request(app.getHttpServer())
      .put(`/evento-principal/${eventoCriadoId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .send({ titulo: "Tentativa de Invasão" })
      .expect(403);
  });

  it("8. PUT /evento-principal/:id - Admin atualiza (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/evento-principal/${eventoCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ etapa: "Etapa Atualizada" })
      .expect(200);

    expect(resposta.body.etapa).toBe("Etapa Atualizada");
  });

  it("9. DELETE /evento-principal/:id - User comum TENTA apagar (403)", () => {
    return request(app.getHttpServer())
      .delete(`/evento-principal/${eventoCriadoId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .expect(403);
  });

  it("10. DELETE /evento-principal/:id - Admin apaga (204)", () => {
    return request(app.getHttpServer())
      .delete(`/evento-principal/${eventoCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.eventoPrincipal.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: ["user@evento.com", "admin@evento.com"] } },
    });
    await app.close();
  });
});
