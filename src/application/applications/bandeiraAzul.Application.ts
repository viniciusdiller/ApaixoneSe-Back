import { Injectable, ForbiddenException } from "@nestjs/common";
import { BandeiraAzulRepository } from "../../data/repositories/bandeiraAzul.repository";
import { BandeiraAzul } from "../../data/entities/bandeiraAzul.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class BandeiraAzulApplication {
  constructor(private readonly repo: BandeiraAzulRepository) {}

  verificarAdmin(usuario: IUsuarioLogado) {
    if (usuario.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem gerenciar a página da Bandeira Azul.",
      );
    }
  }

  // Público: null quando o admin ainda não publicou a página
  async find() {
    return this.repo.find();
  }

  async save(
    data: Pick<BandeiraAzul, "titulo" | "subtitulo" | "bannerImagens" | "blocos">,
    usuario: IUsuarioLogado,
  ) {
    this.verificarAdmin(usuario);
    return this.repo.save(new BandeiraAzul(data));
  }
}
