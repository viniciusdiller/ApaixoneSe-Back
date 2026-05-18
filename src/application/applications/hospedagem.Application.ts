import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { HospedagemRepository } from "../../data/repositories/hospedagem.repository";
import { UserRepository } from "../../data/repositories/user.repository";
import { Hospedagem } from "../../data/entities/hospedagem.Entity";
import { StatusEstabelecimento, Perfil } from "@prisma/client";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class HospedagemApplication {
  constructor(
    private readonly repo: HospedagemRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async create(data: any, usuarioId: string, logoUrl: string, pdfUrl: string) {
    const nova = new Hospedagem({
      ...data,
      usuarioId,
      logoUrl,
      documentoPdfUrl: pdfUrl,
    });
    const salva = await this.repo.save(nova);
    return salva; // Map para o DTO de Response depois
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const h = await this.repo.findById(id);
    if (!h) throw new NotFoundException("Hospedagem não encontrada.");
    return h;
  }

  async update(
    id: string,
    data: any,
    usuarioLogado: IUsuarioLogado,
    logoUrl?: string,
    pdfUrl?: string,
  ) {
    const existente = await this.repo.findById(id);
    if (!existente) throw new NotFoundException("Hospedagem não encontrada.");

    if (
      usuarioLogado.perfil !== "ADMIN" &&
      existente.usuarioId !== usuarioLogado.id
    ) {
      throw new ForbiddenException(
        "Não tem permissão para alterar esta hospedagem.",
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
      if (existente.logoUrl) {
        const pastaFisica = path.join(".", path.dirname(existente.logoUrl));
        if (fs.existsSync(pastaFisica))
          fs.rmSync(pastaFisica, { recursive: true, force: true });
      }
      return { message: "Hospedagem rejeitada e apagada." };
    }

    if (
      data.status === StatusEstabelecimento.APROVADO &&
      existente.status !== StatusEstabelecimento.APROVADO
    ) {
      const dono = await this.userRepo.findById(existente.usuarioId);
      if (dono && dono.perfil === Perfil.USUARIO) {
        await this.userRepo.update(dono.id!, { perfil: Perfil.PARCEIRO });
      }
    }

    const dadosAtualizacao: Partial<Hospedagem> = { ...data };
    if (logoUrl) dadosAtualizacao.logoUrl = logoUrl;
    if (pdfUrl) dadosAtualizacao.documentoPdfUrl = pdfUrl;

    return this.repo.update(id, dadosAtualizacao);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado) {
    const existente = await this.repo.findById(id);
    if (!existente) throw new NotFoundException("Hospedagem não encontrada.");

    if (
      usuarioLogado.perfil !== "ADMIN" &&
      existente.usuarioId !== usuarioLogado.id
    ) {
      throw new ForbiddenException(
        "Não tem permissão para apagar esta hospedagem.",
      );
    }

    await this.repo.delete(id);
    if (existente.logoUrl) {
      const pastaFisica = path.join(".", path.dirname(existente.logoUrl));
      if (fs.existsSync(pastaFisica))
        fs.rmSync(pastaFisica, { recursive: true, force: true });
    }
  }
}
