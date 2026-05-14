import { Injectable, NotFoundException } from "@nestjs/common";
import { EventoRepository } from "../../data/repositories/evento.repository";
import { Evento } from "../../data/entities/evento.Entity";
import { CreateEventoRequestDto } from "../../presentation/dto/request/eventos/createEventoRequestDto";
import { EventoResponseDto } from "../../presentation/dto/response/eventoResponse.dto";
import { UpdateImagemMesDto } from "../../presentation/dto/request/eventos/updateImagemMesDto";
import { Mes } from "@prisma/client";

@Injectable()
export class EventoApplication {
  constructor(private readonly eventoRepository: EventoRepository) {}

  // ==========================================
  // FUNÇÃO MÁGICA: TRADUTOR DE DATA PARA ENUM
  // ==========================================
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
    // getMonth() devolve 0 para Janeiro e 11 para Dezembro
    return meses[data.getMonth()] as Mes;
  }

  // ==========================================
  // MÉTODOS PRINCIPAIS
  // ==========================================

  async create(dto: CreateEventoRequestDto): Promise<EventoResponseDto> {
    const dataConvertida = new Date(dto.data); // Converte a string ISO8601 para Date real

    const novoEvento = new Evento({
      titulo: dto.titulo,
      descricao: dto.descricao,
      data: dataConvertida,
      local: dto.local,
    });

    const eventoSalvo = await this.eventoRepository.save(novoEvento);
    return this.mapToResponseDto(eventoSalvo);
  }

  async findAll(): Promise<EventoResponseDto[]> {
    const eventos = await this.eventoRepository.findAll();

    // Usamos o Promise.all porque o mapToResponseDto vai ao banco buscar a imagem do mês
    return Promise.all(eventos.map((e) => this.mapToResponseDto(e)));
  }

  async findById(id: string): Promise<EventoResponseDto> {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) throw new NotFoundException("Evento não encontrado.");

    return this.mapToResponseDto(evento);
  }

  async atualizarCapaDoMes(mes: Mes, dto: UpdateImagemMesDto): Promise<void> {
    await this.eventoRepository.upsertImagemMes(mes, dto.imagemUrl);
  }

  // ==========================================
  // MAPPER (Entity -> DTO de Resposta)
  // ==========================================
  private async mapToResponseDto(evento: Evento): Promise<EventoResponseDto> {
    // 1. Descobrimos de que mês é este evento
    const mesEnum = this.getMesEnum(evento.data);

    // 2. Pedimos ao banco a imagem daquele mês
    const imagemUrl = await this.eventoRepository.getImagemMes(mesEnum);

    return {
      id: evento.id!,
      titulo: evento.titulo,
      descricao: evento.descricao,
      data: evento.data,
      local: evento.local,
      imagemMesUrl: imagemUrl, // A imagem já vai mastigada para o Frontend!
      createdAt: evento.createdAt!,
    };
  }
}
