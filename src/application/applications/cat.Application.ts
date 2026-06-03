import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { CatRepository } from "../../data/repositories/cat.repository";
import { Cat } from "../../data/entities/cat.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class CatApplication {
  constructor(private readonly repo: CatRepository) {}

  async create(data: any, usuarioLogado: IUsuarioLogado, arquivoUrl: string) {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem criar informações do CAT.",
      );
    }

    const catExistente = await this.repo.findAll();
    if (catExistente.length > 0) {
      throw new BadRequestException(
        "Já existe uma informação do CAT cadastrada. Por favor, edite a informação atual em vez de criar uma nova.",
      );
    }
    const novo = new Cat({ ...data, arquivoUrl });
    return this.repo.save(novo);
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException("Informação do CAT não encontrada.");
    return c;
  }

  async update(
    id: string,
    data: any,
    usuarioLogado: IUsuarioLogado,
    arquivoUrl?: string,
  ) {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem alterar informações do CAT.",
      );
    }

    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException("Informação do CAT não encontrada.");

    const dadosAtualizacao: any = { ...data };

    // Proteção contra o erro do Prisma
    delete dadosAtualizacao.arquivo;

    if (arquivoUrl) {
      dadosAtualizacao.arquivoUrl = arquivoUrl;
    }

    return this.repo.update(id, dadosAtualizacao);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem apagar informações do CAT.",
      );
    }

    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException("Informação do CAT não encontrada.");

    await this.repo.delete(id);

    // Apagar fisicamente a pasta e o arquivo
    if (existente.arquivoUrl) {
      const pastaFisica = path.join(".", path.dirname(existente.arquivoUrl));
      if (fs.existsSync(pastaFisica)) {
        fs.rmSync(pastaFisica, { recursive: true, force: true });
      }
    }
  }
}
