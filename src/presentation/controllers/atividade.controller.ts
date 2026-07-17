import {
  Controller,
  Post,
  Get,
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
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { AtividadeApplication } from "../../application/applications/atividade.Application";
import { AtividadeResponseDto } from "../dto/response/atividadeResponse.dto";
import { CreateAtividadeRequestDto } from "../dto/request/atividades/createAtividadeRequestDto";
import { UpdateAtividadeRequestDto } from "../dto/request/atividades/updateAtividadeRequestDto";
import { TipoRoteiro } from "@prisma/client";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { memoryStorage } from "multer";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

function sanitizarNomePasta(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
}

@ApiTags("Atividades e Roteiros")
@Controller("atividades")
export class AtividadeController {
  constructor(private readonly atividadeApplication: AtividadeApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cadastra uma nova atividade num roteiro (Apenas Admin)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateAtividadeRequestDto })
  @ApiResponse({ status: 201, type: AtividadeResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "logo", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() createDto: CreateAtividadeRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { logo?: Express.Multer.File[] },
  ): Promise<AtividadeResponseDto> {
    const file = files?.logo?.[0];
    const logoUrl = file
      ? await this.salvarLogoAtividade(file, createDto.titulo)
      : undefined;

    return this.atividadeApplication.create(createDto, req.user, logoUrl);
  }

  @Get()
  @ApiOperation({ summary: "Lista todas as atividades de todos os roteiros" })
  @ApiResponse({ status: 200, type: [AtividadeResponseDto] })
  async findAll(): Promise<AtividadeResponseDto[]> {
    return this.atividadeApplication.findAll();
  }

  @Get("roteiro/:roteiro")
  @ApiOperation({
    summary: "Busca atividades filtradas por um roteiro específico",
  })
  @ApiParam({ name: "roteiro", enum: TipoRoteiro })
  @ApiResponse({ status: 200, type: [AtividadeResponseDto] })
  async findByRoteiro(
    @Param("roteiro") roteiro: TipoRoteiro,
  ): Promise<AtividadeResponseDto[]> {
    return this.atividadeApplication.findByRoteiro(roteiro);
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca os detalhes de uma atividade pelo ID" })
  @ApiResponse({ status: 200, type: AtividadeResponseDto })
  async findById(@Param("id") id: string): Promise<AtividadeResponseDto> {
    return this.atividadeApplication.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Atualiza os dados de uma atividade pelo ID (Apenas Admin)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateAtividadeRequestDto })
  @ApiResponse({ status: 200, type: AtividadeResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "logo", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAtividadeRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { logo?: Express.Multer.File[] },
  ): Promise<AtividadeResponseDto> {
    const file = files?.logo?.[0];

    const atividadeExistente = file
      ? await this.atividadeApplication.findById(id)
      : null;
    const tituloAtividade = dto.titulo ?? atividadeExistente?.titulo;

    const logoUrl =
      file && tituloAtividade
        ? await this.salvarLogoAtividade(file, tituloAtividade)
        : undefined;

    return this.atividadeApplication.update(id, dto, req.user, logoUrl);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta uma atividade pelo ID (Apenas Admin)" })
  async delete(@Param("id") id: string, @Req() req: any): Promise<void> {
    return this.atividadeApplication.delete(id, req.user);
  }

  private async salvarLogoAtividade(
    file: Express.Multer.File,
    tituloAtividade: string,
  ): Promise<string> {
    const pastaAtividade = sanitizarNomePasta(tituloAtividade);
    const uploadDir = path.join("./public/atividades", pastaAtividade);

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const nomeArquivo = `logo_${Date.now()}.webp`;

    await sharp(file.buffer)
      .resize(600)
      .webp({ quality: 85 })
      .toFile(path.join(uploadDir, nomeArquivo));

    return `/public/atividades/${pastaAtividade}/${nomeArquivo}`;
  }
}
