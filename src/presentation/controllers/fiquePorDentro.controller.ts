import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
  BadRequestException,
  HttpCode,
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
import { SwapFiquePorDentroRequestDto } from "../dto/request/fique-por-dentro/swapFiquePorDentroRequestDto";

@ApiTags("Fique Por Dentro")
@Controller("fique-por-dentro")
export class FiquePorDentroController {
  constructor(private readonly app: FiquePorDentroApplication) {}

  // ── POST /fique-por-dentro  →  Adiciona imagem (ADMIN) ──────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adiciona uma imagem na posição indicada ("1" a "5"). Apenas Admin.' })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateFiquePorDentroRequestDto })
  @UseInterceptors(FileInterceptor("imagem", { storage: memoryStorage() }))
  async create(
    @Body() dto: CreateFiquePorDentroRequestDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('É obrigatório enviar uma imagem no campo "imagem".');
    const imagemUrl = await this.salvarImagem(file, dto.ordem);
    return this.app.create(dto.ordem, imagemUrl, req.user);
  }

  // ── GET /fique-por-dentro  →  Lista todas (público) ─────────────────────────
  @Get()
  @ApiOperation({ summary: "Retorna todas as imagens da galeria em ordem (1 a 5). Público." })
  async findAll() {
    return this.app.findAll();
  }

  // ── PUT /fique-por-dentro/swap  →  Troca ordens de dois itens (ADMIN) ────────
  // IMPORTANTE: rota estática "swap" deve vir ANTES de ":id" para não ser capturada
  @Put("swap")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Troca as posições (ordens) de dois itens atomicamente via transação. Apenas Admin.",
  })
  async swap(@Body() dto: SwapFiquePorDentroRequestDto, @Req() req: any) {
    return this.app.swap(dto.idA, dto.idB, req.user);
  }

  // ── PUT /fique-por-dentro/:id  →  Atualiza imagem de um item (ADMIN) ─────────
  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Substitui a imagem de um item pelo ID. Apenas Admin." })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("imagem", { storage: memoryStorage() }))
  async update(
    @Param("id") id: string,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const novaImagemUrl = file ? await this.salvarImagem(file, id) : undefined;
    return this.app.update(id, novaImagemUrl, req.user);
  }

  // ── DELETE /fique-por-dentro/:id  →  Remove pelo ID (ADMIN) ─────────────────
  @Delete(":id")
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove uma imagem específica da galeria pelo ID. Apenas Admin." })
  async delete(@Param("id") id: string, @Req() req: any) {
    await this.app.delete(id, req.user);
  }

  // ── Helper ───────────────────────────────────────────────────────────────────
  private async salvarImagem(file: Express.Multer.File, sufixo: string): Promise<string> {
    const uploadDir = `./uploads/fique-por-dentro`;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const nomeImagem = `imagem_${sufixo}_${Date.now()}.webp`;
    await sharp(file.buffer).resize(800).webp({ quality: 80 }).toFile(path.join(uploadDir, nomeImagem));
    return `/uploads/fique-por-dentro/${nomeImagem}`;
  }
}
