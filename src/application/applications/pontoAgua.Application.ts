import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PontoAgua } from "../../data/entities/pontoAgua.Entity";
import { PontoAguaRepository } from "../../data/repositories/pontoAgua.repository";
import { PontoAguaResponseDto } from "../../presentation/dto/response/pontoAguaResponse.dto";
import { CreatePontoAguaRequestDto } from "../../presentation/dto/request/pontos-agua/createPontoAguaRequestDto";
import { UpdatePontoAguaRequestDto } from "../../presentation/dto/request/pontos-agua/updatePontoAguaRequestDto";
import { TipoPontoAgua } from "@prisma/client";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

function sanitizarSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

@Injectable()
export class PontoAguaApplication {
  constructor(private readonly repo: PontoAguaRepository) {}

  async create(
    data: CreatePontoAguaRequestDto,
    usuarioLogado: IUsuarioLogado,
    imagemUrl?: string,
  ): Promise<PontoAguaResponseDto> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem cadastrar praias ou lagoas.",
      );

    const slug = await this.gerarSlugUnico(data.nome);

    const novo = new PontoAgua({
      tipo: data.tipo,
      nome: data.nome,
      slug,
      descricaoCurta: data.descricaoCurta,
      descricao: data.descricao,
      imagemUrl,
      filtros: this.parseFiltros(data.filtros),
      acessivel: data.acessivel ?? false,
      dificuldade: data.dificuldade,
      estacionamento: data.estacionamento ?? false,
      quiosques: data.quiosques ?? false,
      endereco: data.endereco,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    const salvo = await this.repo.save(novo);
    return this.mapToResponseDto(salvo);
  }

  async findAll(): Promise<PontoAguaResponseDto[]> {
    const itens = await this.repo.findAll();
    return itens.map((i) => this.mapToResponseDto(i));
  }

  async findByTipo(tipo: TipoPontoAgua): Promise<PontoAguaResponseDto[]> {
    const itens = await this.repo.findByTipo(tipo);
    return itens.map((i) => this.mapToResponseDto(i));
  }

  async findBySlug(slug: string): Promise<PontoAguaResponseDto> {
    const item = await this.repo.findBySlug(slug);
    if (!item) throw new NotFoundException("Praia/Lagoa não encontrada.");
    return this.mapToResponseDto(item);
  }

  async findById(id: string): Promise<PontoAguaResponseDto> {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException("Praia/Lagoa não encontrada.");
    return this.mapToResponseDto(item);
  }

  async update(
    id: string,
    dto: UpdatePontoAguaRequestDto,
    usuarioLogado: IUsuarioLogado,
    imagemUrl?: string,
  ): Promise<PontoAguaResponseDto> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem alterar praias ou lagoas.",
      );

    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException(
        "Praia/Lagoa não encontrada para atualização.",
      );

    const slug =
      dto.nome && dto.nome !== existente.nome
        ? await this.gerarSlugUnico(dto.nome, id)
        : existente.slug;

    const atualizado = await this.repo.update(id, {
      tipo: dto.tipo ?? existente.tipo,
      nome: dto.nome ?? existente.nome,
      slug,
      descricaoCurta: dto.descricaoCurta ?? existente.descricaoCurta,
      descricao: dto.descricao ?? existente.descricao,
      imagemUrl: imagemUrl ?? existente.imagemUrl,
      filtros:
        dto.filtros !== undefined
          ? this.parseFiltros(dto.filtros)
          : existente.filtros,
      acessivel: dto.acessivel ?? existente.acessivel,
      dificuldade: dto.dificuldade ?? existente.dificuldade,
      estacionamento: dto.estacionamento ?? existente.estacionamento,
      quiosques: dto.quiosques ?? existente.quiosques,
      endereco: dto.endereco ?? existente.endereco,
      latitude: dto.latitude ?? existente.latitude,
      longitude: dto.longitude ?? existente.longitude,
    });
    return this.mapToResponseDto(atualizado);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado): Promise<void> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem excluir praias ou lagoas.",
      );

    const existente = await this.repo.findById(id);
    if (!existente) throw new NotFoundException("Praia/Lagoa não encontrada.");

    await this.repo.delete(id);
  }

  // Garante que o slug seja único — evita colisão de URL entre pontos diferentes
  private async gerarSlugUnico(
    nome: string,
    ignorarId?: string,
  ): Promise<string> {
    const base = sanitizarSlug(nome);
    let slug = base;
    let contador = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existente = await this.repo.findBySlug(slug);
      if (!existente || existente.id === ignorarId) break;
      slug = `${base}-${contador++}`;
    }
    return slug;
  }

  private parseFiltros(raw?: string): string[] | undefined {
    if (raw === undefined) return undefined;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  private mapToResponseDto(item: PontoAgua): PontoAguaResponseDto {
    return {
      id: item.id!,
      tipo: item.tipo,
      nome: item.nome,
      slug: item.slug,
      descricaoCurta: item.descricaoCurta,
      descricao: item.descricao,
      imagemUrl: item.imagemUrl ?? null,
      filtros: Array.isArray(item.filtros) ? item.filtros : [],
      acessivel: item.acessivel,
      dificuldade: item.dificuldade ?? null,
      estacionamento: item.estacionamento,
      quiosques: item.quiosques,
      endereco: item.endereco ?? null,
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      createdAt: item.createdAt!,
    };
  }
}
