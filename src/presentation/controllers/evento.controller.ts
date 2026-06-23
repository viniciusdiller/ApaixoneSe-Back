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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { EventoApplication } from "../../application/applications/evento.Application";
import { CreateEventoRequestDto } from "../dto/request/eventos/createEventoRequestDto";
import { EventoResponseDto } from "../dto/response/eventoResponse.dto";
import { UpdateEventoRequestDto } from "../dto/request/eventos/updateEventoRequestDto";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { memoryStorage } from "multer";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

function sanitizarNomePasta(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
}

function obterPastaMes(dataEvento: Date): string {
  const meses = [
    "janeiro",
    "fevereiro",
    "marco",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  return meses[dataEvento.getMonth()] ?? "desconhecido";
}

@ApiTags("Eventos e Calendário")
@Controller("eventos")
export class EventoController {
  constructor(private readonly eventoApplication: EventoApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cria um novo evento (Apenas Admin)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateEventoRequestDto })
  @ApiResponse({ status: 201, type: EventoResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "foto", maxCount: 1 },
        { name: "imagem", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() dto: CreateEventoRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { foto?: Express.Multer.File[]; imagem?: Express.Multer.File[] },
  ): Promise<EventoResponseDto> {
    const file = files?.foto?.[0] ?? files?.imagem?.[0];

    if (!file)
      throw new BadRequestException(
        'É obrigatório enviar a imagem no campo "foto" (ou "imagem").',
      );

    const fotoUrl = await this.salvarImagemEvento(file, dto.titulo, dto.data);

    return this.eventoApplication.create(dto, req.user, fotoUrl);
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
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateEventoRequestDto })
  @ApiResponse({ status: 200, type: EventoResponseDto })
  @ApiResponse({ status: 404, description: "Evento não encontrado" })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "foto", maxCount: 1 },
        { name: "imagem", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateEventoRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { foto?: Express.Multer.File[]; imagem?: Express.Multer.File[] },
  ): Promise<EventoResponseDto> {
    const file = files?.foto?.[0] ?? files?.imagem?.[0];

    const eventoExistente = file ? await this.eventoApplication.findById(id) : null;

    const tituloEvento = dto.titulo ?? eventoExistente?.titulo;
    const dataEvento = dto.data ?? eventoExistente?.data.toISOString();

    const fotoUrl =
      file && tituloEvento && dataEvento
        ? await this.salvarImagemEvento(file, tituloEvento, dataEvento)
        : undefined;

    return this.eventoApplication.update(id, dto, req.user, fotoUrl);
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

  private async salvarImagemEvento(
    file: Express.Multer.File,
    tituloEvento: string,
    dataEventoIso: string,
  ): Promise<string> {
    const dataEvento = new Date(dataEventoIso);
    const pastaMes = obterPastaMes(dataEvento);
    const pastaEvento = sanitizarNomePasta(tituloEvento);
    const uploadDir = path.join("./public/eventos", pastaMes, pastaEvento);

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const nomeArquivo = `background_${Date.now()}.webp`;

    await sharp(file.buffer)
      .resize(1600)
      .webp({ quality: 85 })
      .toFile(path.join(uploadDir, nomeArquivo));

    return `/public/eventos/${pastaMes}/${pastaEvento}/${nomeArquivo}`;
  }
}
