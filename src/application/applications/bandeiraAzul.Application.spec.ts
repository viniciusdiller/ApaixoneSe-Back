import { ForbiddenException } from "@nestjs/common";
import { BandeiraAzulApplication } from "./bandeiraAzul.Application";
import { BandeiraAzulRepository } from "../../data/repositories/bandeiraAzul.repository";
import { BandeiraAzul } from "../../data/entities/bandeiraAzul.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

describe("BandeiraAzulApplication", () => {
  let application: BandeiraAzulApplication;
  let repository: jest.Mocked<BandeiraAzulRepository>;

  const admin: IUsuarioLogado = { id: "admin-1", perfil: "ADMIN" };
  const usuarioComum: IUsuarioLogado = { id: "user-1", perfil: "USUARIO" };

  const payload = {
    titulo: "Praias com Bandeira Azul",
    subtitulo: "Selo de qualidade ambiental",
    bannerImagens: ["/uploads/bandeira-azul/img_1.webp"],
    blocos: [{ type: "text" as const, content: "Texto", bgColor: "#ffffff" }],
  };

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<BandeiraAzulRepository>;
    application = new BandeiraAzulApplication(repository);
  });

  describe("find", () => {
    it("retorna a página publicada sem exigir autenticação", async () => {
      const pagina = new BandeiraAzul({ id: "1", ...payload });
      repository.find.mockResolvedValue(pagina);

      await expect(application.find()).resolves.toBe(pagina);
    });

    it("retorna null quando ainda não há página", async () => {
      repository.find.mockResolvedValue(null);

      await expect(application.find()).resolves.toBeNull();
    });
  });

  describe("save", () => {
    it("lança ForbiddenException quando o usuário não é ADMIN", async () => {
      await expect(application.save(payload, usuarioComum)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("salva a página quando o usuário é ADMIN", async () => {
      repository.save.mockImplementation(async (d) => d);

      const resultado = await application.save(payload, admin);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: payload.titulo, blocos: payload.blocos }),
      );
      expect(resultado.titulo).toBe(payload.titulo);
    });
  });

  describe("verificarAdmin", () => {
    it("aceita ADMIN e rejeita os demais perfis", () => {
      expect(() => application.verificarAdmin(admin)).not.toThrow();
      expect(() => application.verificarAdmin(usuarioComum)).toThrow(
        ForbiddenException,
      );
    });
  });
});
