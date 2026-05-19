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
  BadRequestException,
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
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { memoryStorage } from "multer";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { ServicoTuristaApplication } from "../../application/applications/servicoTurista.Application";
import { CreateServicoTuristaRequestDto } from "../dto/request/servico-turista/createServicoTuristaRequestDto";
import { UpdateServicoTuristaRequestDto } from "../dto/request/servico-turista/updateServicoTuristaRequestDto";
import { TipoServicoTurista } from "@prisma/client";

function sanitizarNomePasta(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
}

function obterNomeSubPasta(tipo: TipoServicoTurista): string {
  switch (tipo) {
    case TipoServicoTurista.GUIA_TURISMO:
      return "Guias de Turismo";
    case TipoServicoTurista.AGENCIA_TURISMO:
      return "Agencias de Turismo";
    case TipoServicoTurista.ESPORTE_LAZER:
      return "Esporte e Lazer";
    case TipoServicoTurista.LOCADORA_VEICULOS:
      return "Locadora de Veiculos";
    default:
      return "Outros";
  }
}

@ApiTags("Serviços para o Turista")
@Controller("servico-turista")
export class ServicoTuristaController {
  constructor(private readonly app: ServicoTuristaApplication) {}

  // ==========================================
  // 1. CREATE (POST)
  // ==========================================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Registar novo Serviço (Guia, Agência, Esporte ou Locadora)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateServicoTuristaRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "logo", maxCount: 1 },
        { name: "foto", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() dto: CreateServicoTuristaRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { logo?: Express.Multer.File[]; foto?: Express.Multer.File[] },
  ) {
    const logoFile = files?.logo?.[0];
    const fotoFile = files?.foto?.[0];

    if (dto.tipo === TipoServicoTurista.GUIA_TURISMO && !fotoFile) {
      throw new BadRequestException(
        "A foto é obrigatória para Guias de Turismo.",
      );
    }
    if (dto.tipo !== TipoServicoTurista.GUIA_TURISMO && !logoFile) {
      throw new BadRequestException(
        "A logo é obrigatória para este tipo de serviço.",
      );
    }

    const subPasta = obterNomeSubPasta(dto.tipo);
    const nomePastaLimpo = sanitizarNomePasta(dto.nome);

    const uploadDir = `./uploads/Servico_Turista/${subPasta}/${nomePastaLimpo}`;

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let logoUrl, fotoUrl;

    if (logoFile) {
      const logoNome = `logo.webp`;
      await sharp(logoFile.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, logoNome));
      logoUrl = `/uploads/Servico_Turista/${subPasta}/${nomePastaLimpo}/${logoNome}`;
    }

    if (fotoFile) {
      const fotoNome = `foto.webp`;
      await sharp(fotoFile.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, fotoNome));
      fotoUrl = `/uploads/Servico_Turista/${subPasta}/${nomePastaLimpo}/${fotoNome}`;
    }

    return this.app.create(dto, req.user.id, logoUrl, fotoUrl);
  }

  // ==========================================
  // 2. READ (GET)
  // ==========================================
  @Get()
  @ApiOperation({ summary: "Lista todos os Serviços para Turistas" })
  async findAll() {
    return this.app.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca um serviço pelo ID" })
  async findById(@Param("id") id: string) {
    return this.app.findById(id);
  }

  // ==========================================
  // 3. UPDATE (PUT)
  // ==========================================
  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualiza um Serviço (Ficheiros são opcionais)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateServicoTuristaRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "logo", maxCount: 1 },
        { name: "foto", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateServicoTuristaRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { logo?: Express.Multer.File[]; foto?: Express.Multer.File[] },
  ) {
    const usuarioLogado = req.user;

    // Precisamos do existente para saber qual é o tipo (Agência, Guia, etc.)
    // e garantir que salvamos a imagem na subpasta correta
    const existente = await this.app.findById(id);

    const subPasta = obterNomeSubPasta(existente.tipo);
    const nomePastaLimpo = sanitizarNomePasta(dto.nome || existente.nome);
    const uploadDir = `./uploads/Servico_Turista/${subPasta}/${nomePastaLimpo}`;

    let logoUrl: string | undefined;
    let fotoUrl: string | undefined;

    const logoFile = files?.logo?.[0];
    const fotoFile = files?.foto?.[0];

    if (logoFile) {
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const logoNome = `logo.webp`;
      await sharp(logoFile.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, logoNome));
      logoUrl = `/uploads/Servico_Turista/${subPasta}/${nomePastaLimpo}/${logoNome}`;
    }

    if (fotoFile) {
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const fotoNome = `foto.webp`;
      await sharp(fotoFile.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, fotoNome));
      fotoUrl = `/uploads/Servico_Turista/${subPasta}/${nomePastaLimpo}/${fotoNome}`;
    }

    return this.app.update(id, dto, usuarioLogado, logoUrl, fotoUrl);
  }

  // ==========================================
  // 4. DELETE
  // ==========================================
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta um serviço" })
  @ApiResponse({ status: 204, description: "Deletado com sucesso" })
  async delete(@Param("id") id: string, @Req() req: any) {
    const usuarioLogado = req.user;
    return this.app.delete(id, usuarioLogado);
  }
}
