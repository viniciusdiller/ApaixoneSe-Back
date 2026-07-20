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

  async create(
    data: any,
    usuarioLogado: IUsuarioLogado,
    imagensUrl?: string[],
    videoUrl?: string,
  ) {
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
    const dadosLimpos: any = { ...data };
    delete dadosLimpos.imagens;
    delete dadosLimpos.video;

    const novo = new Cat({ ...dadosLimpos, imagensUrl, videoUrl });
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
    novasImagensUrl?: string[],
    videoUrl?: string,
    ordem?: string[],
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
    delete dadosAtualizacao.imagens;
    delete dadosAtualizacao.video;
    delete dadosAtualizacao.ordem;

    if (videoUrl) dadosAtualizacao.videoUrl = videoUrl;

    if (ordem && ordem.length > 0) {
      // Reconstrói a lista final combinando existentes mantidas (na nova ordem) + novas enviadas
      let proximoIndice = 0;
      const urlsFinais = ordem.map((item) =>
        item === "__new__" ? novasImagensUrl?.[proximoIndice++] : item,
      ).filter((url): url is string => !!url);

      const antigas: string[] = Array.isArray(existente.imagensUrl)
        ? existente.imagensUrl
        : [];
      antigas
        .filter((url) => !urlsFinais.includes(url))
        .forEach((url) => this.removerArquivo(url));

      dadosAtualizacao.imagensUrl = urlsFinais;
    } else if (novasImagensUrl && novasImagensUrl.length > 0) {
      // Sem informação de ordem (cliente antigo): mantém o comportamento anterior
      dadosAtualizacao.imagensUrl = novasImagensUrl;
    }

    return this.repo.update(id, dadosAtualizacao);
  }

  private removerArquivo(url?: string | null): void {
    if (!url) return;
    const filePath = path.join(".", url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
    if (existente.imagensUrl && existente.imagensUrl.length > 0) {
      const pastaFisica = path.join(".", path.dirname(existente.imagensUrl[0]));
      if (fs.existsSync(pastaFisica)) {
        fs.rmSync(pastaFisica, { recursive: true, force: true });
      }
    }
  }
}
