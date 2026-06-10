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
describe("Hospedagem - CRUD e Permissões (e2e)", () => {
    let app;
    let prisma;
    let jwtService;
    let tokenDono;
    let tokenAdmin;
    let tokenInvasor;
    let hospedagemCriadaId;
    const cnpjTeste = `CNPJ-HOSP-${Date.now()}`;
    const bufferImagem = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    const bufferPdf = Buffer.from("%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF", "utf-8");
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
                nome: "Dono Hosp",
                email: "donohosp@teste.com",
                senha: "123",
                usuario: "donohosp",
                perfil: "USUARIO",
            },
        });
        const userAdmin = await prisma.user.create({
            data: {
                nome: "Admin Hosp",
                email: "adminhosp@teste.com",
                senha: "123",
                usuario: "adminhosp",
                perfil: "ADMIN",
            },
        });
        const userInvasor = await prisma.user.create({
            data: {
                nome: "Invasor Hosp",
                email: "invasorhosp@teste.com",
                senha: "123",
                usuario: "invasorhosp",
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
    it("1. GET /hospedagem - Listar publicamente (200)", () => {
        return (0, supertest_1.default)(app.getHttpServer()).get("/hospedagem").expect(200);
    });
    it("2. POST /hospedagem - Criar Hospedagem (201)", async () => {
        const resposta = await (0, supertest_1.default)(app.getHttpServer())
            .post("/hospedagem")
            .set("Authorization", `Bearer ${tokenDono}`)
            .field("nome", "Pousada E2E")
            .field("telefone", "999999999")
            .field("endereco", "Rua Praia, 1")
            .field("textoDiferencial", "Piscina aquecida e vista mar!")
            .field("cnpj", cnpjTeste)
            .field("responsavelNome", "Dono")
            .field("responsavelCpf", "11122233344")
            .attach("logo", bufferImagem, "logo.png")
            .attach("documentoPdf", bufferPdf, "doc.pdf")
            .expect(201);
        hospedagemCriadaId = resposta.body.id;
    });
    it("3. PUT /hospedagem/:id - Invasor tenta alterar (403)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .put(`/hospedagem/${hospedagemCriadaId}`)
            .set("Authorization", `Bearer ${tokenInvasor}`)
            .field("telefone", "000")
            .expect(403);
    });
    it("4. PUT /hospedagem/:id - Dono tenta aprovar sozinho (403)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .put(`/hospedagem/${hospedagemCriadaId}`)
            .set("Authorization", `Bearer ${tokenDono}`)
            .field("status", "APROVADO")
            .expect(403);
    });
    it("5. PUT /hospedagem/:id - Admin aprova (200)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .put(`/hospedagem/${hospedagemCriadaId}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .field("status", "APROVADO")
            .expect(200);
    });
    it("6. DELETE /hospedagem/:id - Invasor tenta apagar (403)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .delete(`/hospedagem/${hospedagemCriadaId}`)
            .set("Authorization", `Bearer ${tokenInvasor}`)
            .expect(403);
    });
    it("7. DELETE /hospedagem/:id - Admin apaga (204)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .delete(`/hospedagem/${hospedagemCriadaId}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .expect(204);
    });
    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        "donohosp@teste.com",
                        "adminhosp@teste.com",
                        "invasorhosp@teste.com",
                    ],
                },
            },
        });
        const pastaFisica = path.join(".", "uploads", "Hospedagem", "pousada_e2e");
        if (fs.existsSync(pastaFisica))
            fs.rmSync(pastaFisica, { recursive: true, force: true });
        await app.close();
    });
});
//# sourceMappingURL=hospedagem.e2e-spec.js.map