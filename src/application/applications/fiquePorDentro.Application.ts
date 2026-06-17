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

const ORDENS_VALIDAS = ["1", "2", "3", "4", "5"];
const MAX_IMAGENS = 5;

@Injectable()
export class FiquePorDentroApplication {
  constructor(private readonly repo: FiquePorDentroRepository) {}

  // ─── CREATE ──────────────────────────────────────────────────────────────────
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
    const existente = await this.repo.findByOrdem(ordem);
    if (existente) {
      throw new ConflictException(
        `Já existe uma imagem na posição "${ordem}". Delete-a antes de substituir.`,
      );
    }
    return this.repo.save(new FiquePorDentro({ ordem, imagemUrl }));
  }

  // ─── READ ALL ─────────────────────────────────────────────────────────────────
  async findAll(): Promise<FiquePorDentro[]> {
    return this.repo.findAll();
  }

  // ─── UPDATE (apenas imagem, sem trocar ordem) ─────────────────────────────────
  async update(
    id: string,
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
    if (!novaImagemUrl) {
      // nada a alterar
      return existente;
    }
    // remove arquivo antigo
    this.removerArquivo(existente.imagemUrl);
    return this.repo.update(id, { imagemUrl: novaImagemUrl });
  }

  // ─── SWAP: troca as ordens de dois itens atomicamente ────────────────────────
  async swap(
    idA: string,
    idB: string,
    usuarioLogado: IUsuarioLogado,
  ): Promise<{ message: string }> {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem reordenar imagens do Fique Por Dentro.",
      );
    }
    const itemA = await this.repo.findById(idA);
    if (!itemA) throw new NotFoundException(`Imagem com ID "${idA}" não encontrada.`);

    const itemB = await this.repo.findById(idB);
    if (!itemB) throw new NotFoundException(`Imagem com ID "${idB}" não encontrada.`);

    await this.repo.swapOrdens(idA, itemA.ordem, idB, itemB.ordem);

    return { message: `Posições ${itemA.ordem} e ${itemB.ordem} trocadas com sucesso.` };
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────────
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
    this.removerArquivo(existente.imagemUrl);
    await this.repo.delete(id);
  }

  private removerArquivo(url?: string | null): void {
    if (!url) return;
    const filePath = path.join(".", url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
