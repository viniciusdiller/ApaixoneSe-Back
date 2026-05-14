import { Injectable, NotFoundException } from "@nestjs/common";
import { AtividadeRepository } from "../../data/repositories/atividade.repository";
import { Atividade } from "../../data/entities/atividade.Entity";
import { CreateAtividadeRequestDto } from "../../presentation/dto/request/atividades/createAtividadeRequestDto";
import { AtividadeResponseDto } from "../../presentation/dto/response/atividadeResponse.dto";
import { TipoRoteiro } from "@prisma/client";

@Injectable()
export class AtividadeApplication {
  // Recebemos o nosso Repository (Fase 1) por Injeção de Dependência
  constructor(private readonly atividadeRepository: AtividadeRepository) {}

  // 1. REGISTAR NOVA ATIVIDADE
  async create(data: CreateAtividadeRequestDto): Promise<AtividadeResponseDto> {
    const novaAtividade = new Atividade({
      titulo: data.titulo,
      descricao: data.descricao,
      local: data.local,
      latitude: data.latitude,
      longitude: data.longitude,
      imagemUrl: data.imagemUrl,
      roteiro: data.roteiro,
    });

    const atividadeSalva = await this.atividadeRepository.save(novaAtividade);
    return this.mapToResponseDto(atividadeSalva);
  }

  // 2. BUSCAR TODAS
  async findAll(): Promise<AtividadeResponseDto[]> {
    const atividades = await this.atividadeRepository.findAll();
    return atividades.map((a) => this.mapToResponseDto(a)); // Converte todas para DTO
  }

  // 3. BUSCAR POR ROTEIRO (O Filtro do App)
  async findByRoteiro(roteiro: TipoRoteiro): Promise<AtividadeResponseDto[]> {
    const atividades = await this.atividadeRepository.findByRoteiro(roteiro);
    return atividades.map((a) => this.mapToResponseDto(a));
  }

  // 4. DETALHES DE UMA ATIVIDADE
  async findById(id: string): Promise<AtividadeResponseDto> {
    const atividade = await this.atividadeRepository.findById(id);

    // Tratamento de Erro do NestJS (Devolve 404 Not Found automático)
    if (!atividade) {
      throw new NotFoundException("Atividade não encontrada.");
    }

    return this.mapToResponseDto(atividade);
  }

  // FUNÇÃO AUXILIAR: Mapeia de Entity para o formato da Internet (DTO)
  private mapToResponseDto(atividade: Atividade): AtividadeResponseDto {
    return {
      id: atividade.id!,
      titulo: atividade.titulo,
      descricao: atividade.descricao,
      local: atividade.local,
      latitude: atividade.latitude ?? null,
      longitude: atividade.longitude ?? null,
      imagemUrl: atividade.imagemUrl ?? null,
      roteiro: atividade.roteiro,
      createdAt: atividade.createdAt!,
    };
  }
}
