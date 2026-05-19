import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IPlanoViagemRepository } from "../interfaces/iPlanoViagem.Interface";
import { PlanoViagem } from "../entities/planoViagem.Entity";

@Injectable()
export class PlanoViagemRepository implements IPlanoViagemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(plano: PlanoViagem): Promise<PlanoViagem> {
    const criado = await this.prisma.planoViagem.create({
      data: {
        titulo: plano.titulo,
        dataInicio: new Date(plano.dataInicio),
        dataFim: new Date(plano.dataFim),
        usuarioId: plano.usuarioId,
      },
    });
    return new PlanoViagem(criado);
  }

  // Traz apenas os roteiros do utilizador logado!
  async findByUsuarioId(usuarioId: string): Promise<PlanoViagem[]> {
    const lista = await this.prisma.planoViagem.findMany({
      where: { usuarioId },
      orderBy: { dataInicio: "asc" }, // Ordena da viagem mais próxima para a mais distante
    });
    return lista.map((p) => new PlanoViagem(p));
  }

  async findById(id: string): Promise<PlanoViagem | null> {
    const p = await this.prisma.planoViagem.findUnique({
      where: { id },
      include: {
        // Quando criarmos a Parte 2, os itens vão aparecer aqui dentro magicamente
        itens: true,
      },
    });
    if (!p) return null;
    return new PlanoViagem(p);
  }

  async update(id: string, data: Partial<PlanoViagem>): Promise<PlanoViagem> {
    const dadosPrisma: any = { ...data };
    if (data.dataInicio) dadosPrisma.dataInicio = new Date(data.dataInicio);
    if (data.dataFim) dadosPrisma.dataFim = new Date(data.dataFim);

    const atualizado = await this.prisma.planoViagem.update({
      where: { id },
      data: dadosPrisma,
    });
    return new PlanoViagem(atualizado);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.planoViagem.delete({ where: { id } });
  }
}
