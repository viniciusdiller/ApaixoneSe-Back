import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { SecretariaTurismoRepository } from "../../data/repositories/secretariaTurismo.repository";
import { SecretariaTurismo } from "../../data/entities/secretariaTurismo.Entity";
import { SecretariaTurismoTuristando } from "../../data/entities/secretariaTurismoTuristando.Entity";
import { SecretariaTurismoProjeto } from "../../data/entities/secretariaTurismoProjeto.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class SecretariaTurismoApplication {
  constructor(private readonly repo: SecretariaTurismoRepository) {}

  private verificarAdmin(usuario: IUsuarioLogado) {
    if (usuario.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem gerenciar a Secretaria de Turismo.",
      );
    }
  }

  async create(data: any, usuario: IUsuarioLogado, videoUrl?: string) {
    this.verificarAdmin(usuario);
    const nova = new SecretariaTurismo({ ...data, videoUrl });
    return this.repo.save(nova);
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const s = await this.repo.findById(id);
    if (!s)
      throw new NotFoundException("Secretaria de Turismo não encontrada.");
    return s;
  }

  async update(
    id: string,
    data: any,
    usuario: IUsuarioLogado,
    videoUrl?: string,
  ) {
    this.verificarAdmin(usuario);
    const existente = await this.findById(id);
    if (videoUrl) data.videoUrl = videoUrl;
    return this.repo.update(id, data);
  }

  async delete(id: string, usuario: IUsuarioLogado) {
    this.verificarAdmin(usuario);
    await this.findById(id);
    await this.repo.delete(id);
  }

  // ================= SUB-RESOURCES MANAGEMENT =================

  async addTuristando(
    secretariaId: String | any,
    data: any,
    usuario: IUsuarioLogado,
    imagensUrl: string[],
  ) {
    this.verificarAdmin(usuario);
    await this.findById(secretariaId);
    const novo = new SecretariaTurismoTuristando({
      ...data,
      secretariaTurismoId: secretariaId,
      imagensUrl,
    });
    return this.repo.saveTuristando(novo);
  }

  async addProjeto(
    secretariaId: String | any,
    data: any,
    usuario: IUsuarioLogado,
    imagemUrl?: string,
  ) {
    this.verificarAdmin(usuario);
    await this.findById(secretariaId);
    const novo = new SecretariaTurismoProjeto({
      ...data,
      secretariaTurismoId: secretariaId,
      imagemUrl,
    });
    return this.repo.saveProjeto(novo);
  }
}
