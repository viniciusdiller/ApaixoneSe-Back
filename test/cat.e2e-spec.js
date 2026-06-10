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
describe("CAT - Apenas Admin (e2e)", () => {
    let app;
    let prisma;
    let jwtService;
    let tokenComum;
    let tokenAdmin;
    let catCriadoId;
    const bufferPdf = Buffer.from("%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj", "utf-8");
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
                nome: "User Cat",
                email: "user@cat.com",
                senha: "123",
                usuario: "usercat",
                perfil: "USUARIO",
            },
        });
        const userAdmin = await prisma.user.create({
            data: {
                nome: "Admin Cat",
                email: "admin@cat.com",
                senha: "123",
                usuario: "admincat",
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
    it("1. POST /cat - User TENTA subir um mapa (403)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .post("/cat")
            .set("Authorization", `Bearer ${tokenComum}`)
            .field("texto", "Mapa Turístico Falso")
            .attach("arquivo", bufferPdf, "mapa.pdf")
            .expect(403);
    });
    it("2. POST /cat - Admin sobe um mapa com sucesso (201)", async () => {
        const resposta = await (0, supertest_1.default)(app.getHttpServer())
            .post("/cat")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .field("texto", "Mapa Oficial de Saquarema")
            .attach("arquivo", bufferPdf, "mapa.pdf")
            .expect(201);
        catCriadoId = resposta.body.id;
    });
    it("3. DELETE /cat/:id - Admin apaga o mapa (204)", () => {
        return (0, supertest_1.default)(app.getHttpServer())
            .delete(`/cat/${catCriadoId}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .expect(204);
    });
    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: { in: ["user@cat.com", "admin@cat.com"] } },
        });
        // Limpeza super poderosa: Apaga qualquer pasta que o teste do CAT tenha criado
        const pastaCat = path.join(".", "uploads", "Cat");
        if (fs.existsSync(pastaCat))
            fs.rmSync(pastaCat, { recursive: true, force: true });
        await app.close();
    });
});
//# sourceMappingURL=cat.e2e-spec.js.map