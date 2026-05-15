import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { GastronomiaRepository } from "../../data/repositories/gastronomia.repository";
import { Gastronomia } from "../../data/entities/gastronomia.Entity";
import { GastronomiaResponseDto } from "../../presentation/dto/response/gastronomiaResponse.dto";
import { StatusEstabelecimento, Perfil } from "@prisma/client";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";
import { UserRepository } from "../../data/repositories/user.repository"; // 1. Importar UserRepository
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class GastronomiaApplication {
  constructor(
    private readonly repo: GastronomiaRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async create(
    data: any,
    usuarioId: string,
    logoUrl: string,
    pdfUrl: string,
  ): Promise<GastronomiaResponseDto> {
    const nova = new Gastronomia({
      ...data,
      usuarioId,
      logoUrl,
      documentoPdfUrl: pdfUrl,
    });

    const salva = await this.repo.save(nova);
    return this.mapToResponseDto(salva);
  }

  async findAll() {
    const lista = await this.repo.findAll();

    return lista.map((g) => this.mapToResponseDto(g));
  }

  async findById(id: string) {
    const g = await this.repo.findById(id);
    if (!g) throw new NotFoundException("Estabelecimento não encontrado.");
    return this.mapToResponseDto(g);
  }

  async update(
    id: string,
    data: any,
    usuarioLogado: IUsuarioLogado,
    logoUrl?: string,
    pdfUrl?: string,
  ) {
    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException("Estabelecimento não encontrado.");
    if (
      usuarioLogado.perfil !== "ADMIN" &&
      existente.usuarioId !== usuarioLogado.id
    ) {
      throw new ForbiddenException(
        "Não tem permissão para alterar este estabelecimento.",
      );
    }

    if (data.status === StatusEstabelecimento.REJEITADO) {
      await this.repo.delete(id);
      if (existente.logoUrl) {
        const pastaFisica = path.join(".", path.dirname(existente.logoUrl));
        if (fs.existsSync(pastaFisica)) {
          fs.rmSync(pastaFisica, { recursive: true, force: true });
        }
      }
      return {
        message:
          "Estabelecimento rejeitado. Todos os dados e documentos foram apagados com sucesso.",
      };
    }

    if (data.status && usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem alterar o status de um estabelecimento.",
      );
    }

    if (
      data.status === StatusEstabelecimento.APROVADO &&
      existente.status !== StatusEstabelecimento.APROVADO
    ) {
      const dono = await this.userRepo.findById(existente.usuarioId);

      // Se o dono ainda for um 'USUARIO' comum, ele vira 'PARCEIRO'
      if (dono && dono.perfil === Perfil.USUARIO) {
        await this.userRepo.update(dono.id!, { perfil: Perfil.PARCEIRO });
      }
    }

    const dadosAtualizacao: Partial<Gastronomia> = { ...data };
    if (logoUrl) dadosAtualizacao.logoUrl = logoUrl;
    if (pdfUrl) dadosAtualizacao.documentoPdfUrl = pdfUrl;

    const atualizado = await this.repo.update(id, dadosAtualizacao);

    return this.mapToResponseDto(atualizado);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado): Promise<void> {
    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException("Estabelecimento não encontrado.");
    if (
      usuarioLogado.perfil !== "ADMIN" &&
      existente.usuarioId !== usuarioLogado.id
    ) {
      throw new ForbiddenException(
        "Não tem permissão para apagar este estabelecimento.",
      );
    }

    await this.repo.delete(id);

    if (existente.logoUrl) {
      const pastaFisica = path.join(".", path.dirname(existente.logoUrl));
      if (fs.existsSync(pastaFisica)) {
        fs.rmSync(pastaFisica, { recursive: true, force: true });
      }
    }
  }

  private mapToResponseDto(g: Gastronomia): GastronomiaResponseDto {
    return {
      id: g.id!,
      nome: g.nome,
      telefone: g.telefone,
      instagram: g.instagram,
      endereco: g.endereco,
      especialidade: g.especialidade,
      cnpj: g.cnpj,
      responsavelNome: g.responsavelNome,
      responsavelCpf: g.responsavelCpf,
      documentoPdfUrl: g.documentoPdfUrl,
      logoUrl: g.logoUrl,
      status: g.status,
      usuarioId: g.usuarioId,
      createdAt: g.createdAt!,
      updatedAt: g.updatedAt!,
    };
  }
}
