import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PlanoViagemRepository } from "../../data/repositories/planoViagem.repository";
import { PlanoViagem } from "../../data/entities/planoViagem.Entity";
import {
  validarApenasUmVinculo,
  validarDentroDoPeriodo,
  validarAnoRazoavel,
  ehViolacaoDeFk,
} from "../helpers/itemPlanoViagem.validators";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class PlanoViagemApplication {
  constructor(private readonly repo: PlanoViagemRepository) {}

  async create(data: any, usuarioId: string) {
    validarAnoRazoavel(
      data.dataInicio,
      data.dataFim,
      ...(data.itens ?? []).map((i: any) => i.dataHoraAgendada),
    );
    if (new Date(data.dataFim) < new Date(data.dataInicio)) {
      throw new BadRequestException(
        "A data de fim não pode ser anterior à data de início.",
      );
    }

    for (const item of data.itens ?? []) {
      validarApenasUmVinculo(item);
      validarDentroDoPeriodo(
        item.dataHoraAgendada,
        data.dataInicio,
        data.dataFim,
      );
    }

    // usuarioId vem sempre do JWT, nunca do body
    const novo = new PlanoViagem({ ...data, usuarioId });
    try {
      return await this.repo.save(novo);
    } catch (e) {
      if (ehViolacaoDeFk(e)) throw new BadRequestException("Item inválido.");
      throw e;
    }
  }

  // Listagem Privada: Retorna apenas os roteiros do utilizador que fez o pedido
  async findMeusPlanos(usuarioId: string) {
    return this.repo.findByUsuarioId(usuarioId);
  }

  async findById(id: string, usuarioLogado: IUsuarioLogado) {
    const plano = await this.repo.findById(id);
    if (!plano) throw new NotFoundException("Roteiro não encontrado.");

    // Regra de Privacidade Estrita (Admin pode ver, ou apenas o dono)
    if (
      usuarioLogado.perfil !== "ADMIN" &&
      plano.usuarioId !== usuarioLogado.id
    ) {
      throw new ForbiddenException(
        "Você não tem permissão para aceder a este roteiro.",
      );
    }
    return plano;
  }

  async update(id: string, data: any, usuarioLogado: IUsuarioLogado) {
    validarAnoRazoavel(data.dataInicio, data.dataFim);
    const existente = await this.findById(id, usuarioLogado); // Reaproveita a verificação de segurança acima!
    return this.repo.update(existente.id!, data);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado) {
    const existente = await this.findById(id, usuarioLogado); // Reaproveita a verificação de segurança!
    await this.repo.delete(existente.id!);
  }
}
