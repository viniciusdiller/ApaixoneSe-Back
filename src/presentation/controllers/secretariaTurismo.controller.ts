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
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { memoryStorage } from "multer";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { SecretariaTurismoApplication } from "../../application/applications/secretariaTurismo.Application";
import { CreateSecretariaRequestDto } from "../dto/request/secretaria-turismo/createSecretariaRequestDto";
import { UpdateSecretariaRequestDto } from "../dto/request/secretaria-turismo/updateSecretariaRequestDto";
import { CreateTuristandoRequestDto } from "../dto/request/secretaria-turismo/createTuristandoRequestDto";
import { UpdateTuristandoRequestDto } from "../dto/request/secretaria-turismo/updateTuristandoRequestDto";
import { CreateProjetoRequestDto } from "../dto/request/secretaria-turismo/createProjetoRequestDto";
import { UpdateProjetoRequestDto } from "../dto/request/secretaria-turismo/updateProjetoRequestDto";

@ApiTags("Secretaria de Turismo")
@Controller("secretaria-turismo")
export class SecretariaTurismoController {
  constructor(private readonly app: SecretariaTurismoApplication) {}

  // ================= SECRETARIA PRINCIPAL =================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Cria a base da Secretaria de Turismo (Admin apenas)" })
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
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const ext = path.extname(files.video[0].originalname).toLowerCase() || ".mp4";
      const nomeVideo = `video_${Date.now()}${ext}`;
      fs.writeFileSync(path.join(uploadDir, nomeVideo), files.video[0].buffer);
      videoUrl = `/uploads/secretaria/institucional/${nomeVideo}`;
    }
    return this.app.create(dto, req.user, videoUrl);
  }

  @Get()
  @ApiOperation({ summary: "Retorna todas as informações da Secretaria de Turismo" })
  async findAll() {
    return this.app.findAll();
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Atualiza os dados da Secretaria de Turismo" })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "video", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateSecretariaRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { video?: Express.Multer.File[] },
  ) {
    let videoUrl: string | undefined;
    if (files?.video?.[0]) {
      const uploadDir = `./uploads/secretaria/institucional`;
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const ext = path.extname(files.video[0].originalname).toLowerCase() || ".mp4";
      const nomeVideo = `video_${Date.now()}${ext}`;
      fs.writeFileSync(path.join(uploadDir, nomeVideo), files.video[0].buffer);
      videoUrl = `/uploads/secretaria/institucional/${nomeVideo}`;
    }
    return this.app.update(id, dto, req.user, videoUrl);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta uma Secretaria e limpa todos os sub-blocos" })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.app.delete(id, req.user);
  }

  // ================= TURISTANDO =================

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
    const imagensUrl = await this.processarImagens(
      files?.imagens,
      "turistando",
    );
    return this.app.addTuristando(id, dto, req.user, imagensUrl);
  }

  @Put("turistando/:turistandoId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Atualiza um bloco Turistando" })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "imagens", maxCount: 10 }], {
      storage: memoryStorage(),
    }),
  )
  async updateTuristando(
    @Param("turistandoId") turistandoId: string,
    @Body() dto: UpdateTuristandoRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { imagens?: Express.Multer.File[] },
  ) {
    const imagensUrl = await this.processarImagens(
      files?.imagens,
      "turistando",
    );
    return this.app.updateTuristando(
      turistandoId,
      dto,
      req.user,
      imagensUrl.length > 0 ? imagensUrl : undefined,
    );
  }

  @Delete("turistando/:turistandoId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta um único bloco Turistando pelo ID" })
  async deleteTuristando(
    @Param("turistandoId") turistandoId: string,
    @Req() req: any,
  ) {
    return this.app.deleteTuristando(turistandoId, req.user);
  }

  @Delete("turistando")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta múltiplos blocos Turistando por IDs" })
  async deleteManyTuristandos(
    @Body() body: { ids: string[] },
    @Req() req: any,
  ) {
    return this.app.deleteManyTuristandos(body.ids, req.user);
  }

  // ================= PROJETOS =================

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
      imagemUrl = await this.processarImagem(files.imagem[0], "projetos");
    }
    return this.app.addProjeto(id, dto, req.user, imagemUrl);
  }

  @Put("projeto/:projetoId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Atualiza um projeto/curso" })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "imagem", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async updateProjeto(
    @Param("projetoId") projetoId: string,
    @Body() dto: UpdateProjetoRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { imagem?: Express.Multer.File[] },
  ) {
    let imagemUrl: string | undefined;
    if (files?.imagem?.[0]) {
      imagemUrl = await this.processarImagem(files.imagem[0], "projetos");
    }
    return this.app.updateProjeto(projetoId, dto, req.user, imagemUrl);
  }

  @Delete("projeto/:projetoId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta um único projeto pelo ID" })
  async deleteProjeto(
    @Param("projetoId") projetoId: string,
    @Req() req: any,
  ) {
    return this.app.deleteProjeto(projetoId, req.user);
  }

  @Delete("projeto")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta múltiplos projetos por IDs" })
  async deleteManyProjetos(
    @Body() body: { ids: string[] },
    @Req() req: any,
  ) {
    return this.app.deleteManyProjetos(body.ids, req.user);
  }

  // ================= HELPERS PRIVADOS =================

  private async processarImagens(
    files: Express.Multer.File[] | undefined,
    subfolder: string,
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const uploadDir = `./uploads/secretaria/${subfolder}`;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const nome = `${subfolder}_${Date.now()}_${i}.webp`;
      await sharp(files[i].buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, nome));
      urls.push(`/uploads/secretaria/${subfolder}/${nome}`);
    }
    return urls;
  }

  private async processarImagem(
    file: Express.Multer.File,
    subfolder: string,
  ): Promise<string> {
    const uploadDir = `./uploads/secretaria/${subfolder}`;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const nome = `${subfolder}_${Date.now()}.webp`;
    await sharp(file.buffer)
      .resize(800)
      .webp({ quality: 80 })
      .toFile(path.join(uploadDir, nome));
    return `/uploads/secretaria/${subfolder}/${nome}`;
  }
}
