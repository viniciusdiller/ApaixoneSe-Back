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
import { CatMovelApplication } from "../../application/applications/catMovel.Application";
import { CreateCatMovelRequestDto } from "../dto/request/cat-movel/createCatMovelRequestDto";
import { UpdateCatMovelRequestDto } from "../dto/request/cat-movel/updateCatMovelRequestDto";

const uploadInterceptor = FileFieldsInterceptor(
  [
    { name: "imagem", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ],
  { storage: memoryStorage() },
);

@ApiTags("CAT Móvel")
@Controller("cat-movel")
export class CatMovelController {
  constructor(private readonly app: CatMovelApplication) {}

  // ──────────────────────────────────────────────────────────
  // POST /cat-movel  →  Configura o CAT Móvel pela 1ª vez (ADMIN)
  // ──────────────────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Configura o CAT Móvel pela primeira vez com imagem ou vídeo (Apenas Admin). Retorna 409 se já existir.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateCatMovelRequestDto })
  @UseInterceptors(uploadInterceptor)
  async create(
    @Body() dto: CreateCatMovelRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { imagem?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const { imagemUrl, videoUrl } = await this.processarMidia(files);
    return this.app.create(dto, req.user, imagemUrl, videoUrl);
  }

  // ──────────────────────────────────────────────────────────
  // GET /cat-movel  →  Retorna o único card (público)
  // ──────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: "Retorna os dados do CAT Móvel" })
  async findOne() {
    return this.app.findOne();
  }

  // ──────────────────────────────────────────────────────────
  // PUT /cat-movel  →  Atualiza o único card (ADMIN)
  // ──────────────────────────────────────────────────────────
  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Atualiza os dados do CAT Móvel (Apenas Admin). Pode trocar título, descrição ou mídia.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateCatMovelRequestDto })
  @UseInterceptors(uploadInterceptor)
  async update(
    @Body() dto: UpdateCatMovelRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { imagem?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const { imagemUrl, videoUrl } = await this.processarMidia(files);
    return this.app.update(dto, req.user, imagemUrl, videoUrl);
  }

  // ──────────────────────────────────────────────────────────
  // Helper: processa upload de imagem (→ WebP) ou vídeo
  // ──────────────────────────────────────────────────────────
  private async processarMidia(
    files?: { imagem?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ): Promise<{ imagemUrl?: string; videoUrl?: string }> {
    const uploadDir = `./uploads/cat-movel`;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let imagemUrl: string | undefined;
    let videoUrl: string | undefined;

    if (files?.imagem && files.imagem.length > 0) {
      const file = files.imagem[0];
      const nomeImagem = `imagem_${Date.now()}.webp`;
      await sharp(file.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, nomeImagem));
      imagemUrl = `/uploads/cat-movel/${nomeImagem}`;
    }

    if (files?.video && files.video.length > 0) {
      const videoFile = files.video[0];
      const ext = path.extname(videoFile.originalname).toLowerCase() || ".mp4";
      const nomeVideo = `video_${Date.now()}${ext}`;
      fs.writeFileSync(path.join(uploadDir, nomeVideo), videoFile.buffer);
      videoUrl = `/uploads/cat-movel/${nomeVideo}`;
    }

    return { imagemUrl, videoUrl };
  }
}
