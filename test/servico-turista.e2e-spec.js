"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("./../src/app.module");
const prisma_Service_1 = require("./../src/data/providers/db/prisma.Service");
const jwt_1 = require("@nestjs/jwt");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
describe("Servico Turista - CRUD e Permissões (e2e)", () => {
    let app;
    let prisma;
    let jwtService;
    let tokenDono;
    let tokenAdmin;
    let tokenInvasor;
    let servicoCriadoId;
    const bufferImagem = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
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
        const userDono = await prisma.user.create({
            data: {
                nome: "Dono Serv",
                email: "donoserv@teste.com",
                senha: "123",
                usuario: "donoserv",
                perfil: "USUARIO",
            },
        });
        const userAdmin = await prisma.user.create({
            data: {
                nome: "Admin Serv",
                email: "adminserv@teste.com",
                senha: "123",
                usuario: "adminserv",
                perfil: "ADMIN",
            },
        });
        const userInvasor = await prisma.user.create({
            data: {
                nome: "Invasor Serv",
                email: "invasorserv@teste.com",
                senha: "123",
                usuario: "invasorserv",
                perfil: "USUARIO",
            },
        });
        tokenDono = jwtService.sign({ sub: userDono.id, perfil: userDono.perfil });
        tokenAdmin = jwtService.sign({
            sub: userAdmin.id,
            perfil: userAdmin.perfil,
        });
        tokenInvasor = jwtService.sign({
            sub: userInvasor.id,
            perfil: userInvasor.perfil,
        });
    });
    it("1. GET /servico-turista - Listar (200)", () => {
        return (0, supertest_1.default)(app.getHttpServer()).get("/servico-turista").expect(200);
    });
    it("2. POST /servico-turista - Agência sem Logo deve falhar (400)", () => {
        return ((0, supertest_1.default)(app.getHttpServer())
            .post("/servico-turista")
            .set("Authorization", `Bearer ${tokenDono}`)
            .field("nome", "Agência Bugada")
            .field("tipo", "AGENCIA_TURISMO")
            // Enviando 'foto' em vez de 'logo' para testar a validação do controller
            .attach("foto", bufferImagem, "foto.png")
            .expect(400));
    });
    it("3. POST /servico-turista - Criar Agência com sucesso (201)", async () => {
        const resposta = await (0, supertest_1.default)(app.getHttpServer())
            .post("/servico-turista")
            .set("Authorization", `Bearer ${tokenDono}`)
            .field("nome", "Agencia E2E")
            .field("telefone", "999999999")
            .field("tipo", "AGENCIA_TURISMO")
            .attach("logo", bufferImagem, "logo.png") // Agência pede logo
            .expect(201);
        servicoCriadoId = resposta.body.id;
    });
    it("4. PUT /servico-turista/:id - Invasor tenta alterar (403)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .put(`/servico-turista/${servicoCriadoId}`)
            .set("Authorization", `Bearer ${tokenInvasor}`)
            .field("telefone", "000")
            .expect(403);
    });
    it("5. PUT /servico-turista/:id - Admin aprova (200)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .put(`/servico-turista/${servicoCriadoId}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .field("status", "APROVADO")
            .expect(200);
    });
    it("6. DELETE /servico-turista/:id - Admin apaga (204)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .delete(`/servico-turista/${servicoCriadoId}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .expect(204);
    });
    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        "donoserv@teste.com",
                        "adminserv@teste.com",
                        "invasorserv@teste.com",
                    ],
                },
            },
        });
        const pastaFisica = path.join(".", "uploads", "servico_turista", "agencia_e2e");
        if (fs.existsSync(pastaFisica))
            fs.rmSync(pastaFisica, { recursive: true, force: true });
        await app.close();
    });
});
//# sourceMappingURL=servico-turista.e2e-spec.js.map