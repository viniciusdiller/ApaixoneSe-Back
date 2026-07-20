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
import { PontoAguaApplication } from "../../application/applications/pontoAgua.Application";
import { PontoAguaResponseDto } from "../dto/response/pontoAguaResponse.dto";
import { CreatePontoAguaRequestDto } from "../dto/request/pontos-agua/createPontoAguaRequestDto";
import { UpdatePontoAguaRequestDto } from "../dto/request/pontos-agua/updatePontoAguaRequestDto";
import { TipoPontoAgua } from "@prisma/client";
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

@ApiTags("Praias e Lagoas")
@Controller("pontos-agua")
export class PontoAguaController {
  constructor(private readonly app: PontoAguaApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cadastra uma nova praia ou lagoa (Apenas Admin)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreatePontoAguaRequestDto })
  @ApiResponse({ status: 201, type: PontoAguaResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "imagem", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() dto: CreatePontoAguaRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { imagem?: Express.Multer.File[] },
  ): Promise<PontoAguaResponseDto> {
    const file = files?.imagem?.[0];
    const imagemUrl = file ? await this.salvarImagem(file, dto.nome) : undefined;
    return this.app.create(dto, req.user, imagemUrl);
  }

  @Get()
  @ApiOperation({ summary: "Lista todas as praias e lagoas" })
  @ApiResponse({ status: 200, type: [PontoAguaResponseDto] })
  async findAll(): Promise<PontoAguaResponseDto[]> {
    return this.app.findAll();
  }

  @Get("tipo/:tipo")
  @ApiOperation({ summary: "Lista praias ou lagoas filtradas por tipo" })
  @ApiParam({ name: "tipo", enum: TipoPontoAgua })
  @ApiResponse({ status: 200, type: [PontoAguaResponseDto] })
  async findByTipo(
    @Param("tipo") tipo: TipoPontoAgua,
  ): Promise<PontoAguaResponseDto[]> {
    return this.app.findByTipo(tipo);
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Busca os detalhes de uma praia/lagoa pelo slug" })
  @ApiResponse({ status: 200, type: PontoAguaResponseDto })
  async findBySlug(
    @Param("slug") slug: string,
  ): Promise<PontoAguaResponseDto> {
    return this.app.findBySlug(slug);
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca os detalhes de uma praia/lagoa pelo ID" })
  @ApiResponse({ status: 200, type: PontoAguaResponseDto })
  async findById(@Param("id") id: string): Promise<PontoAguaResponseDto> {
    return this.app.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Atualiza os dados de uma praia/lagoa pelo ID (Apenas Admin)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdatePontoAguaRequestDto })
  @ApiResponse({ status: 200, type: PontoAguaResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "imagem", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePontoAguaRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { imagem?: Express.Multer.File[] },
  ): Promise<PontoAguaResponseDto> {
    const file = files?.imagem?.[0];

    const existente = file ? await this.app.findById(id) : null;
    const nome = dto.nome ?? existente?.nome;

    const imagemUrl =
      file && nome ? await this.salvarImagem(file, nome) : undefined;

    return this.app.update(id, dto, req.user, imagemUrl);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta uma praia/lagoa pelo ID (Apenas Admin)" })
  async delete(@Param("id") id: string, @Req() req: any): Promise<void> {
    return this.app.delete(id, req.user);
  }

  private async salvarImagem(
    file: Express.Multer.File,
    nome: string,
  ): Promise<string> {
    const pasta = sanitizarNomePasta(nome);
    const uploadDir = path.join("./public/pontos-agua", pasta);

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const nomeArquivo = `imagem_${Date.now()}.webp`;

    await sharp(file.buffer)
      .resize(1200)
      .webp({ quality: 85 })
      .toFile(path.join(uploadDir, nomeArquivo));

    return `/public/pontos-agua/${pasta}/${nomeArquivo}`;
  }
}
