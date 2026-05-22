import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";

describe("Item Plano de Viagem - Multi-Relações (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenTurista: string;
  let planoId: string;
  let eventoFalsoId: string;
  let itemCriadoId: string;

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

    // Cria utilizador
    const user = await prisma.user.create({
      data: {
        nome: "Turista Item",
        email: "item@turista.com",
        senha: "123",
        usuario: "turistaitem",
        perfil: "USUARIO",
      },
    });
    tokenTurista = jwtService.sign({ sub: user.id, perfil: user.perfil });

    // Cria um Plano para ele
    const plano = await prisma.planoViagem.create({
      data: {
        titulo: "Plano Teste",
        dataInicio: new Date(),
        dataFim: new Date(),
        usuarioId: user.id,
      },
    });
    planoId = plano.id;

    // Cria um Evento qualquer no banco só para podermos linkar a ele
    const evento = await prisma.eventos.create({
      data: {
        titulo: "Evento Base",
        descricao: "...",
        data: new Date(),
        local: "...",
      },
    });
    eventoFalsoId = evento.id;
  });

  it("1. POST /item-plano-viagem - Falha se enviar DOIS IDs (Regra de Negócio) (400)", () => {
    return request(app.getHttpServer())
      .post("/item-plano-viagem")
      .set("Authorization", `Bearer ${tokenTurista}`)
      .send({
        planoViagemId: planoId,
        dataHoraAgendada: new Date().toISOString(),
        eventoId: eventoFalsoId, // Colocou evento...
        gastronomiaId: "id-falso-qualquer", // E colocou restaurante junto! DEVE DAR ERRO!
      })
      .expect(400); // Bad Request! A nossa regra de apenas 1 por vez funcionou!
  });

  it("2. POST /item-plano-viagem - Cria com sucesso enviando apenas UM ID (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post("/item-plano-viagem")
      .set("Authorization", `Bearer ${tokenTurista}`)
      .send({
        planoViagemId: planoId,
        dataHoraAgendada: new Date().toISOString(),
        anotacao: "Lembrar de comprar ingresso",
        eventoId: eventoFalsoId, // Apenas o evento. Correto!
      })
      .expect(201);

    itemCriadoId = resposta.body.id;
  });

  it("3. DELETE /item-plano-viagem/:id - Apaga o item do cronograma (204)", () => {
    return request(app.getHttpServer())
      .delete(`/item-plano-viagem/${itemCriadoId}`)
      .set("Authorization", `Bearer ${tokenTurista}`)
      .expect(204);
  });

  afterAll(async () => {
    // Apaga o utilizador (o plano dele vai junto em Cascade) e apaga o evento falso
    await prisma.user.deleteMany({ where: { email: "item@turista.com" } });
    await prisma.eventos.delete({ where: { id: eventoFalsoId } });
    await app.close();
  });
});
