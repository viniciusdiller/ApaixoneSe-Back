import { Injectable, NotFoundException } from "@nestjs/common";
import { GastronomiaRepository } from "../../data/repositories/gastronomia.repository";
import { Gastronomia } from "../../data/entities/gastronomia.Entity";
import { StatusEstabelecimento } from "@prisma/client"; // Importamos o Enum do Prisma
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class GastronomiaApplication {
  constructor(private readonly repo: GastronomiaRepository) {}

  async create(data: any, logoUrl: string, pdfUrl: string) {
    const nova = new Gastronomia({ ...data, logoUrl, documentoPdfUrl: pdfUrl });
    return this.repo.save(nova);
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const g = await this.repo.findById(id);
    if (!g) throw new NotFoundException("Estabelecimento não encontrado.");
    return g;
  }

  async update(id: string, data: any, logoUrl?: string, pdfUrl?: string) {
    const existente = await this.findById(id);

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

    // ============================================================
    // SE NÃO FOI REJEITADO, CONTINUA COM A ATUALIZAÇÃO NORMAL
    // ============================================================
    const dadosAtualizacao: Partial<Gastronomia> = { ...data };
    if (logoUrl) dadosAtualizacao.logoUrl = logoUrl;
    if (pdfUrl) dadosAtualizacao.documentoPdfUrl = pdfUrl;

    return this.repo.update(id, dadosAtualizacao);
  }

  async delete(id: string) {
    const existente = await this.findById(id);

    await this.repo.delete(id);
    if (existente.logoUrl) {
      const pastaFisica = path.join(".", path.dirname(existente.logoUrl));
      if (fs.existsSync(pastaFisica)) {
        fs.rmSync(pastaFisica, { recursive: true, force: true });
      }
    }
  }
}
