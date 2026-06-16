import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { CatMovelRepository } from "../../data/repositories/catMovel.repository";
import { CatMovel } from "../../data/entities/catMovel.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class CatMovelApplication {
  constructor(private readonly repo: CatMovelRepository) {}

  async create(
    data: any,
    usuarioLogado: IUsuarioLogado,
    imagemUrl?: string,
    videoUrl?: string,
  ): Promise<CatMovel> {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem criar cards do CAT Móvel.",
      );
    }

    if (!imagemUrl && !videoUrl) {
      throw new BadRequestException(
        "É obrigatório enviar uma imagem ou um vídeo para o card do CAT Móvel.",
      );
    }

    if (imagemUrl && videoUrl) {
      throw new BadRequestException(
        "Envie apenas uma mídia por card: imagem OU vídeo, não ambos.",
      );
    }

    const novo = new CatMovel({
      titulo: data.titulo,
      descricao: data.descricao,
      imagemUrl: imagemUrl ?? null,
      videoUrl: videoUrl ?? null,
    });

    return this.repo.save(novo);
  }

  async findAll(): Promise<CatMovel[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<CatMovel> {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException("Card do CAT Móvel não encontrado.");
    return c;
  }

  async update(
    id: string,
    data: any,
    usuarioLogado: IUsuarioLogado,
    imagemUrl?: string,
    videoUrl?: string,
  ): Promise<CatMovel> {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem alterar cards do CAT Móvel.",
      );
    }

    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException("Card do CAT Móvel não encontrado.");

    // Não permite enviar imagem e vídeo ao mesmo tempo
    if (imagemUrl && videoUrl) {
      throw new BadRequestException(
        "Envie apenas uma mídia por card: imagem OU vídeo, não ambos.",
      );
    }

    const dadosAtualizacao: Partial<CatMovel> = {};

    if (data.titulo !== undefined) dadosAtualizacao.titulo = data.titulo;
    if (data.descricao !== undefined) dadosAtualizacao.descricao = data.descricao;

    if (imagemUrl) {
      dadosAtualizacao.imagemUrl = imagemUrl;
      dadosAtualizacao.videoUrl = null; // Remove vídeo anterior ao trocar para imagem
      this.removerArquivo(existente.videoUrl);
      this.removerArquivo(existente.imagemUrl);
    }

    if (videoUrl) {
      dadosAtualizacao.videoUrl = videoUrl;
      dadosAtualizacao.imagemUrl = null; // Remove imagem anterior ao trocar para vídeo
      this.removerArquivo(existente.imagemUrl);
      this.removerArquivo(existente.videoUrl);
    }

    return this.repo.update(id, dadosAtualizacao);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado): Promise<void> {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem apagar cards do CAT Móvel.",
      );
    }

    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException("Card do CAT Móvel não encontrado.");

    await this.repo.delete(id);

    // Remove os arquivos físicos do disco
    this.removerArquivo(existente.imagemUrl);
    this.removerArquivo(existente.videoUrl);
  }

  // Helper para remover arquivo físico do disco com segurança
  private removerArquivo(url?: string | null): void {
    if (!url) return;
    const filePath = path.join(".", url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
