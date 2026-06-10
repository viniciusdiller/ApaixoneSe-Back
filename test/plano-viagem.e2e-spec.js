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
describe("Plano de Viagem - Privacidade (e2e)", () => {
    let app;
    let prisma;
    let jwtService;
    let tokenTuristaA;
    let tokenTuristaB;
    let tokenAdmin;
    let planoDoTuristaA_Id;
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
        const resposta = await (0, supertest_1.default)(app.getHttpServer())
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
        const resposta = await (0, supertest_1.default)(app.getHttpServer())
            .get("/plano-viagem")
            .set("Authorization", `Bearer ${tokenTuristaA}`)
            .expect(200);
        expect(resposta.body.length).toBeGreaterThan(0); // Tem que vir o que ele acabou de criar
    });
    it("3. GET /plano-viagem - Turista B lista os SEUS roteiros e vem vazio (200)", async () => {
        const resposta = await (0, supertest_1.default)(app.getHttpServer())
            .get("/plano-viagem")
            .set("Authorization", `Bearer ${tokenTuristaB}`)
            .expect(200);
        expect(resposta.body.length).toBe(0); // Ele não tem roteiros, e NÃO PODE ver os do A!
    });
    it("4. GET /plano-viagem/:id - Turista B tenta aceder ao roteiro do Turista A (403)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .get(`/plano-viagem/${planoDoTuristaA_Id}`)
            .set("Authorization", `Bearer ${tokenTuristaB}`)
            .expect(403);
    });
    it("5. DELETE /plano-viagem/:id - Turista B tenta apagar o roteiro do Turista A (403)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .delete(`/plano-viagem/${planoDoTuristaA_Id}`)
            .set("Authorization", `Bearer ${tokenTuristaB}`)
            .expect(403);
    });
    it("6. DELETE /plano-viagem/:id - Turista A apaga o SEU roteiro (204)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
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
//# sourceMappingURL=plano-viagem.e2e-spec.js.map