import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { CasaDeCambioRepository } from "../../data/repositories/casaDeCambio.repository";
import { CasaDeCambio } from "../../data/entities/casaDeCambio.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class CasaDeCambioApplication {
  constructor(private readonly repo: CasaDeCambioRepository) {}

  async create(data: any, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem criar Casas de Câmbio.",
      );
    }

    const novaCasa = new CasaDeCambio(data);
    return this.repo.save(novaCasa);
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException("Casa de Câmbio não encontrada.");
    return c;
  }

  async update(id: string, data: any, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem alterar Casas de Câmbio.",
      );
    }

    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException("Casa de Câmbio não encontrada.");

    return this.repo.update(id, data);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem apagar Casas de Câmbio.",
      );
    }

    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException("Casa de Câmbio não encontrada.");

    await this.repo.delete(id);
  }
}
