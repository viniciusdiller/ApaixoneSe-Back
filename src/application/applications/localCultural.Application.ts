import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { LocalCultural } from "../../data/entities/localCultural.Entity";
import { LocalCulturalRepository } from "../../data/repositories/localCultural.repository";
import { LocalCulturalResponseDto } from "../../presentation/dto/response/localCulturalResponse.dto";
import { CreateLocalCulturalRequestDto } from "../../presentation/dto/request/cultura/createLocalCulturalRequestDto";
import { UpdateLocalCulturalRequestDto } from "../../presentation/dto/request/cultura/updateLocalCulturalRequestDto";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class LocalCulturalApplication {
  constructor(private readonly repo: LocalCulturalRepository) {}

  async create(
    data: CreateLocalCulturalRequestDto,
    usuarioLogado: IUsuarioLogado,
    imagemUrl?: string,
  ): Promise<LocalCulturalResponseDto> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem cadastrar locais culturais.",
      );

    const novo = new LocalCultural({
      nome: data.nome,
      descricao: data.descricao,
      texto: data.texto,
      imagemUrl,
      endereco: data.endereco,
    });

    const salvo = await this.repo.save(novo);
    return this.mapToResponseDto(salvo);
  }

  async findAll(): Promise<LocalCulturalResponseDto[]> {
    const itens = await this.repo.findAll();
    return itens.map((i) => this.mapToResponseDto(i));
  }

  async findById(id: string): Promise<LocalCulturalResponseDto> {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException("Local cultural não encontrado.");
    return this.mapToResponseDto(item);
  }

  async update(
    id: string,
    dto: UpdateLocalCulturalRequestDto,
    usuarioLogado: IUsuarioLogado,
    imagemUrl?: string,
  ): Promise<LocalCulturalResponseDto> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem alterar locais culturais.",
      );

    const existente = await this.repo.findById(id);
    if (!existente)
      throw new NotFoundException(
        "Local cultural não encontrado para atualização.",
      );

    const atualizado = await this.repo.update(id, {
      nome: dto.nome ?? existente.nome,
      descricao: dto.descricao ?? existente.descricao,
      texto: dto.texto ?? existente.texto,
      imagemUrl: imagemUrl ?? existente.imagemUrl,
      endereco: dto.endereco ?? existente.endereco,
    });
    return this.mapToResponseDto(atualizado);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado): Promise<void> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem excluir locais culturais.",
      );

    const existente = await this.repo.findById(id);
    if (!existente) throw new NotFoundException("Local cultural não encontrado.");

    await this.repo.delete(id);
  }

  private mapToResponseDto(item: LocalCultural): LocalCulturalResponseDto {
    return {
      id: item.id!,
      nome: item.nome,
      descricao: item.descricao,
      texto: item.texto,
      imagemUrl: item.imagemUrl ?? null,
      endereco: item.endereco ?? null,
      createdAt: item.createdAt!,
    };
  }
}
