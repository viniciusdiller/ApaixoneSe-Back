import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { EventoPrincipalRepository } from "../../data/repositories/eventoPrincipal.repository";
import { EventoPrincipal } from "../../data/entities/eventoPrincipal.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class EventoPrincipalApplication {
  constructor(private readonly repo: EventoPrincipalRepository) {}

  async create(data: any, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas o Administrador pode criar o Evento Principal.",
      );
    const novo = new EventoPrincipal(data);
    return this.repo.save(novo);
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const e = await this.repo.findById(id);
    if (!e) throw new NotFoundException("Evento Principal não encontrado.");
    return e;
  }

  async update(id: string, data: any, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas o Administrador pode editar o Evento Principal.",
      );
    await this.findById(id); // Valida se existe
    return this.repo.update(id, data);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas o Administrador pode apagar o Evento Principal.",
      );
    await this.findById(id);
    await this.repo.delete(id);
  }
}
