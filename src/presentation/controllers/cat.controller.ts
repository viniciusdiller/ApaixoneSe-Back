import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseInterceptors,
  UploadedFiles,
  Req,
  UseGuards,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { memoryStorage } from "multer";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { CatApplication } from "../../application/applications/cat.Application";
import { CreateCatRequestDto } from "../dto/request/cat/createCatRequestDto";
import { UpdateCatRequestDto } from "../dto/request/cat/updateCatRequestDto";

const UPLOAD_DIR = `./uploads/cat/informacoes`;

const uploadInterceptor = FileFieldsInterceptor(
  [
    { name: "imagens", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ],
  { storage: memoryStorage() },
);

@ApiTags("CAT (Centro de Atendimento ao Turista)")
@Controller("cat")
export class CatController {
  constructor(private readonly app: CatApplication) {}

  // ──────────────────────────────────────────────────────────
  // POST /cat  →  Configura o CAT pela 1ª vez (ADMIN). 409 se já existir.
  // ──────────────────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Configura o CAT pela primeira vez com múltiplas imagens e 1 vídeo (Administrador). Retorna 409 se já existir.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateCatRequestDto })
  @UseInterceptors(uploadInterceptor)
  async create(
    @Body() dto: CreateCatRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { imagens?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const imagensUrl = await this.processarImagens(files?.imagens);
    const videoUrl = this.processarVideo(files?.video);
    return this.app.create(dto, req.user, imagensUrl, videoUrl);
  }

  // ──────────────────────────────────────────────────────────
  // GET /cat  →  Retorna o único registro (404 se não configurado)
  // ──────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: "Retorna as informações do CAT" })
  async findOne() {
    return this.app.findOne();
  }

  // ──────────────────────────────────────────────────────────
  // PUT /cat  →  Atualiza o único registro (ADMIN)
  // ──────────────────────────────────────────────────────────
  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualiza as informações do CAT (Administrador)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateCatRequestDto })
  @UseInterceptors(uploadInterceptor)
  async update(
    @Body() dto: UpdateCatRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { imagens?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const novasImagensUrl = await this.processarImagens(files?.imagens);
    const videoUrl = this.processarVideo(files?.video);

    let ordem: string[] | undefined;
    if (dto.ordem) {
      try {
        const parsed = JSON.parse(dto.ordem);
        if (Array.isArray(parsed)) ordem = parsed;
      } catch {
        // ignora ordem inválida — mantém comportamento sem reordenação
      }
    }

    return this.app.update(dto, req.user, novasImagensUrl, videoUrl, ordem);
  }

  // ──────────────────────────────────────────────────────────
  // Helper: processa as imagens da galeria (→ WebP, nome único)
  // ──────────────────────────────────────────────────────────
  private async processarImagens(
    files?: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const nomeImagem = `imagem_${Date.now()}_${i}.webp`;
      await sharp(files[i].buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(path.join(UPLOAD_DIR, nomeImagem));
      urls.push(`/uploads/cat/informacoes/${nomeImagem}`);
    }
    return urls;
  }

  // ──────────────────────────────────────────────────────────
  // Helper: processa o vídeo (nome único)
  // ──────────────────────────────────────────────────────────
  private processarVideo(files?: Express.Multer.File[]): string | undefined {
    if (!files || files.length === 0) return undefined;
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const videoFile = files[0];
    const ext = path.extname(videoFile.originalname).toLowerCase() || ".mp4";
    const nomeVideo = `video_${Date.now()}${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, nomeVideo), videoFile.buffer);
    return `/uploads/cat/informacoes/${nomeVideo}`;
  }
}
