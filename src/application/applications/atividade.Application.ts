import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Atividade } from "../../data/entities/atividade.Entity";
import { AtividadeRepository } from "../../data/repositories/atividade.repository";
import { AtividadeResponseDto } from "../../presentation/dto/response/atividadeResponse.dto";
import { CreateAtividadeRequestDto } from "../../presentation/dto/request/atividades/createAtividadeRequestDto";
import { UpdateAtividadeRequestDto } from "../../presentation/dto/request/atividades/updateAtividadeRequestDto";
import { TipoRoteiro } from "@prisma/client";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class AtividadeApplication {
  constructor(private readonly atividadeRepository: AtividadeRepository) {}

  async create(
    data: CreateAtividadeRequestDto,
    usuarioLogado: IUsuarioLogado,
  ): Promise<AtividadeResponseDto> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem criar atividades.",
      );

    const novaAtividade = new Atividade({
      titulo: data.titulo,
      descricao: data.descricao,
      local: data.local,
      latitude: data.latitude,
      longitude: data.longitude,
      roteiro: data.roteiro,
    });

    const atividadeSalva = await this.atividadeRepository.save(novaAtividade);
    return this.mapToResponseDto(atividadeSalva);
  }

  async findAll(): Promise<AtividadeResponseDto[]> {
    const atividades = await this.atividadeRepository.findAll();
    return atividades.map((a) => this.mapToResponseDto(a));
  }

  async findByRoteiro(roteiro: TipoRoteiro): Promise<AtividadeResponseDto[]> {
    const atividades = await this.atividadeRepository.findByRoteiro(roteiro);
    return atividades.map((a) => this.mapToResponseDto(a));
  }

  async findById(id: string): Promise<AtividadeResponseDto> {
    const atividade = await this.atividadeRepository.findById(id);
    if (!atividade) throw new NotFoundException("Atividade não encontrada.");
    return this.mapToResponseDto(atividade);
  }

  async update(
    id: string,
    dto: UpdateAtividadeRequestDto,
    usuarioLogado: IUsuarioLogado,
  ): Promise<AtividadeResponseDto> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem alterar atividades.",
      );

    const atividade = await this.atividadeRepository.findById(id);
    if (!atividade)
      throw new NotFoundException("Atividade não encontrada para atualização.");

    const atividadeAtualizada = await this.atividadeRepository.update(id, dto);
    return this.mapToResponseDto(atividadeAtualizada);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado): Promise<void> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem excluir atividades.",
      );

    const atividade = await this.atividadeRepository.findById(id);
    if (!atividade) throw new NotFoundException("Atividade não encontrada.");

    await this.atividadeRepository.delete(id);
  }

  private mapToResponseDto(atividade: Atividade): AtividadeResponseDto {
    return {
      id: atividade.id!,
      titulo: atividade.titulo,
      descricao: atividade.descricao,
      local: atividade.local,
      latitude: atividade.latitude ?? null,
      longitude: atividade.longitude ?? null,
      roteiro: atividade.roteiro,
      createdAt: atividade.createdAt!,
    };
  }
}
