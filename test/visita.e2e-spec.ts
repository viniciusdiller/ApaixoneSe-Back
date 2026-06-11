import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/data/providers/db/prisma.Service";
import { JwtService, JwtModule } from "@nestjs/jwt";

describe("Visitas - Check-ins (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenUser: string;
  let gastronomiaId: string;
  let atividadeId: string;

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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Criar usuário para o check-in
    const userVisita = await prisma.user.create({
      data: {
        nome: "User Visita",
        email: "user@visita.com",
        senha: "123",
        usuario: "uservisita",
        perfil: "USUARIO",
      },
    });
    tokenUser = jwtService.sign({ sub: userVisita.id, perfil: userVisita.perfil });

    // Criar admin para ter permissão de criar gastronomia e atividade
    const userAdmin = await prisma.user.create({
      data: {
        nome: "Admin Visita",
        email: "admin@visita.com",
        senha: "123",
        usuario: "adminvisita",
        perfil: "ADMIN",
      },
    });
    const tokenAdmin = jwtService.sign({ sub: userAdmin.id, perfil: userAdmin.perfil });

    // Criar uma gastronomia de teste usando a API
    const cnpjGastro = `CNPJ-VISITA-${Date.now()}`;
    const resGastro = await request(app.getHttpServer())
      .post("/gastronomia")
      .set("Authorization", `Bearer ${tokenUser}`)
      .field("nome", "Restaurante Visita E2E")
      .field("telefone", "22999")
      .field("endereco", "Rua do Check-in, 1")
      .field("cnpj", cnpjGastro)
      .field("responsavelNome", "Dono")
      .field("responsavelCpf", "11122233355")
      .attach("logo", bufferImagem, "logo.png")
      .attach("documentoPdf", bufferPdf, "doc.pdf");
    gastronomiaId = resGastro.body.id;

    // Criar uma atividade de teste usando a API
    const resAtiv = await request(app.getHttpServer())
      .post("/atividades")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        titulo: "Passeio de Barco Visita",
        descricao: "Lagoa de Araruama",
        local: "Lagoa",
        roteiro: "ESPORTE_E_AVENTURA",
      });
    atividadeId = resAtiv.body.id;
  });

  it("1. POST /visitas/gastronomia/:id - Sem token deve bloquear (401)", () => {
    return request(app.getHttpServer())
      .post(`/visitas/gastronomia/${gastronomiaId}`)
      .expect(401);
  });

  it("2. POST /visitas/gastronomia/:id - Faz check-in com sucesso (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/visitas/gastronomia/${gastronomiaId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .expect(201);

    expect(resposta.body.status).toBe("adicionado");
  });

  it("3. POST /visitas/gastronomia/:id - Segundo check-in REMOVE o anterior (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/visitas/gastronomia/${gastronomiaId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .expect(201);

    expect(resposta.body.status).toBe("removido");
  });

  it("4. POST /visitas/gastronomia/:id - Faz check-in novamente (201)", async () => {
    await request(app.getHttpServer())
      .post(`/visitas/gastronomia/${gastronomiaId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .expect(201);
  });

  it("5. POST /visitas/atividade/:id - Faz check-in em atividade (201)", async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/visitas/atividade/${atividadeId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .expect(201);

    expect(resposta.body.status).toBe("adicionado");
  });

  it("6. GET /visitas/minhas - Deve retornar as visitas do usuário (200)", async () => {
    const resposta = await request(app.getHttpServer())
      .get("/visitas/minhas")
      .set("Authorization", `Bearer ${tokenUser}`)
      .expect(200);

    expect(resposta.body.gastronomias).toContain(gastronomiaId);
    expect(resposta.body.atividades).toContain(atividadeId);
  });

  it("7. GET /visitas/minhas - Sem token deve bloquear (401)", () => {
    return request(app.getHttpServer()).get("/visitas/minhas").expect(401);
  });

  it("8. POST /visitas/gastronomia/id-invalido - ID inexistente retorna 404 (404)", () => {
    return request(app.getHttpServer())
      .post("/visitas/gastronomia/id-que-nao-existe")
      .set("Authorization", `Bearer ${tokenUser}`)
      .expect(404);
  });

  afterAll(async () => {
    // Limpar visitas e recursos criados
    await prisma.visita.deleteMany({});
    if (gastronomiaId) {
      await prisma.gastronomia.deleteMany({ where: { id: gastronomiaId } });
    }
    if (atividadeId) {
      await prisma.atividade.deleteMany({ where: { id: atividadeId } });
    }
    await prisma.user.deleteMany({
      where: { email: { in: ["user@visita.com", "admin@visita.com"] } },
    });
    await app.close();
  });
});
