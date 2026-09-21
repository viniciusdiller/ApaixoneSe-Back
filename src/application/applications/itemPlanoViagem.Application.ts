import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { ItemPlanoViagemRepository } from "../../data/repositories/itemPlanoViagem.repository";
import { PlanoViagemRepository } from "../../data/repositories/planoViagem.repository";
import { ItemPlanoViagem } from "../../data/entities/itemPlanoViagem.Entity";
import {
  validarApenasUmVinculo,
  validarDentroDoPeriodo,
  validarAnoRazoavel,
  ehViolacaoDeFk,
} from "../helpers/itemPlanoViagem.validators";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class ItemPlanoViagemApplication {
  constructor(
    private readonly repo: ItemPlanoViagemRepository,
    private readonly planoRepo: PlanoViagemRepository,
  ) {}

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

    validarApenasUmVinculo(data);
    validarAnoRazoavel(data.dataHoraAgendada);
    validarDentroDoPeriodo(
      data.dataHoraAgendada,
      plano.dataInicio,
      plano.dataFim,
    );

    const novo = new ItemPlanoViagem(data);
    try {
      return await this.repo.save(novo);
    } catch (e) {
      if (ehViolacaoDeFk(e)) throw new BadRequestException("Item inválido.");
      throw e;
    }
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
