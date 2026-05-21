import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { ItemPlanoViagemRepository } from "../../data/repositories/itemPlanoViagem.repository";
import { PlanoViagemRepository } from "../../data/repositories/planoViagem.repository";
import { ItemPlanoViagem } from "../../data/entities/itemPlanoViagem.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class ItemPlanoViagemApplication {
  constructor(
    private readonly repo: ItemPlanoViagemRepository,
    private readonly planoRepo: PlanoViagemRepository,
  ) {}

  private validarApenasUmVinculo(data: any) {
    const idsPreenchidos = [
      data.gastronomiaId,
      data.hospedagemId,
      data.eventoId,
      data.atividadeId,
      data.servicoTuristaId,
    ].filter((id) => id != null && id !== "");

    if (idsPreenchidos.length !== 1) {
      throw new BadRequestException(
        "Um item do roteiro deve estar associado a EXATAMENTE UM local (Hospedagem, Gastronomia, Evento, Atividade ou Serviço).",
      );
    }
  }

  async create(data: any, usuarioLogado: IUsuarioLogado) {
    const plano = await this.planoRepo.findById(data.planoViagemId);
    if (!plano) throw new NotFoundException("Plano de viagem não encontrado.");

    if (
      usuarioLogado.perfil !== "ADMIN" &&
      plano.usuarioId !== usuarioLogado.id
    ) {
      throw new ForbiddenException(
        "Você não pode adicionar atividades a um roteiro que não é seu.",
      );
    }

    this.validarApenasUmVinculo(data);

    const novo = new ItemPlanoViagem(data);
    return this.repo.save(novo);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado) {
    const item = await this.repo.findById(id);
    if (!item)
      throw new NotFoundException("Atividade do roteiro não encontrada.");

    if (
      usuarioLogado.perfil !== "ADMIN" &&
      item.planoViagem.usuarioId !== usuarioLogado.id
    ) {
      throw new ForbiddenException(
        "Você não pode apagar uma atividade de um roteiro que não é seu.",
      );
    }

    await this.repo.delete(id);
  }
}
