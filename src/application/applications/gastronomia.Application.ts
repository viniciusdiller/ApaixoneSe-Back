import { Injectable, NotFoundException } from "@nestjs/common";
import { GastronomiaRepository } from "../../data/repositories/gastronomia.repository";
import { Gastronomia } from "../../data/entities/gastronomia.Entity";
import { GastronomiaResponseDto } from "../../presentation/dto/response/gastronomiaResponse.dto";
import { StatusEstabelecimento } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class GastronomiaApplication {
  constructor(private readonly repo: GastronomiaRepository) {}

  async create(data: any, logoUrl: string, pdfUrl: string) {
    const nova = new Gastronomia({ ...data, logoUrl, documentoPdfUrl: pdfUrl });
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

  async update(id: string, data: any, logoUrl?: string, pdfUrl?: string) {
    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException("Estabelecimento não encontrado.");

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

    const dadosAtualizacao: Partial<Gastronomia> = { ...data };
    if (logoUrl) dadosAtualizacao.logoUrl = logoUrl;
    if (pdfUrl) dadosAtualizacao.documentoPdfUrl = pdfUrl;

    const atualizado = await this.repo.update(id, dadosAtualizacao);

    return this.mapToResponseDto(atualizado);
  }

  async delete(id: string): Promise<void> {
    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException("Estabelecimento não encontrado.");

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
