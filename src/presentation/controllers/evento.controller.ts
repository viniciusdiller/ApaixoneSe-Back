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
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
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
  async delete(@Param("id") id: string, @Req() req: any): Promise<void> {
    return this.eventoApplication.delete(id, req.user);
  }

  @Put("capa-mensal/:mes")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Faz upload e comprime a imagem da capa do mês (Apenas Admin)",
  })
  @ApiParam({ name: "mes", enum: Mes })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateImagemMesDto })
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  async atualizarCapa(
    @Param("mes") mes: Mes,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<void> {
    if (!file) throw new BadRequestException("Nenhum ficheiro enviado.");

    const uploadDir = "./uploads/eventos";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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

    return this.eventoApplication.atualizarCapaDoMes(mes, caminhoUrl, req.user);
  }
}
