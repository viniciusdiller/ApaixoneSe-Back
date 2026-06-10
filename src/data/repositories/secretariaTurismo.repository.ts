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

  async update(
    id: string,
    data: Partial<SecretariaTurismo>,
  ): Promise<SecretariaTurismo> {
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

  // ================= TURISTANDO SUB-METHODS =================
  async saveTuristando(
    data: SecretariaTurismoTuristando,
  ): Promise<SecretariaTurismoTuristando> {
    const t = await this.prisma.secretariaTurismoTuristando.create({ data });
    return new SecretariaTurismoTuristando(t);
  }

  async deleteTuristando(id: string): Promise<void> {
    await this.prisma.secretariaTurismoTuristando.delete({ where: { id } });
  }

  // ================= PROJETOS SUB-METHODS =================
  async saveProjeto(
    data: SecretariaTurismoProjeto,
  ): Promise<SecretariaTurismoProjeto> {
    const p = await this.prisma.secretariaTurismoProjeto.create({ data });
    return new SecretariaTurismoProjeto(p);
  }

  async deleteProjeto(id: string): Promise<void> {
    await this.prisma.secretariaTurismoProjeto.delete({ where: { id } });
  }
}
