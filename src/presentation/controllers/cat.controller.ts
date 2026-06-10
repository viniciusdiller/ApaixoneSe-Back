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
import { CatApplication } from "../../application/applications/cat.Application";
import { CreateCatRequestDto } from "../dto/request/cat/createCatRequestDto";
import { UpdateCatRequestDto } from "../dto/request/cat/updateCatRequestDto";

@ApiTags("CAT (Centro de Atendimento ao Turista)")
@Controller("cat")
export class CatController {
  constructor(private readonly app: CatApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cria informações do CAT com Múltiplas Imagens e 1 Vídeo",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateCatRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "imagens", maxCount: 10 },
        { name: "video", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() dto: CreateCatRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { imagens?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const uploadDir = `./uploads/cat/informacoes`;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let imagensUrl: string[] = [];
    let videoUrl: string | undefined = undefined;

    // 1. PROCESSAR MÚLTIPLAS IMAGENS
    if (files?.imagens && files.imagens.length > 0) {
      for (let i = 0; i < files.imagens.length; i++) {
        const file = files.imagens[i];
        const nomeImagem = `imagem_${Date.now()}_${i}.webp`;
        await sharp(file.buffer)
          .resize(800)
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, nomeImagem));
        imagensUrl.push(`/uploads/cat/informacoes/${nomeImagem}`);
      }
    }

    // 2. PROCESSAR O VÍDEO
    if (files?.video && files.video.length > 0) {
      const videoFile = files.video[0];
      const ext = path.extname(videoFile.originalname).toLowerCase() || ".mp4";
      const nomeVideo = `video_${Date.now()}${ext}`;
      fs.writeFileSync(path.join(uploadDir, nomeVideo), videoFile.buffer);
      videoUrl = `/uploads/cat/informacoes/${nomeVideo}`;
    }

    return this.app.create(dto, req.user, imagensUrl, videoUrl);
  }

  @Get()
  @ApiOperation({ summary: "Lista todas as informações do CAT" })
  async findAll() {
    return this.app.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca uma informação do CAT pelo ID" })
  async findById(@Param("id") id: string) {
    return this.app.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualiza uma informação do CAT (Apenas Admin)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateCatRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      // 👈 Atualizado para o padrão do create
      [
        { name: "imagens", maxCount: 10 },
        { name: "video", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCatRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { imagens?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const uploadDir = `./uploads/cat/informacoes`;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let imagensUrl: string[] = [];
    let videoUrl: string | undefined = undefined;

    // 1. PROCESSAR NOVAS IMAGENS (Se enviadas)
    if (files?.imagens && files.imagens.length > 0) {
      for (let i = 0; i < files.imagens.length; i++) {
        const file = files.imagens[i];
        const nomeImagem = `imagem_${i}.webp`;
        await sharp(file.buffer)
          .resize(800)
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, nomeImagem));
        imagensUrl.push(`/uploads/cat/informacoes/${nomeImagem}`);
      }
    }

    // 2. PROCESSAR O NOVO VÍDEO (Se enviado)
    if (files?.video && files.video.length > 0) {
      const videoFile = files.video[0];
      const ext = path.extname(videoFile.originalname).toLowerCase() || ".mp4";
      const nomeVideo = `video_${ext}`;
      fs.writeFileSync(path.join(uploadDir, nomeVideo), videoFile.buffer);
      videoUrl = `/uploads/cat/informacoes/${nomeVideo}`;
    }

    // 👈 Atualizado para passar os arrays corretamente
    return this.app.update(
      id,
      dto,
      req.user,
      imagensUrl.length > 0 ? imagensUrl : undefined,
      videoUrl,
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta uma informação do CAT (Apenas Admin)" })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.app.delete(id, req.user);
  }
}
