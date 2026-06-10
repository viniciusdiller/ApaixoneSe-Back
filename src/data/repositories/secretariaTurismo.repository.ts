import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { ISecretariaTurismoRepository } from "../interfaces/iSecretariaTurismo.Interface";
import { SecretariaTurismo } from "../entities/secretariaTurismo.Entity";
import { SecretariaTurismoTuristando } from "../entities/secretariaTurismoTuristando.Entity";
import { SecretariaTurismoProjeto } from "../entities/secretariaTurismoProjeto.Entity";

@Injectable()
export class SecretariaTurismoRepository implements ISecretariaTurismoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: SecretariaTurismo): Promise<SecretariaTurismo> {
    const criado = await this.prisma.secretariaTurismo.create({
      data: {
        textoExplicativo: data.textoExplicativo,
        videoUrl: data.videoUrl,
      },
      include: { turistandos: true, projetos: true },
    });
    return new SecretariaTurismo(criado);
  }

  async findAll(): Promise<SecretariaTurismo[]> {
    const lista = await this.prisma.secretariaTurismo.findMany({
      include: { turistandos: true, projetos: true },
      orderBy: { createdAt: "desc" },
    });
    return lista.map((s) => new SecretariaTurismo(s));
  }

  async findById(id: string): Promise<SecretariaTurismo | null> {
    const s = await this.prisma.secretariaTurismo.findUnique({
      where: { id },
      include: { turistandos: true, projetos: true },
    });
    if (!s) return null;
    return new SecretariaTurismo(s);
  }

  async update(id: string, data: Partial<SecretariaTurismo>): Promise<SecretariaTurismo> {
    const atualizado = await this.prisma.secretariaTurismo.update({
      where: { id },
      data: {
        textoExplicativo: data.textoExplicativo,
        videoUrl: data.videoUrl,
      },
      include: { turistandos: true, projetos: true },
    });
    return new SecretariaTurismo(atualizado);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.secretariaTurismo.delete({ where: { id } });
  }

  // ================= TURISTANDO =================

  async saveTuristando(data: SecretariaTurismoTuristando): Promise<SecretariaTurismoTuristando> {
    const t = await this.prisma.secretariaTurismoTuristando.create({ data });
    return new SecretariaTurismoTuristando(t);
  }

  async findTuristandoById(id: string): Promise<SecretariaTurismoTuristando | null> {
    const t = await this.prisma.secretariaTurismoTuristando.findUnique({ where: { id } });
    if (!t) return null;
    return new SecretariaTurismoTuristando(t);
  }

  async updateTuristando(
    id: string,
    data: Partial<SecretariaTurismoTuristando>,
  ): Promise<SecretariaTurismoTuristando> {
    const t = await this.prisma.secretariaTurismoTuristando.update({
      where: { id },
      data: {
        titulo: data.titulo,
        texto: data.texto,
        imagensUrl: data.imagensUrl,
      },
    });
    return new SecretariaTurismoTuristando(t);
  }

  async deleteTuristando(id: string): Promise<void> {
    await this.prisma.secretariaTurismoTuristando.delete({ where: { id } });
  }

  async deleteManyTuristandos(ids: string[]): Promise<void> {
    await this.prisma.secretariaTurismoTuristando.deleteMany({
      where: { id: { in: ids } },
    });
  }

  // ================= PROJETOS =================

  async saveProjeto(data: SecretariaTurismoProjeto): Promise<SecretariaTurismoProjeto> {
    const p = await this.prisma.secretariaTurismoProjeto.create({ data });
    return new SecretariaTurismoProjeto(p);
  }

  async findProjetoById(id: string): Promise<SecretariaTurismoProjeto | null> {
    const p = await this.prisma.secretariaTurismoProjeto.findUnique({ where: { id } });
    if (!p) return null;
    return new SecretariaTurismoProjeto(p);
  }

  async updateProjeto(
    id: string,
    data: Partial<SecretariaTurismoProjeto>,
  ): Promise<SecretariaTurismoProjeto> {
    const p = await this.prisma.secretariaTurismoProjeto.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        imagemUrl: data.imagemUrl,
      },
    });
    return new SecretariaTurismoProjeto(p);
  }

  async deleteProjeto(id: string): Promise<void> {
    await this.prisma.secretariaTurismoProjeto.delete({ where: { id } });
  }

  async deleteManyProjetos(ids: string[]): Promise<void> {
    await this.prisma.secretariaTurismoProjeto.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
