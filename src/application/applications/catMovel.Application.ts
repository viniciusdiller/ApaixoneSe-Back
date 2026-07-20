import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { CatMovelRepository } from "../../data/repositories/catMovel.repository";
import { CatMovel } from "../../data/entities/catMovel.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class CatMovelApplication {
  constructor(private readonly repo: CatMovelRepository) {}

  // ─── CREATE (apenas se ainda não existir nenhum registro) ───────────────────
  async create(
    data: any,
    usuarioLogado: IUsuarioLogado,
    imagemUrl?: string,
    videoUrl?: string,
    imagensUrl?: string[],
  ): Promise<CatMovel> {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem configurar o CAT Móvel.",
      );
    }

    const existente = await this.repo.findFirst();
    if (existente) {
      throw new ConflictException(
        "O CAT Móvel já foi configurado. Use PUT para atualizar as informações.",
      );
    }

    if (!imagemUrl && !videoUrl) {
      throw new BadRequestException(
        "É obrigatório enviar uma imagem ou um vídeo para o CAT Móvel.",
      );
    }

    if (imagemUrl && videoUrl) {
      throw new BadRequestException(
        "Envie apenas uma mídia: imagem OU vídeo, não ambos.",
      );
    }

    return this.repo.save(
      new CatMovel({
        titulo: data.titulo,
        descricao: data.descricao,
        imagemUrl: imagemUrl ?? null,
        videoUrl: videoUrl ?? null,
        imagensUrl: imagensUrl && imagensUrl.length > 0 ? imagensUrl : undefined,
      }),
    );
  }

  // ─── GET (retorna o único registro) ─────────────────────────────────────────
  async findOne(): Promise<CatMovel> {
    const c = await this.repo.findFirst();
    if (!c) {
      throw new NotFoundException(
        "O CAT Móvel ainda não foi configurado.",
      );
    }
    return c;
  }

  // ─── UPDATE (atualiza o único registro — ADMIN) ──────────────────────────────
  async update(
    data: any,
    usuarioLogado: IUsuarioLogado,
    imagemUrl?: string,
    videoUrl?: string,
    novasImagensUrl?: string[],
    ordem?: string[],
  ): Promise<CatMovel> {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem alterar o CAT Móvel.",
      );
    }

    const existente = await this.repo.findFirst();
    if (!existente) {
      throw new NotFoundException(
        "O CAT Móvel ainda não foi configurado. Use POST primeiro.",
      );
    }

    if (imagemUrl && videoUrl) {
      throw new BadRequestException(
        "Envie apenas uma mídia: imagem OU vídeo, não ambos.",
      );
    }

    const dadosAtualizacao: Partial<CatMovel> = {};

    if (data.titulo !== undefined) dadosAtualizacao.titulo = data.titulo;
    if (data.descricao !== undefined) dadosAtualizacao.descricao = data.descricao;

    if (imagemUrl) {
      // Troca para imagem: remove mídia anterior do disco e zera videoUrl
      this.removerArquivo(existente.imagemUrl);
      this.removerArquivo(existente.videoUrl);
      dadosAtualizacao.imagemUrl = imagemUrl;
      dadosAtualizacao.videoUrl = null;
    }

    if (videoUrl) {
      // Troca para vídeo: remove mídia anterior do disco e zera imagemUrl
      this.removerArquivo(existente.imagemUrl);
      this.removerArquivo(existente.videoUrl);
      dadosAtualizacao.videoUrl = videoUrl;
      dadosAtualizacao.imagemUrl = null;
    }

    if (ordem && ordem.length > 0) {
      // Reconstrói a galeria combinando existentes mantidas (na nova ordem) + novas enviadas
      let proximoIndice = 0;
      const urlsFinais = ordem
        .map((item) => (item === "__new__" ? novasImagensUrl?.[proximoIndice++] : item))
        .filter((url): url is string => !!url);

      const antigas: string[] = Array.isArray(existente.imagensUrl)
        ? existente.imagensUrl
        : [];
      antigas
        .filter((url) => !urlsFinais.includes(url))
        .forEach((url) => this.removerArquivo(url));

      dadosAtualizacao.imagensUrl = urlsFinais;
    } else if (novasImagensUrl && novasImagensUrl.length > 0) {
      // Sem informação de ordem (cliente antigo): mantém o comportamento anterior
      const antigas: string[] = Array.isArray(existente.imagensUrl)
        ? existente.imagensUrl
        : [];
      antigas.forEach((url) => this.removerArquivo(url));
      dadosAtualizacao.imagensUrl = novasImagensUrl;
    }

    return this.repo.update(existente.id!, dadosAtualizacao);
  }

  // ─── Helper: remove arquivo físico do disco com segurança ───────────────────
  private removerArquivo(url?: string | null): void {
    if (!url) return;
    const filePath = path.join(".", url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
