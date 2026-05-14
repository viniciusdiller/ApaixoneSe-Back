import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { EventoApplication } from "../../application/applications/evento.Application";
import { CreateEventoRequestDto } from "../dto/request/eventos/createEventoRequestDto";
import { EventoResponseDto } from "../dto/response/eventoResponse.dto";
import { UpdateImagemMesDto } from "../dto/request/eventos/updateImagemMesDto";
import { UpdateEventoRequestDto } from "../dto/request/eventos/updateEventoRequestDto";
import { Mes } from "@prisma/client";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

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

  @Put(":id")
  @ApiOperation({ summary: "Atualiza os dados de um evento pelo ID" })
  @ApiResponse({ status: 200, type: EventoResponseDto })
  @ApiResponse({ status: 404, description: "Evento não encontrado" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateEventoRequestDto,
  ): Promise<EventoResponseDto> {
    return this.eventoApplication.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Exclui um evento pelo ID" })
  @ApiResponse({ status: 200, description: "Evento excluído com sucesso" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string): Promise<void> {
    return this.eventoApplication.delete(id);
  }

  // ROTA ESPECIAL: Atualizar a imagem de um mês
  @Put("capa-mensal/:mes")
  @ApiOperation({ summary: "Faz upload e comprime a imagem da capa do mês" })
  @ApiParam({ name: "mes", enum: Mes })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateImagemMesDto })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
    }),
  )
  async atualizarCapa(
    @Param("mes") mes: Mes,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    if (!file) {
      throw new BadRequestException("Nenhum ficheiro enviado.");
    }

    const uploadDir = "./uploads/eventos";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const nomeFicheiro = `${mes}.webp`;
    const caminhoFisico = path.join(uploadDir, nomeFicheiro);

    try {
      await sharp(file.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(caminhoFisico);
    } catch (error) {
      throw new BadRequestException("Erro ao processar e comprimir a imagem.");
    }
    const caminhoUrl = `/uploads/eventos/${nomeFicheiro}`;

    return this.eventoApplication.atualizarCapaDoMes(mes, caminhoUrl);
  }
}
