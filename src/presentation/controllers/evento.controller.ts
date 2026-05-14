import { Controller, Get, Post, Put, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { EventoApplication } from "../../application/applications/evento.Application";
import { CreateEventoRequestDto } from "../dto/request/eventos/createEventoRequestDto";
import { EventoResponseDto } from "../dto/response/eventoResponse.dto";
import { UpdateImagemMesDto } from "../dto/request/eventos/updateImagemMesDto";
import { Mes } from "@prisma/client";

@ApiTags("Eventos e Calendário")
@Controller("eventos")
export class EventoController {
  constructor(private readonly eventoApplication: EventoApplication) {}

  @Post()
  @ApiOperation({ summary: "Cria um novo evento" })
  @ApiResponse({ status: 201, type: EventoResponseDto })
  async create(
    @Body() dto: CreateEventoRequestDto,
  ): Promise<EventoResponseDto> {
    return this.eventoApplication.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Lista todos os eventos ordenados por data" })
  @ApiResponse({ status: 200, type: [EventoResponseDto] })
  async findAll(): Promise<EventoResponseDto[]> {
    return this.eventoApplication.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca os detalhes de um evento pelo ID" })
  @ApiResponse({ status: 200, type: EventoResponseDto })
  async findById(@Param("id") id: string): Promise<EventoResponseDto> {
    return this.eventoApplication.findById(id);
  }

  // ROTA ESPECIAL: Atualizar a imagem de um mês
  @Put("capa-mensal/:mes")
  @ApiOperation({ summary: "Define ou atualiza a imagem de capa de um mês" })
  @ApiParam({
    name: "mes",
    enum: Mes,
    description: "Ex: JANEIRO, FEVEREIRO...",
  })
  @ApiResponse({ status: 200, description: "Capa atualizada com sucesso" })
  async atualizarCapa(
    @Param("mes") mes: Mes,
    @Body() dto: UpdateImagemMesDto,
  ): Promise<void> {
    return this.eventoApplication.atualizarCapaDoMes(mes, dto);
  }
}
