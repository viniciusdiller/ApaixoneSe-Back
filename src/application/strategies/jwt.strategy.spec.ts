import { Controller, Get, INestApplication, Req, UseGuards } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PassportModule } from "@nestjs/passport";
import * as jwt from "jsonwebtoken";
import request from "supertest";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "../../presentation/guards/jwt-autg.guard";
import { UserApplication } from "../applications/user.Application";

const SECRET = "segredo-de-teste";

@Controller("teste")
class RotaProtegidaController {
  @Get("rota")
  @UseGuards(JwtAuthGuard)
  rota(@Req() req: any) {
    return req.user;
  }
}

describe("JwtStrategy (revalidação no banco)", () => {
  let app: INestApplication;
  const obterSituacaoAtual = jest.fn();
  const token = (payload: object, opts: jwt.SignOptions = { expiresIn: "1h" }) =>
    jwt.sign(payload, SECRET, opts);

  beforeAll(async () => {
    process.env.JWT_SECRET = SECRET;
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [RotaProtegidaController],
      providers: [
        JwtStrategy,
        { provide: UserApplication, useValue: { obterSituacaoAtual } },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => obterSituacaoAtual.mockReset());

  const get = (t?: string) => {
    const r = request(app.getHttpServer()).get("/teste/rota");
    return t ? r.set("Authorization", `Bearer ${t}`) : r;
  };

  it("sem token: 401 e não consulta o banco", async () => {
    await get().expect(401);
    expect(obterSituacaoAtual).not.toHaveBeenCalled();
  });

  it("token com assinatura inválida: 401 e não consulta o banco", async () => {
    const falso = jwt.sign({ id: "a1", perfil: "ADMIN" }, "outra-chave");
    await get(falso).expect(401);
    expect(obterSituacaoAtual).not.toHaveBeenCalled();
  });

  it("token expirado: 401 e não consulta o banco", async () => {
    const expirado = token({ id: "a1", perfil: "ADMIN" }, { expiresIn: -10 });
    await get(expirado).expect(401);
    expect(obterSituacaoAtual).not.toHaveBeenCalled();
  });

  it("token sem id: 401 e não consulta o banco", async () => {
    await get(token({ perfil: "ADMIN" })).expect(401);
    expect(obterSituacaoAtual).not.toHaveBeenCalled();
  });

  it("usuário ativo: req.user usa id do token e perfil do banco", async () => {
    obterSituacaoAtual.mockResolvedValue({ perfil: "USUARIO", active: true });
    const res = await get(token({ id: "u1", perfil: "USUARIO" })).expect(200);
    expect(res.body).toEqual({ id: "u1", perfil: "USUARIO" });
    expect(obterSituacaoAtual).toHaveBeenCalledWith("u1");
  });

  it("ADMIN rebaixado: token diz ADMIN, req.user chega como USUARIO", async () => {
    obterSituacaoAtual.mockResolvedValue({ perfil: "USUARIO", active: true });
    const res = await get(token({ id: "a1", perfil: "ADMIN" })).expect(200);
    expect(res.body).toEqual({ id: "a1", perfil: "USUARIO" });
  });

  it("USUARIO promovido: perfil do banco prevalece", async () => {
    obterSituacaoAtual.mockResolvedValue({ perfil: "ADMIN", active: true });
    const res = await get(token({ id: "u1", perfil: "USUARIO" })).expect(200);
    expect(res.body).toEqual({ id: "u1", perfil: "ADMIN" });
  });

  it("conta desativada: 401", async () => {
    obterSituacaoAtual.mockResolvedValue({ perfil: "ADMIN", active: false });
    await get(token({ id: "a1", perfil: "ADMIN" })).expect(401);
  });

  it("conta removida: 401", async () => {
    obterSituacaoAtual.mockResolvedValue(null);
    await get(token({ id: "a1", perfil: "ADMIN" })).expect(401);
  });
});
