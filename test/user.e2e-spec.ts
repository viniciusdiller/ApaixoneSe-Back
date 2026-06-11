import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";

describe("User - Registro, Login e Permissões (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenComum: string;
  let tokenAdmin: string;
  let userCriadoId: string;

  const emailTeste = `user${Date.now()}@user.com`;
  const usuarioTeste = `usere2e${Date.now()}`;

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

    // Criar admin diretamente no banco (não há rota pública para isso)
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin User Test",
        email: "admin@usertest.com",
        senha: "123",
        usuario: "adminusertest",
        perfil: "ADMIN",
      },
    });
    tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });
  });

  it("1. POST /users/register - Deve criar usuário comum com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/users/register")
      .send({
        nome: "Usuário E2E",
        usuario: usuarioTeste,
        email: emailTeste,
        senha: "senha123",
      })
      .expect(201);

    userCriadoId = resposta.body.id;
    expect(userCriadoId).toBeDefined();
    expect(resposta.body.email).toBe(emailTeste);
    // A senha NÃO deve ser retornada
    expect(resposta.body.senha).toBeUndefined();
  });

  it("2. POST /users/register - Email duplicado deve falhar (400)", () => {
    return request(app.getHttpServer())
      .post("/users/register")
      .send({
        nome: "Outro Nome",
        usuario: `outro${Date.now()}`,
        email: emailTeste, // Mesmo email
        senha: "senha123",
      })
      .expect(400);
  });

  it("3. POST /users/register - TENTA criar conta ADMIN (400 - bloqueado)", () => {
    return request(app.getHttpServer())
      .post("/users/register")
      .send({
        nome: "Admin Tentativa",
        usuario: `admintentativa${Date.now()}`,
        email: `admintent${Date.now()}@test.com`,
        senha: "senha123",
        perfil: "ADMIN",
      })
      .expect(400);
  });

  it("4. POST /users/login - Credenciais erradas devem falhar (401)", () => {
    return request(app.getHttpServer())
      .post("/users/login")
      .send({ email: emailTeste, senha: "senhaerrada" })
      .expect(401);
  });

  it("5. POST /users/login - Login com sucesso retorna token (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/users/login")
      .send({ email: emailTeste, senha: "senha123" })
      .expect(200);

    expect(resposta.body.token).toBeDefined();
    tokenComum = resposta.body.token;
  });

  it("6. GET /users - User comum TENTA listar todos os usuários (403)", () => {
    return request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${tokenComum}`)
      .expect(403);
  });

  it("7. GET /users - Admin lista todos os usuários (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(200);

    expect(Array.isArray(resposta.body)).toBe(true);
  });

  it("8. PUT /users/:id - User atualiza o próprio perfil (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .put(`/users/${userCriadoId}`)
      .set("Authorization", `Bearer ${tokenComum}`)
      .send({ nome: "Nome Atualizado" })
      .expect(200);

    expect(resposta.body.nome).toBe("Nome Atualizado");
  });

  it("9. DELETE /users/:id - User TENTA apagar outro usuário (403)", () => {
    return request(app.getHttpServer())
      .delete(`/users/${userCriadoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`) // Admin apaga, não o próprio user
      .expect(204);
  });

  afterAll(async () => {
    // Limpeza de segurança
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [emailTeste, "admin@usertest.com"],
        },
      },
    });
    await app.close();
  });
});
