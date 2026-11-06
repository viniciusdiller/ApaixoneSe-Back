import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { SalvarBandeiraAzulRequestDto } from "./salvarBandeiraAzulRequestDto";

const validar = (obj: unknown) =>
  validate(plainToInstance(SalvarBandeiraAzulRequestDto, obj), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

const base = {
  titulo: "Bandeira Azul",
  blocos: [
    { type: "text", content: "Olá", bgColor: "#ffffff", isBold: false },
    { type: "image", content: "", images: [{ url: "/uploads/bandeira-azul/a.webp", link: "https://exemplo.com" }] },
    { type: "video", content: "", videos: [{ url: "https://www.youtube.com/watch?v=abc" }] },
  ],
};

describe("SalvarBandeiraAzulRequestDto", () => {
  it("aceita um payload válido", async () => {
    expect(await validar(base)).toHaveLength(0);
  });

  it("rejeita título vazio", async () => {
    expect((await validar({ ...base, titulo: "" })).length).toBeGreaterThan(0);
  });

  it("rejeita tipo de bloco desconhecido", async () => {
    const erros = await validar({ ...base, blocos: [{ type: "script", content: "x" }] });
    expect(erros.length).toBeGreaterThan(0);
  });

  it("rejeita URL de mídia com esquema perigoso", async () => {
    const erros = await validar({
      ...base,
      blocos: [{ type: "image", content: "", images: [{ url: "javascript:alert(1)" }] }],
    });
    expect(erros.length).toBeGreaterThan(0);
  });

  it("rejeita link com esquema perigoso", async () => {
    const erros = await validar({
      ...base,
      blocos: [{ type: "image", content: "", images: [{ url: "/uploads/a.webp", link: "javascript:alert(1)" }] }],
    });
    expect(erros.length).toBeGreaterThan(0);
  });

  it("rejeita campos fora do DTO", async () => {
    const erros = await validar({
      ...base,
      blocos: [{ type: "text", content: "x", id: "abc" }],
    });
    expect(erros.length).toBeGreaterThan(0);
  });

  it("rejeita cor de fundo fora do formato hex", async () => {
    const erros = await validar({
      ...base,
      blocos: [{ type: "text", content: "x", bgColor: "red; background:url(x)" }],
    });
    expect(erros.length).toBeGreaterThan(0);
  });

  it("aceita até 10 fotos no banner e rejeita 11", async () => {
    const foto = "/uploads/bandeira-azul/a.webp";
    expect(await validar({ ...base, bannerImagens: Array(10).fill(foto) })).toHaveLength(0);
    expect((await validar({ ...base, bannerImagens: Array(11).fill(foto) })).length).toBeGreaterThan(0);
  });

  it("rejeita foto do banner com esquema perigoso", async () => {
    const erros = await validar({ ...base, bannerImagens: ["javascript:alert(1)"] });
    expect(erros.length).toBeGreaterThan(0);
  });

  it("rejeita mais de 100 blocos", async () => {
    const blocos = Array.from({ length: 101 }, () => ({ type: "text", content: "x" }));
    expect((await validar({ ...base, blocos })).length).toBeGreaterThan(0);
  });
});
