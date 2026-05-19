import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IServicoTuristaRepository } from "../interfaces/iServicoTurista.Interface";
import { ServicoTurista } from "../entities/servicoTurista.Entity";

@Injectable()
export class ServicoTuristaRepository implements IServicoTuristaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(servico: ServicoTurista): Promise<ServicoTurista> {
    const criado = await this.prisma.servicoTurista.create({
      data: servico as any,
    });
    return new ServicoTurista(criado);
  }

  async findAll(): Promise<ServicoTurista[]> {
    const lista = await this.prisma.servicoTurista.findMany();
    return lista.map((s) => new ServicoTurista(s));
  }

  async findById(id: string): Promise<ServicoTurista | null> {
    const s = await this.prisma.servicoTurista.findUnique({ where: { id } });
    if (!s) return null;
    return new ServicoTurista(s);
  }

  async update(
    id: string,
    data: Partial<ServicoTurista>,
  ): Promise<ServicoTurista> {
    const atualizado = await this.prisma.servicoTurista.update({
      where: { id },
      data,
    });
    return new ServicoTurista(atualizado);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.servicoTurista.delete({ where: { id } });
  }
}
