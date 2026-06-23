import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { EventoRepository } from "../../data/repositories/evento.repository";
import { Evento } from "../../data/entities/evento.Entity";
import { CreateEventoRequestDto } from "../../presentation/dto/request/eventos/createEventoRequestDto";
import { EventoResponseDto } from "../../presentation/dto/response/eventoResponse.dto";
import { UpdateEventoRequestDto } from "../../presentation/dto/request/eventos/updateEventoRequestDto";
import { Mes } from "@prisma/client";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class EventoApplication {
  constructor(private readonly eventoRepository: EventoRepository) {}

  private getMesEnum(data: Date): Mes {
    const meses: Mes[] = [
      Mes.JANEIRO,
      Mes.FEVEREIRO,
      Mes.MARCO,
      Mes.ABRIL,
      Mes.MAIO,
      Mes.JUNHO,
      Mes.JULHO,
      Mes.AGOSTO,
      Mes.SETEMBRO,
      Mes.OUTUBRO,
      Mes.NOVEMBRO,
      Mes.DEZEMBRO,
    ];
    return meses[data.getMonth()] as Mes;
  }

  async create(
    dto: CreateEventoRequestDto,
    usuarioLogado: IUsuarioLogado,
    fotoUrl: string,
  ): Promise<EventoResponseDto> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem criar eventos.",
      );

    const dataConvertida = new Date(dto.data);
    const novoEvento = new Evento({
      titulo: dto.titulo,
      descricao: dto.descricao,
      data: dataConvertida,
      local: dto.local,
      fotoUrl,
    });

    const eventoSalvo = await this.eventoRepository.save(novoEvento);
    return this.mapToResponseDto(eventoSalvo);
  }

  async findAll(): Promise<EventoResponseDto[]> {
    const eventos = await this.eventoRepository.findAll();
    return Promise.all(eventos.map((e) => this.mapToResponseDto(e)));
  }

  async findById(id: string): Promise<EventoResponseDto> {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) throw new NotFoundException("Evento não encontrado.");
    return this.mapToResponseDto(evento);
  }

  async update(
    id: string,
    dto: UpdateEventoRequestDto,
    usuarioLogado: IUsuarioLogado,
    fotoUrl?: string,
  ): Promise<EventoResponseDto> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem alterar eventos.",
      );

    const evento = await this.eventoRepository.findById(id);
    if (!evento)
      throw new NotFoundException("Evento não encontrado para atualização.");

    const dadosAtualizacao: Partial<Evento> = {
      titulo: dto.titulo,
      descricao: dto.descricao,
      local: dto.local,
      data: dto.data ? new Date(dto.data) : undefined,
      fotoUrl,
    };

    const eventoAtualizado = await this.eventoRepository.update(
      id,
      dadosAtualizacao,
    );
    return this.mapToResponseDto(eventoAtualizado);
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado): Promise<void> {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException(
        "Apenas administradores podem excluir eventos.",
      );

    const evento = await this.eventoRepository.findById(id);
    if (!evento)
      throw new NotFoundException("Evento não encontrado para exclusão.");

    await this.eventoRepository.delete(id);
  }

  private mapToResponseDto(evento: Evento): EventoResponseDto {
    return {
      id: evento.id!,
      titulo: evento.titulo,
      descricao: evento.descricao,
      data: evento.data,
      local: evento.local,
      fotoUrl: evento.fotoUrl,
      mes: this.getMesEnum(evento.data), // Injetamos o mês aqui
      createdAt: evento.createdAt!,
    };
  }
}
