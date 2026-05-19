import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { ServicoTuristaRepository } from "../../data/repositories/servicoTurista.repository";
import { UserRepository } from "../../data/repositories/user.repository";
import { ServicoTurista } from "../../data/entities/servicoTurista.Entity";
import { StatusEstabelecimento, Perfil } from "@prisma/client";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class ServicoTuristaApplication {
  constructor(
    private readonly repo: ServicoTuristaRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async create(
    data: any,
    usuarioId: string,
    logoUrl?: string,
    fotoUrl?: string,
  ) {
    const novo = new ServicoTurista({ ...data, usuarioId, logoUrl, fotoUrl });
    return this.repo.save(novo);
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const s = await this.repo.findById(id);
    if (!s) throw new NotFoundException("Serviço não encontrado.");
    return s;
  }

  async update(
    id: string,
    data: any,
    usuarioLogado: IUsuarioLogado,
    logoUrl?: string,
    fotoUrl?: string,
  ) {
    const existente = await this.repo.findById(id);
    if (!existente) throw new NotFoundException("Serviço não encontrado.");

    if (
      usuarioLogado.perfil !== "ADMIN" &&
      existente.usuarioId !== usuarioLogado.id
    ) {
      throw new ForbiddenException(
        "Não tem permissão para alterar este serviço.",
      );
    }

    if (
      data.status &&
      data.status !== existente.status &&
      usuarioLogado.perfil !== "ADMIN"
    ) {
      throw new ForbiddenException(
        "Apenas administradores podem alterar o status.",
      );
    }

    if (data.status === StatusEstabelecimento.REJEITADO) {
      await this.repo.delete(id);
      const urlParaApagar = existente.logoUrl || existente.fotoUrl;
      if (urlParaApagar) {
        const pastaFisica = path.join(".", path.dirname(urlParaApagar));
        if (fs.existsSync(pastaFisica))
          fs.rmSync(pastaFisica, { recursive: true, force: true });
      }
      return { message: "Serviço rejeitado e apagado." };
    }

    // Promoção automática a PARCEIRO
    if (
      data.status === StatusEstabelecimento.APROVADO &&
      existente.status !== StatusEstabelecimento.APROVADO
    ) {
      const dono = await this.userRepo.findById(existente.usuarioId);
      if (dono && dono.perfil === Perfil.USUARIO) {
        await this.userRepo.update(dono.id!, { perfil: Perfil.PARCEIRO });
      }
    }

    const dadosAtualizacao: any = { ...data };

    // LIMPEZA PARA EVITAR O ERRO DO PRISMA
    delete dadosAtualizacao.logo;
    delete dadosAtualizacao.foto;

    if (logoUrl) dadosAtualizacao.logoUrl = logoUrl;
    if (fotoUrl) dadosAtualizacao.fotoUrl = fotoUrl;

    return this.repo.update(id, dadosAtualizacao);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado) {
    const existente = await this.repo.findById(id);
    if (!existente) throw new NotFoundException("Serviço não encontrado.");

    if (
      usuarioLogado.perfil !== "ADMIN" &&
      existente.usuarioId !== usuarioLogado.id
    ) {
      throw new ForbiddenException(
        "Não tem permissão para apagar este serviço.",
      );
    }

    await this.repo.delete(id);
    const urlParaApagar = existente.logoUrl || existente.fotoUrl;
    if (urlParaApagar) {
      const pastaFisica = path.join(".", path.dirname(urlParaApagar));
      if (fs.existsSync(pastaFisica))
        fs.rmSync(pastaFisica, { recursive: true, force: true });
    }
  }
}
