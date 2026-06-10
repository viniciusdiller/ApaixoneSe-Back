import { Injectable, NotFoundException } from "@nestjs/common";
import { VisitaRepository } from "../../data/repositories/visita.repository";
import { GastronomiaRepository } from "../../data/repositories/gastronomia.repository";
import { AtividadeRepository } from "../../data/repositories/atividade.repository";
import { Visita } from "../../data/entities/visita.Entity";

@Injectable()
export class VisitaApplication {
  constructor(
    private readonly visitaRepo: VisitaRepository,
    private readonly gastronomiaRepo: GastronomiaRepository,
    private readonly atividadeRepo: AtividadeRepository,
  ) {}

  // Lógica para marcar/desmarcar restaurante
  async toggleGastronomia(usuarioId: string, gastronomiaId: string) {
    const gastronomia = await this.gastronomiaRepo.findById(gastronomiaId);
    if (!gastronomia)
      throw new NotFoundException("Estabelecimento não encontrado.");

    const visitaExistente = await this.visitaRepo.findByUserAndGastronomia(
      usuarioId,
      gastronomiaId,
    );

    if (visitaExistente) {
      await this.visitaRepo.delete(visitaExistente.id!);
      return { message: "Check-in removido com sucesso.", status: "removido" };
    } else {
      const novaVisita = new Visita({ usuarioId, gastronomiaId });
      await this.visitaRepo.save(novaVisita);
      return {
        message: "Check-in realizado com sucesso.",
        status: "adicionado",
      };
    }
  }

  // Lógica para marcar/desmarcar atividade
  async toggleAtividade(usuarioId: string, atividadeId: string) {
    const atividade = await this.atividadeRepo.findById(atividadeId);
    if (!atividade) throw new NotFoundException("Atividade não encontrada.");

    const visitaExistente = await this.visitaRepo.findByUserAndAtividade(
      usuarioId,
      atividadeId,
    );

    if (visitaExistente) {
      await this.visitaRepo.delete(visitaExistente.id!);
      return { message: "Check-in removido com sucesso.", status: "removido" };
    } else {
      const novaVisita = new Visita({ usuarioId, atividadeId });
      await this.visitaRepo.save(novaVisita);
      return {
        message: "Check-in realizado com sucesso.",
        status: "adicionado",
      };
    }
  }

  // Método que o Frontend vai amar: Devolve apenas as listas de IDs visitados!
  async getMinhasVisitas(usuarioId: string) {
    const visitas = await this.visitaRepo.findByUser(usuarioId);

    // Filtramos e mapeamos para devolver apenas os IDs puros
    const gastronomiasVisitadas = visitas
      .filter((v) => v.gastronomiaId !== null && v.gastronomiaId !== undefined)
      .map((v) => v.gastronomiaId);

    const atividadesVisitadas = visitas
      .filter((v) => v.atividadeId !== null && v.atividadeId !== undefined)
      .map((v) => v.atividadeId);

    return {
      gastronomias: gastronomiasVisitadas,
      atividades: atividadesVisitadas,
    };
  }
}
