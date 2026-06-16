import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
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

@ApiTags("CAT Móvel")
@Controller("cat-movel")
export class CatMovelController {
  constructor(private readonly app: CatMovelApplication) {}

  // ──────────────────────────────────────────
  // POST /cat-movel  →  Criar card (ADMIN)
  // ──────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cria um card do CAT Móvel com imagem OU vídeo (Apenas Admin)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateCatMovelRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "imagem", maxCount: 1 },
        { name: "video", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() dto: CreateCatMovelRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { imagem?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const uploadDir = `./uploads/cat-movel`;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let imagemUrl: string | undefined = undefined;
    let videoUrl: string | undefined = undefined;

    // Processar imagem → converte para WebP
    if (files?.imagem && files.imagem.length > 0) {
      const file = files.imagem[0];
      const nomeImagem = `imagem_${Date.now()}.webp`;
      await sharp(file.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, nomeImagem));
      imagemUrl = `/uploads/cat-movel/${nomeImagem}`;
    }

    // Processar vídeo → salva diretamente
    if (files?.video && files.video.length > 0) {
      const videoFile = files.video[0];
      const ext = path.extname(videoFile.originalname).toLowerCase() || ".mp4";
      const nomeVideo = `video_${Date.now()}${ext}`;
      fs.writeFileSync(path.join(uploadDir, nomeVideo), videoFile.buffer);
      videoUrl = `/uploads/cat-movel/${nomeVideo}`;
    }

    return this.app.create(dto, req.user, imagemUrl, videoUrl);
  }

  // ──────────────────────────────────────────
  // GET /cat-movel  →  Listar todos (público)
  // ──────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: "Lista todos os cards do CAT Móvel" })
  async findAll() {
    return this.app.findAll();
  }

  // ──────────────────────────────────────────
  // GET /cat-movel/:id  →  Buscar por ID (público)
  // ──────────────────────────────────────────
  @Get(":id")
  @ApiOperation({ summary: "Busca um card do CAT Móvel pelo ID" })
  async findById(@Param("id") id: string) {
    return this.app.findById(id);
  }

  // ──────────────────────────────────────────
  // PUT /cat-movel/:id  →  Atualizar (ADMIN)
  // ──────────────────────────────────────────
  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Atualiza um card do CAT Móvel (Apenas Admin)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateCatMovelRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "imagem", maxCount: 1 },
        { name: "video", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCatMovelRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { imagem?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const uploadDir = `./uploads/cat-movel`;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let imagemUrl: string | undefined = undefined;
    let videoUrl: string | undefined = undefined;

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

    return this.app.update(id, dto, req.user, imagemUrl, videoUrl);
  }

  // ──────────────────────────────────────────
  // DELETE /cat-movel/:id  →  Deletar (ADMIN)
  // ──────────────────────────────────────────
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta um card do CAT Móvel (Apenas Admin)" })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.app.delete(id, req.user);
  }
}
