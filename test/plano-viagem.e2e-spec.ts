import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";

describe("Plano de Viagem - Privacidade (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenTuristaA: string;
  let tokenTuristaB: string;
  let tokenAdmin: string;
  let planoDoTuristaA_Id: string;

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

    const userA = await prisma.user.create({
      data: {
        nome: "Turista A",
        email: "a@turista.com",
        senha: "123",
        usuario: "turistaa",
        perfil: "USUARIO",
      },
    });
    const userB = await prisma.user.create({
      data: {
        nome: "Turista B",
        email: "b@turista.com",
        senha: "123",
        usuario: "turistab",
        perfil: "USUARIO",
      },
    });
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin",
        email: "admin@roteiro.com",
        senha: "123",
        usuario: "adminroteiro",
        perfil: "ADMIN",
      },
    });

    tokenTuristaA = jwtService.sign({ sub: userA.id, perfil: userA.perfil });
    tokenTuristaB = jwtService.sign({ sub: userB.id, perfil: userB.perfil });
    tokenAdmin = jwtService.sign({
      sub: userAdmin.id,
      perfil: userAdmin.perfil,
    });
  });

  it("1. POST /plano-viagem - Turista A cria o seu roteiro (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/plano-viagem")
      .set("Authorization", `Bearer ${tokenTuristaA}`)
      .send({
        titulo: "Férias de Verão",
        dataInicio: new Date().toISOString(),
        dataFim: new Date().toISOString(),
      })
      .expect(201);

    planoDoTuristaA_Id = resposta.body.id;
  });

  it("2. GET /plano-viagem - Turista A lista os SEUS roteiros (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .get("/plano-viagem")
      .set("Authorization", `Bearer ${tokenTuristaA}`)
      .expect(200);

    expect(resposta.body.length).toBeGreaterThan(0); // Tem que vir o que ele acabou de criar
  });

  it("3. GET /plano-viagem - Turista B lista os SEUS roteiros e vem vazio (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .get("/plano-viagem")
      .set("Authorization", `Bearer ${tokenTuristaB}`)
      .expect(200);

    expect(resposta.body.length).toBe(0); // Ele não tem roteiros, e NÃO PODE ver os do A!
  });

  it("4. GET /plano-viagem/:id - Turista B tenta aceder ao roteiro do Turista A (403)", () => {
    return request(app.getHttpServer())
      .get(`/plano-viagem/${planoDoTuristaA_Id}`)
      .set("Authorization", `Bearer ${tokenTuristaB}`)
      .expect(403);
  });

  it("5. DELETE /plano-viagem/:id - Turista B tenta apagar o roteiro do Turista A (403)", () => {
    return request(app.getHttpServer())
      .delete(`/plano-viagem/${planoDoTuristaA_Id}`)
      .set("Authorization", `Bearer ${tokenTuristaB}`)
      .expect(403);
  });

  it("6. DELETE /plano-viagem/:id - Turista A apaga o SEU roteiro (204)", () => {
    return request(app.getHttpServer())
      .delete(`/plano-viagem/${planoDoTuristaA_Id}`)
      .set("Authorization", `Bearer ${tokenTuristaA}`)
      .expect(204);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: ["a@turista.com", "b@turista.com", "admin@roteiro.com"] },
      },
    });
    await app.close();
  });
});
