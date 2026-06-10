"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("./../src/app.module");
const prisma_Service_1 = require("./../src/data/providers/db/prisma.Service");
const jwt_1 = require("@nestjs/jwt");
describe("Eventos - Apenas Admin (e2e)", () => {
    let app;
    let prisma;
    let jwtService;
    let tokenComum;
    let tokenAdmin;
    let eventoCriadoId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                app_module_1.AppModule,
                jwt_1.JwtModule.register({ secret: process.env.JWT_SECRET || "secreta" }),
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        prisma = app.get(prisma_Service_1.PrismaService);
        jwtService = app.get(jwt_1.JwtService);
        const userComum = await prisma.user.create({
            data: {
                nome: "User Event",
                email: "user@event.com",
                senha: "123",
                usuario: "userevent",
                perfil: "USUARIO",
            },
        });
        const userAdmin = await prisma.user.create({
            data: {
                nome: "Admin Event",
                email: "admin@event.com",
                senha: "123",
                usuario: "adminevent",
                perfil: "ADMIN",
            },
        });
        tokenComum = jwtService.sign({
            sub: userComum.id,
            perfil: userComum.perfil,
        });
        tokenAdmin = jwtService.sign({
            sub: userAdmin.id,
            perfil: userAdmin.perfil,
        });
    });
    it("1. GET /eventos - Listar publicamente (200)", () => {
        return (0, supertest_1.default)(app.getHttpServer()).get("/eventos").expect(200);
    });
    it("2. POST /eventos - Utilizador Comum TENTA criar evento (403)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .post("/eventos")
            .set("Authorization", `Bearer ${tokenComum}`)
            .send({
            titulo: "Festa Fake",
            descricao: "Teste",
            data: new Date().toISOString(),
            local: "Praça",
        })
            .expect(403); // O Admin Guard bloqueia!
    });
    it("3. POST /eventos - Admin cria evento com sucesso (201)", async () => {
        const resposta = await (0, supertest_1.default)(app.getHttpServer())
            .post("/eventos")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send({
            titulo: "Saquarema Surf Festival",
            descricao: "Maior campeonato!",
            data: new Date().toISOString(),
            local: "Praia de Itaúna",
        })
            .expect(201);
        eventoCriadoId = resposta.body.id;
    });
    it("4. DELETE /eventos/:id - Utilizador Comum TENTA apagar (403)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .delete(`/eventos/${eventoCriadoId}`)
            .set("Authorization", `Bearer ${tokenComum}`)
            .expect(403);
    });
    it("5. DELETE /eventos/:id - Admin apaga o evento (204)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .delete(`/eventos/${eventoCriadoId}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .expect(204);
    });
    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: { in: ["user@event.com", "admin@event.com"] } },
        });
        await app.close();
    });
});
//# sourceMappingURL=evento.e2e-spec.js.map