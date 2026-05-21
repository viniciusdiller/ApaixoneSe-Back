import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IItemPlanoViagemRepository } from "../interfaces/iItemPlanoViagem.Interface";
import { ItemPlanoViagem } from "../entities/itemPlanoViagem.Entity";

@Injectable()
export class ItemPlanoViagemRepository implements IItemPlanoViagemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(item: ItemPlanoViagem): Promise<ItemPlanoViagem> {
    const dadosPrisma: any = { ...item };
    if (item.dataHoraAgendada)
      dadosPrisma.dataHoraAgendada = new Date(item.dataHoraAgendada);

    const criado = await this.prisma.itemPlanoViagem.create({
      data: dadosPrisma,
    });
    return new ItemPlanoViagem(criado);
  }

  async findById(id: string): Promise<any> {
    const item = await this.prisma.itemPlanoViagem.findUnique({
      where: { id },
      include: {
        gastronomia: true,
        hospedagem: true,
        evento: true,
        atividade: true,
        servicoTurista: true,
        planoViagem: true,
      },
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
