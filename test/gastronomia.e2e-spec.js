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
describe("Gastronomia - CRUD e Permissões (e2e)", () => {
    let app;
    let prisma;
    let jwtService;
    // Variáveis para os tokens
    let tokenDono;
    let tokenAdmin;
    let tokenInvasor; // 🕵️‍♂️ NOVO: O Token do utilizador malicioso
    let restauranteCriadoId;
    const cnpjTeste = `CNPJ-${Date.now()}`;
    // BUFFERS MÁGICOS
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
        // 1. CRIAR OS 3 UTILIZADORES NA BASE DE DADOS
        const userDono = await prisma.user.create({
            data: {
                nome: "Dono Teste",
                email: "dono@teste.com",
                senha: "123",
                usuario: "donoteste",
                perfil: "USUARIO",
            },
        });
        const userAdmin = await prisma.user.create({
            data: {
                nome: "Admin Teste",
                email: "admin@teste.com",
                senha: "123",
                usuario: "adminteste",
                perfil: "ADMIN",
            },
        });
        // 🕵️‍♂️ NOVO: Criando o usuário Invasor (um usuário comum qualquer)
        const userInvasor = await prisma.user.create({
            data: {
                nome: "Invasor Teste",
                email: "invasor@teste.com",
                senha: "123",
                usuario: "invasorteste",
                perfil: "USUARIO",
            },
        });
        // 2. FORJAR OS TOKENS
        tokenDono = jwtService.sign({ sub: userDono.id, perfil: userDono.perfil });
        tokenAdmin = jwtService.sign({
            sub: userAdmin.id,
            perfil: userAdmin.perfil,
        });
        tokenInvasor = jwtService.sign({
            sub: userInvasor.id,
            perfil: userInvasor.perfil,
        }); // 🕵️‍♂️ NOVO
    });
    // =========================================================
    // BATERIA DE TESTES
    // =========================================================
    it("1. GET /gastronomia - Deve listar publicamente (200 OK)", () => {
        return (0, supertest_1.default)(app.getHttpServer()).get("/gastronomia").expect(200);
    });
    it("2. POST /gastronomia - Deve BLOQUEAR quem não tem Token (401 Unauthorized)", () => {
        return (0, supertest_1.default)(app.getHttpServer()).post("/gastronomia").expect(401);
    });
    it("3. POST /gastronomia - Deve BLOQUEAR utilizador logado que não enviou as imagens (400 Bad Request)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .post("/gastronomia")
            .set("Authorization", `Bearer ${tokenDono}`)
            .field("nome", "Restaurante Falso")
            .expect(400);
    });
    it("4. POST /gastronomia - Deve CRIAR com sucesso sendo Usuário Comum (201 Created)", async () => {
        const resposta = await (0, supertest_1.default)(app.getHttpServer())
            .post("/gastronomia")
            .set("Authorization", `Bearer ${tokenDono}`)
            .field("nome", "Restaurante E2E")
            .field("telefone", "999999999")
            .field("endereco", "Rua Teste, 123")
            .field("cnpj", cnpjTeste)
            .field("responsavelNome", "Dono")
            .field("responsavelCpf", "11122233344")
            .attach("logo", bufferImagem, "logo.png")
            .attach("documentoPdf", bufferPdf, "doc.pdf")
            .expect(201);
        restauranteCriadoId = resposta.body.id;
        expect(resposta.body.status).toBe("PENDENTE");
    });
    // =========================================================
    // NOVOS TESTES DE SEGURANÇA (O INVASOR EM AÇÃO)
    // =========================================================
    it("5. PUT /gastronomia/:id - O INVASOR tenta editar o telefone do restaurante de outro (403 Forbidden)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .put(`/gastronomia/${restauranteCriadoId}`)
            .set("Authorization", `Bearer ${tokenInvasor}`) // Usando o token do invasor!
            .field("telefone", "000000000") // Tentando alterar os dados do verdadeiro dono
            .expect(403);
    });
    it("6. DELETE /gastronomia/:id - O INVASOR tenta apagar o restaurante de outro (403 Forbidden)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .delete(`/gastronomia/${restauranteCriadoId}`)
            .set("Authorization", `Bearer ${tokenInvasor}`) // Usando o token do invasor!
            .expect(403);
    });
    // =========================================================
    // CONTINUAÇÃO DOS TESTES ORIGINAIS
    // =========================================================
    it("7. PUT /gastronomia/:id - O Dono TENTA APROVAR o próprio restaurante (403 Forbidden)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .put(`/gastronomia/${restauranteCriadoId}`)
            .set("Authorization", `Bearer ${tokenDono}`)
            .field("status", "APROVADO")
            .expect(403);
    });
    it("8. PUT /gastronomia/:id - O ADMIN APROVA o restaurante (200 OK)", async () => {
        const resposta = await (0, supertest_1.default)(app.getHttpServer())
            .put(`/gastronomia/${restauranteCriadoId}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .field("status", "APROVADO")
            .expect(200);
        expect(resposta.body.status).toBe("APROVADO");
    });
    it("9. DELETE /gastronomia/:id - O ADMIN APAGA o restaurante (204 No Content)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .delete(`/gastronomia/${restauranteCriadoId}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .expect(204);
    });
    // =========================================================
    // LIMPEZA FINAL
    // =========================================================
    afterAll(async () => {
        // Apagamos os 3 utilizadores de teste
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ["dono@teste.com", "admin@teste.com", "invasor@teste.com"],
                },
            },
        });
        const pastaFisica = path.join(".", "uploads", "Gastronomia", "restaurante_e2e");
        if (fs.existsSync(pastaFisica)) {
            fs.rmSync(pastaFisica, { recursive: true, force: true });
        }
        await app.close();
    });
});
//# sourceMappingURL=gastronomia.e2e-spec.js.map