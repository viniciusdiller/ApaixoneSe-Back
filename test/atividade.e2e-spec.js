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
describe("Atividades - Apenas Admin (e2e)", () => {
    let app;
    let prisma;
    let jwtService;
    let tokenComum;
    let tokenAdmin;
    let atividadeCriadaId;
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
                nome: "User Ativ",
                email: "user@ativ.com",
                senha: "123",
                usuario: "userativ",
                perfil: "USUARIO",
            },
        });
        const userAdmin = await prisma.user.create({
            data: {
                nome: "Admin Ativ",
                email: "admin@ativ.com",
                senha: "123",
                usuario: "adminativ",
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
    it("1. POST /atividades - User TENTA criar atividade (403)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .post("/atividades")
            .set("Authorization", `Bearer ${tokenComum}`)
            .send({
            titulo: "Trilha",
            descricao: "Andar no mato",
            local: "Serra",
            roteiro: "ECOLOGICO",
        })
            .expect(403);
    });
    it("2. POST /atividades - Admin cria atividade (201)", async () => {
        const resposta = await (0, supertest_1.default)(app.getHttpServer())
            .post("/atividades")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send({
            titulo: "Passeio de Barco",
            descricao: "Lagoa top",
            local: "Lagoa",
            roteiro: "ESPORTE_E_AVENTURA",
        })
            .expect(201);
        atividadeCriadaId = resposta.body.id;
    });
    it("3. DELETE /atividades/:id - Admin apaga (204)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .delete(`/atividades/${atividadeCriadaId}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .expect(204);
    });
    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: { in: ["user@ativ.com", "admin@ativ.com"] } },
        });
        await app.close();
    });
});
//# sourceMappingURL=atividade.e2e-spec.js.map