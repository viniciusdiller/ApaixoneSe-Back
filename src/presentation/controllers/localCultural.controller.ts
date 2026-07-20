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
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { LocalCulturalApplication } from "../../application/applications/localCultural.Application";
import { LocalCulturalResponseDto } from "../dto/response/localCulturalResponse.dto";
import { CreateLocalCulturalRequestDto } from "../dto/request/cultura/createLocalCulturalRequestDto";
import { UpdateLocalCulturalRequestDto } from "../dto/request/cultura/updateLocalCulturalRequestDto";
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

@ApiTags("Cultura")
@Controller("cultura")
export class LocalCulturalController {
  constructor(private readonly app: LocalCulturalApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cadastra um novo local cultural (Apenas Admin)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateLocalCulturalRequestDto })
  @ApiResponse({ status: 201, type: LocalCulturalResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "imagem", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() dto: CreateLocalCulturalRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { imagem?: Express.Multer.File[] },
  ): Promise<LocalCulturalResponseDto> {
    const file = files?.imagem?.[0];
    const imagemUrl = file ? await this.salvarImagem(file, dto.nome) : undefined;
    return this.app.create(dto, req.user, imagemUrl);
  }

  @Get()
  @ApiOperation({ summary: "Lista todos os locais culturais" })
  @ApiResponse({ status: 200, type: [LocalCulturalResponseDto] })
  async findAll(): Promise<LocalCulturalResponseDto[]> {
    return this.app.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca os detalhes de um local cultural pelo ID" })
  @ApiResponse({ status: 200, type: LocalCulturalResponseDto })
  async findById(@Param("id") id: string): Promise<LocalCulturalResponseDto> {
    return this.app.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Atualiza os dados de um local cultural pelo ID (Apenas Admin)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateLocalCulturalRequestDto })
  @ApiResponse({ status: 200, type: LocalCulturalResponseDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "imagem", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateLocalCulturalRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { imagem?: Express.Multer.File[] },
  ): Promise<LocalCulturalResponseDto> {
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
  @ApiOperation({ summary: "Deleta um local cultural pelo ID (Apenas Admin)" })
  async delete(@Param("id") id: string, @Req() req: any): Promise<void> {
    return this.app.delete(id, req.user);
  }

  private async salvarImagem(
    file: Express.Multer.File,
    nome: string,
  ): Promise<string> {
    const pasta = sanitizarNomePasta(nome);
    const uploadDir = path.join("./public/cultura", pasta);

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const nomeArquivo = `imagem_${Date.now()}.webp`;

    await sharp(file.buffer)
      .resize(1200)
      .webp({ quality: 85 })
      .toFile(path.join(uploadDir, nomeArquivo));

    return `/public/cultura/${pasta}/${nomeArquivo}`;
  }
}
