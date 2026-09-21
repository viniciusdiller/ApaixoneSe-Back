import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
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
  let eventoId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        JwtModule.register({ secret: process.env.JWT_SECRET || "secreta" }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mesmo pipe global do main.ts
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

    const evento = await prisma.eventos.create({
      data: {
        titulo: "Evento Plano",
        descricao: "...",
        data: new Date(),
        local: "...",
      },
    });
    eventoId = evento.id;

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

  describe("Criação atômica com itens", () => {
    const base = {
      titulo: "Com itens",
      dataInicio: "2027-01-10",
      dataFim: "2027-01-12",
    };
    const itemOk = () => ({
      dataHoraAgendada: "2027-01-11T15:00:00.000Z",
      eventoId,
    });
    const postar = (body: object) =>
      request(app.getHttpServer())
        .post("/plano-viagem")
        .set("Authorization", `Bearer ${tokenTuristaA}`)
        .send(body);
    const contarPlanos = () =>
      prisma.planoViagem.count({ where: { titulo: "Com itens" } });

    afterEach(async () => {
      await prisma.planoViagem.deleteMany({ where: { titulo: "Com itens" } });
    });

    it("7. cria plano com itens numa única chamada (201)", async () => {
      const r = await postar({ ...base, itens: [itemOk(), itemOk()] }).expect(
        201,
      );
      expect(r.body.itens).toHaveLength(2);
    });

    it("8. plano sem itens continua funcionando (201)", async () => {
      const r = await postar(base).expect(201);
      expect(r.body.itens).toHaveLength(0);
    });

    it("9. item com dois vínculos falha e NÃO cria o plano (400)", async () => {
      await postar({
        ...base,
        itens: [
          itemOk(),
          { ...itemOk(), gastronomiaId: "11111111-1111-4111-8111-111111111111" },
        ],
      }).expect(400);
      expect(await contarPlanos()).toBe(0);
    });

    it("10. item sem vínculo falha (400)", async () => {
      await postar({
        ...base,
        itens: [{ dataHoraAgendada: "2027-01-11T15:00:00.000Z" }],
      }).expect(400);
      expect(await contarPlanos()).toBe(0);
    });

    it("11. item fora do período falha (400)", async () => {
      await postar({
        ...base,
        itens: [{ ...itemOk(), dataHoraAgendada: "2027-03-01T15:00:00.000Z" }],
      }).expect(400);
      expect(await contarPlanos()).toBe(0);
    });

    it("12. dataFim anterior à dataInicio falha (400)", async () => {
      await postar({ ...base, dataInicio: "2027-01-12", dataFim: "2027-01-10" })
        .expect(400);
    });

    it("13. local inexistente falha com 400 e não cria o plano", async () => {
      await postar({
        ...base,
        itens: [
          { ...itemOk(), eventoId: "22222222-2222-4222-8222-222222222222" },
        ],
      }).expect(400);
      expect(await contarPlanos()).toBe(0);
    });

    it("14. mais de 50 itens falha (400)", async () => {
      await postar({
        ...base,
        itens: Array.from({ length: 51 }, itemOk),
      }).expect(400);
    });

    it("16. ano absurdo (202022) é rejeitado (400)", async () => {
      await postar({ ...base, dataFim: "202022-01-12" }).expect(400);
      await postar({
        ...base,
        itens: [{ ...itemOk(), dataHoraAgendada: "+202022-01-11T15:00:00.000Z" }],
      }).expect(400);
    });

    it("15. usuarioId enviado no body é rejeitado (400)", async () => {
      await postar({ ...base, usuarioId: "qualquer" }).expect(400);
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: ["a@turista.com", "b@turista.com", "admin@roteiro.com"] },
      },
    });
    await prisma.eventos.delete({ where: { id: eventoId } });
    await app.close();
  });
});
