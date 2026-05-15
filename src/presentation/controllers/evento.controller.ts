import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { EventoApplication } from "../../application/applications/evento.Application";
import { CreateEventoRequestDto } from "../dto/request/eventos/createEventoRequestDto";
import { EventoResponseDto } from "../dto/response/eventoResponse.dto";
import { UpdateEventoRequestDto } from "../dto/request/eventos/updateEventoRequestDto";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";

@ApiTags("Eventos e Calendário")
@Controller("eventos")
export class EventoController {
  constructor(private readonly eventoApplication: EventoApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cria um novo evento (Apenas Admin)" })
  @ApiResponse({ status: 201, type: EventoResponseDto })
  async create(
    @Body() dto: CreateEventoRequestDto,
    @Req() req: any,
  ): Promise<EventoResponseDto> {
    return this.eventoApplication.create(dto, req.user);
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

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Atualiza os dados de um evento pelo ID (Apenas Admin)",
  })
  @ApiResponse({ status: 200, type: EventoResponseDto })
  @ApiResponse({ status: 404, description: "Evento não encontrado" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateEventoRequestDto,
    @Req() req: any,
  ): Promise<EventoResponseDto> {
    return this.eventoApplication.update(id, dto, req.user);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Exclui um evento pelo ID (Apenas Admin)" })
  @ApiResponse({ status: 204, description: "Evento excluído com sucesso" })
  async delete(@Param("id") id: string, @Req() req: any): Promise<void> {
    return this.eventoApplication.delete(id, req.user);
  }
}
