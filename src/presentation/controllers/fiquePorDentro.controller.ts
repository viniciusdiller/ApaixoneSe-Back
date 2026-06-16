import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
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
import { FiquePorDentroApplication } from "../../application/applications/fiquePorDentro.Application";
import { CreateFiquePorDentroRequestDto } from "../dto/request/fique-por-dentro/createFiquePorDentroRequestDto";

@ApiTags("Fique Por Dentro")
@Controller("fique-por-dentro")
export class FiquePorDentroController {
  constructor(private readonly app: FiquePorDentroApplication) {}

  // ──────────────────────────────────────────────────────────────────────────
  // POST /fique-por-dentro  →  Adiciona uma imagem (ADMIN)
  // ──────────────────────────────────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Adiciona uma imagem à galeria na posição indicada (ordem "1" a "5"). Apenas Admin. Retorna 409 se a posição já estiver ocupada ou se já houver 5 imagens.',
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateFiquePorDentroRequestDto })
  @UseInterceptors(FileInterceptor("imagem", { storage: memoryStorage() }))
  async create(
    @Body() dto: CreateFiquePorDentroRequestDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        "É obrigatório enviar uma imagem no campo \"imagem\".",
      );
    }

    const imagemUrl = await this.salvarImagem(file, dto.ordem);
    return this.app.create(dto.ordem, imagemUrl, req.user);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /fique-por-dentro  →  Lista todas as imagens ordenadas (público)
  // ──────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: "Retorna todas as imagens da galeria em ordem (1 a 5). Público.",
  })
  async findAll() {
    return this.app.findAll();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DELETE /fique-por-dentro/:id  →  Remove UMA imagem pelo ID (ADMIN)
  // ──────────────────────────────────────────────────────────────────────────
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Remove uma imagem específica da galeria pelo ID. Não afeta as demais imagens. Apenas Admin.",
  })
  async delete(@Param("id") id: string, @Req() req: any) {
    await this.app.delete(id, req.user);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Helper: salva imagem convertida para WebP no disco
  // ──────────────────────────────────────────────────────────────────────────
  private async salvarImagem(
    file: Express.Multer.File,
    ordem: string,
  ): Promise<string> {
    const uploadDir = `./uploads/fique-por-dentro`;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // Nome do arquivo usa a ordem para facilitar identificação: "imagem_1_timestamp.webp"
    const nomeImagem = `imagem_${ordem}_${Date.now()}.webp`;
    await sharp(file.buffer)
      .resize(800)
      .webp({ quality: 80 })
      .toFile(path.join(uploadDir, nomeImagem));

    return `/uploads/fique-por-dentro/${nomeImagem}`;
  }
}
