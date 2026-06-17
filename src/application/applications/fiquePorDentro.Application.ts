import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { FiquePorDentroRepository } from "../../data/repositories/fiquePorDentro.repository";
import { FiquePorDentro } from "../../data/entities/fiquePorDentro.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";
import * as fs from "fs";
import * as path from "path";

// Ordens válidas — nomes literais "1" a "5"
const ORDENS_VALIDAS = ["1", "2", "3", "4", "5"];
const MAX_IMAGENS = 5;

@Injectable()
export class FiquePorDentroApplication {
  constructor(private readonly repo: FiquePorDentroRepository) {}

  // ─── CREATE: adiciona UMA imagem na posição informada ───────────────────────
  async create(
    ordem: string,
    imagemUrl: string,
    usuarioLogado: IUsuarioLogado,
  ): Promise<FiquePorDentro> {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem adicionar imagens ao Fique Por Dentro.",
      );
    }

    if (!ORDENS_VALIDAS.includes(ordem)) {
      throw new BadRequestException(
        `A ordem deve ser um dos valores: ${ORDENS_VALIDAS.join(", ")}.`,
      );
    }

    const total = await this.repo.findAll();
    if (total.length >= MAX_IMAGENS) {
      throw new ConflictException(
        `O limite de ${MAX_IMAGENS} imagens já foi atingido. Delete uma antes de adicionar outra.`,
      );
    }

    // Não permite duas imagens com a mesma ordem
    const existente = await this.repo.findByOrdem(ordem);
    if (existente) {
      throw new ConflictException(
        `Já existe uma imagem na posição "${ordem}". Delete-a antes de substituir.`,
      );
    }

    return this.repo.save(new FiquePorDentro({ ordem, imagemUrl }));
  }

  // ─── READ ALL: lista ordenada ────────────────────────────────────────────────
  async findAll(): Promise<FiquePorDentro[]> {
    return this.repo.findAll();
  }

  // ─── UPDATE: atualiza ordem e/ou imagem de um item existente ────────────────
  async update(
    id: string,
    novaOrdem: string | undefined,
    novaImagemUrl: string | undefined,
    usuarioLogado: IUsuarioLogado,
  ): Promise<FiquePorDentro> {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem editar imagens do Fique Por Dentro.",
      );
    }

    const existente = await this.repo.findById(id);
    if (!existente) {
      throw new NotFoundException(`Imagem com ID "${id}" não encontrada.`);
    }

    // Valida nova ordem, se fornecida
    if (novaOrdem !== undefined) {
      if (!ORDENS_VALIDAS.includes(novaOrdem)) {
        throw new BadRequestException(
          `A ordem deve ser um dos valores: ${ORDENS_VALIDAS.join(", ")}.`,
        );
      }

      // Verifica conflito de ordem (ignorando o próprio item)
      if (novaOrdem !== existente.ordem) {
        const conflito = await this.repo.findByOrdem(novaOrdem);
        if (conflito && conflito.id !== id) {
          throw new ConflictException(
            `Já existe uma imagem na posição "${novaOrdem}". Delete-a antes de ocupar essa posição.`,
          );
        }
      }
    }

    // Se chegou nova imagem, remove a antiga do disco
    if (novaImagemUrl) {
      this.removerArquivo(existente.imagemUrl);
    }

    const atualizado = await this.repo.update(id, {
      ordem: novaOrdem ?? existente.ordem,
      imagemUrl: novaImagemUrl ?? existente.imagemUrl,
    });

    return atualizado;
  }

  // ─── DELETE: remove UMA imagem pelo ID ──────────────────────────────────────
  async delete(id: string, usuarioLogado: IUsuarioLogado): Promise<void> {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem remover imagens do Fique Por Dentro.",
      );
    }

    const existente = await this.repo.findById(id);
    if (!existente) {
      throw new NotFoundException(`Imagem com ID "${id}" não encontrada.`);
    }

    // Remove o arquivo físico do disco
    this.removerArquivo(existente.imagemUrl);

    await this.repo.delete(id);
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
