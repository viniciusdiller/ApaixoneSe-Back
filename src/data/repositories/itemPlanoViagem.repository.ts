import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IItemPlanoViagemRepository } from "../interfaces/iItemPlanoViagem.Interface";
import { ItemPlanoViagem } from "../entities/itemPlanoViagem.Entity";

const itemPlanoInclude = {
  gastronomia: { select: { id: true, nome: true, endereco: true, logoUrl: true } },
  hospedagem: { select: { id: true, nome: true, endereco: true, logoUrl: true } },
  evento: { select: { id: true, titulo: true, data: true, local: true } },
  atividade: { select: { id: true, titulo: true, local: true, roteiro: true } },
  servicoTurista: { select: { id: true, nome: true, tipo: true, logoUrl: true } },
  planoViagem: { select: { id: true, titulo: true } },
} as const;

@Injectable()
export class ItemPlanoViagemRepository implements IItemPlanoViagemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(item: ItemPlanoViagem): Promise<any> {
    const dadosPrisma: any = { ...item };
    if (item.dataHoraAgendada)
      dadosPrisma.dataHoraAgendada = new Date(item.dataHoraAgendada);

    const criado = await this.prisma.itemPlanoViagem.create({
      data: dadosPrisma,
      include: itemPlanoInclude,
    });
    return criado;
  }

  async findById(id: string): Promise<any> {
    const item = await this.prisma.itemPlanoViagem.findUnique({
      where: { id },
      include: itemPlanoInclude,
    });
    return item;
  }

  async update(
    id: string,
    data: Partial<ItemPlanoViagem>,
  ): Promise<ItemPlanoViagem> {
    const dadosPrisma: any = { ...data };
    if (data.dataHoraAgendada)
      dadosPrisma.dataHoraAgendada = new Date(data.dataHoraAgendada);

    const atualizado = await this.prisma.itemPlanoViagem.update({
      where: { id },
      data: dadosPrisma,
    });
    return new ItemPlanoViagem(atualizado);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.itemPlanoViagem.delete({ where: { id } });
  }
}
