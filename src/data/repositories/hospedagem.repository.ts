import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IHospedagemRepository } from "../interfaces/iHospedagem.Interface";
import { Hospedagem } from "../entities/hospedagem.Entity";
import { StatusEstabelecimento } from "@prisma/client";

@Injectable()
export class HospedagemRepository implements IHospedagemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(hospedagem: Hospedagem): Promise<Hospedagem> {
    const criada = await this.prisma.hospedagem.create({
      data: {
        nome: hospedagem.nome,
        telefone: hospedagem.telefone,
        tags: hospedagem.tags,
        instagram: hospedagem.instagram,
        site: hospedagem.site,
        endereco: hospedagem.endereco,
        textoDiferencial: hospedagem.textoDiferencial,
        cnpj: hospedagem.cnpj,
        responsavelNome: hospedagem.responsavelNome,
        responsavelCpf: hospedagem.responsavelCpf,
        documentoPdfUrl: hospedagem.documentoPdfUrl,
        logoUrl: hospedagem.logoUrl,
        usuarioId: hospedagem.usuarioId,
      },
    });
    return new Hospedagem(criada);
  }

  async findAll(): Promise<Hospedagem[]> {
    const lista = await this.prisma.hospedagem.findMany();
    return lista.map((h) => new Hospedagem(h));
  }

  async findById(id: string): Promise<Hospedagem | null> {
    const h = await this.prisma.hospedagem.findUnique({ where: { id } });
    if (!h) return null;
    return new Hospedagem(h);
  }

  async update(id: string, data: Partial<Hospedagem>): Promise<Hospedagem> {
    const atualizada = await this.prisma.hospedagem.update({
      where: { id },
      data,
    });
    return new Hospedagem(atualizada);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.hospedagem.delete({ where: { id } });
  }
}
