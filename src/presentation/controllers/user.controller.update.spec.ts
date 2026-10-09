import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { Test } from "@nestjs/testing";
import * as jwt from "jsonwebtoken";
import request from "supertest";
import { UserController } from "./user.controller";
import { UserApplication } from "../../application/applications/user.Application";
import { JwtStrategy } from "../../application/strategies/jwt.strategy";

const SECRET = "segredo-de-teste";

// Banco simulado: o perfil real vem daqui (a JwtStrategy consulta o banco)
const bancoUsuarios: Record<string, any> = {};
const novoUsuario = (id: string, perfil: string) => ({
  id,
  nome: `Nome ${id}`,
  usuario: `user_${id}`,
  email: `${id}@teste.com`,
  senha: "hash",
  perfil,
  active: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
});

describe("UserController - rotas de atualização (PUT próprio, PUT admin, PATCH)", () => {
  let app: INestApplication;

  const userRepository = {
    findById: jest.fn(async (id: string) => bancoUsuarios[id] ?? null),
    update: jest.fn(async (id: string, data: any) => ({
      ...bancoUsuarios[id],
      ...data,
    })),
  };

  const token = (id: string, perfil: string) =>
    jwt.sign({ id, perfil }, SECRET, { expiresIn: "1h" });

  const tokenUsuario = token("u1", "USUARIO");
  const tokenAdmin = token("a1", "ADMIN");

  beforeAll(async () => {
    process.env.JWT_SECRET = SECRET;
    const userApplication = new UserApplication(
      userRepository as any,
      {} as any,
      {} as any,
    );

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [UserController],
      providers: [
        JwtStrategy,
        { provide: UserApplication, useValue: userApplication },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    bancoUsuarios["u1"] = novoUsuario("u1", "USUARIO");
    bancoUsuarios["u2"] = novoUsuario("u2", "USUARIO");
    bancoUsuarios["a1"] = novoUsuario("a1", "ADMIN");
    userRepository.update.mockClear();
  });

  const put = (url: string, tk: string | null, body: object) => {
    const r = request(app.getHttpServer()).put(url);
    return (tk ? r.set("Authorization", `Bearer ${tk}`) : r).send(body);
  };

  describe("PUT /users/:id (edição do próprio perfil)", () => {
    it("usuário edita a si mesmo com os campos permitidos", async () => {
      const res = await put("/users/u1", tokenUsuario, {
        nome: "Novo Nome",
        usuario: "novo_user",
        email: "novo@teste.com",
        senha: "senha123",
      }).expect(200);

      expect(res.body.nome).toBe("Novo Nome");
      const dadosGravados = userRepository.update.mock.calls[0][1];
      expect(Object.keys(dadosGravados).sort()).toEqual(
        ["email", "nome", "senha", "usuario"],
      );
      expect(dadosGravados.senha).not.toBe("senha123"); // gravada com hash
    });

    it.each([
      ["active", { active: true }],
      ["perfil", { perfil: "ADMIN" }],
      ["campo inexistente", { salario: 9999 }],
    ])("usuário enviando %s: 400 e nada é gravado", async (_nome, body) => {
      await put("/users/u1", tokenUsuario, body).expect(400);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("usuário editando outro usuário: 403", async () => {
      await put("/users/u2", tokenUsuario, { nome: "Invasor" }).expect(403);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("admin editando OUTRO usuário por esta rota: 403 (deve usar /admin)", async () => {
      await put("/users/u1", tokenAdmin, { nome: "Via rota errada" }).expect(403);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("admin editando a si mesmo: 200, mas sem perfil/active", async () => {
      await put("/users/a1", tokenAdmin, { nome: "Admin Novo" }).expect(200);
      await put("/users/a1", tokenAdmin, { perfil: "USUARIO" }).expect(400);
      await put("/users/a1", tokenAdmin, { active: false }).expect(400);
      expect(userRepository.update).toHaveBeenCalledTimes(1);
    });

    it("sem token: 401", async () => {
      await put("/users/u1", null, { nome: "x" }).expect(401);
    });
  });

  describe("PUT /users/:id/admin (edição administrativa)", () => {
    it("admin altera perfil, active e dados de outro usuário", async () => {
      const res = await put("/users/u1/admin", tokenAdmin, {
        nome: "Editado pelo admin",
        perfil: "PARCEIRO",
        active: false,
      }).expect(200);

      expect(res.body.perfil).toBe("PARCEIRO");
      expect(res.body.active).toBe(false);
      expect(userRepository.update).toHaveBeenCalledWith("u1", {
        nome: "Editado pelo admin",
        perfil: "PARCEIRO",
        active: false,
      });
    });

    it("admin: perfil inválido e campo inexistente dão 400", async () => {
      await put("/users/u1/admin", tokenAdmin, { perfil: "SUPERADMIN" }).expect(400);
      await put("/users/u1/admin", tokenAdmin, { salario: 1 }).expect(400);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("usuário comum tentando se promover por esta rota: 403", async () => {
      await put("/users/u1/admin", tokenUsuario, { perfil: "ADMIN" }).expect(403);
      await put("/users/u1/admin", tokenUsuario, { nome: "x" }).expect(403);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("admin rebaixado no banco (token antigo ainda diz ADMIN): 403", async () => {
      bancoUsuarios["a1"].perfil = "USUARIO";
      await put("/users/u1/admin", tokenAdmin, { perfil: "ADMIN" }).expect(403);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("sem token: 401", async () => {
      await put("/users/u1/admin", null, { nome: "x" }).expect(401);
    });
  });

  describe("PATCH /users/:id (sem alteração de comportamento)", () => {
    const patch = (tk: string, body: object) =>
      request(app.getHttpServer())
        .patch("/users/u1")
        .set("Authorization", `Bearer ${tk}`)
        .send(body);

    it("admin alterna active", async () => {
      await patch(tokenAdmin, { active: false }).expect(200);
      expect(userRepository.update).toHaveBeenCalledWith("u1", { active: false });
    });

    it("usuário comum não consegue alterar o próprio active", async () => {
      await patch(tokenUsuario, { active: true }).expect(403);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });
});
