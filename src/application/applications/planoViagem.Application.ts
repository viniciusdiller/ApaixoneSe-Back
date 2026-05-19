import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PlanoViagemRepository } from "../../data/repositories/planoViagem.repository";
import { PlanoViagem } from "../../data/entities/planoViagem.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class PlanoViagemApplication {
  constructor(private readonly repo: PlanoViagemRepository) {}

  async create(data: any, usuarioId: string) {
    const novo = new PlanoViagem({ ...data, usuarioId });
    return this.repo.save(novo);
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
    const existente = await this.findById(id, usuarioLogado); // Reaproveita a verificação de segurança acima!
    return this.repo.update(existente.id!, data);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado) {
    const existente = await this.findById(id, usuarioLogado); // Reaproveita a verificação de segurança!
    await this.repo.delete(existente.id!);
  }
}
