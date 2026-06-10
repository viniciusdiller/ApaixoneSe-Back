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
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  FileFieldsInterceptor,
  FilesInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
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
import { SecretariaTurismoApplication } from "../../application/applications/secretariaTurismo.Application";
import { CreateSecretariaRequestDto } from "../dto/request/secretaria-turismo/createSecretariaRequestDto";
import { CreateTuristandoRequestDto } from "../dto/request/secretaria-turismo/createTuristandoRequestDto";
import { CreateProjetoRequestDto } from "../dto/request/secretaria-turismo/createProjetoRequestDto";

@ApiTags("Secretaria de Turismo")
@Controller("secretaria-turismo")
export class SecretariaTurismoController {
  constructor(private readonly app: SecretariaTurismoApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Cria a base da Secretaria de Turismo (Adminpenas)",
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "video", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() dto: CreateSecretariaRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { video?: Express.Multer.File[] },
  ) {
    let videoUrl: string | undefined;
    if (files?.video?.[0]) {
      const uploadDir = `./uploads/secretaria/institucional`;
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const ext =
        path.extname(files.video[0].originalname).toLowerCase() || ".mp4";
      const nomeVideo = `video_${Date.now()}${ext}`;
      fs.writeFileSync(path.join(uploadDir, nomeVideo), files.video[0].buffer);
      videoUrl = `/uploads/secretaria/institucional/${nomeVideo}`;
    }
    return this.app.create(dto, req.user, videoUrl);
  }

  @Get()
  @ApiOperation({
    summary: "Retorna todas as informações da Secretaria de Turismo",
  })
  async findAll() {
    return this.app.findAll();
  }

  // ================= SUB-ROTAS DOS BLOCOS DINÂMICOS =================

  @Post(":id/turistando")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Adiciona um bloco Turistando à Secretaria" })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "imagens", maxCount: 10 }], {
      storage: memoryStorage(),
    }),
  )
  async addTuristando(
    @Param("id") id: string,
    @Body() dto: CreateTuristandoRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { imagens?: Express.Multer.File[] },
  ) {
    let imagensUrl: string[] = [];
    if (files?.imagens && files.imagens.length > 0) {
      const uploadDir = `./uploads/secretaria/turistando`;
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      for (let i = 0; i < files.imagens.length; i++) {
        const nomeImg = `turistando_${Date.now()}_${i}.webp`;
        await sharp(files.imagens[i].buffer)
          .resize(800)
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, nomeImg));
        imagensUrl.push(`/uploads/secretaria/turistando/${nomeImg}`);
      }
    }
    return this.app.addTuristando(id, dto, req.user, imagensUrl);
  }

  @Post(":id/projeto")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Adiciona um curso/projeto da prefeitura" })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "imagem", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async addProjeto(
    @Param("id") id: string,
    @Body() dto: CreateProjetoRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { imagem?: Express.Multer.File[] },
  ) {
    let imagemUrl: string | undefined;
    if (files?.imagem?.[0]) {
      const uploadDir = `./uploads/secretaria/projetos`;
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const nomeImg = `projeto_${Date.now()}.webp`;
      await sharp(files.imagem[0].buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, nomeImg));
      imagemUrl = `/uploads/secretaria/projetos/${nomeImg}`;
    }
    return this.app.addProjeto(id, dto, req.user, imagemUrl);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Deleta uma Secretaria e limpa todos os sub-blocos",
  })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.app.delete(id, req.user);
  }
}
