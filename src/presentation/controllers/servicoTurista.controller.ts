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
        { name: "comprovante", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() dto: CreateServicoTuristaRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      foto?: Express.Multer.File[];
      comprovante?: Express.Multer.File[];
    },
  ) {
    const logoFile = files?.logo?.[0];
    const fotoFile = files?.foto?.[0];
    const comprovanteFile = files?.comprovante?.[0];

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
    if (dto.tipo !== TipoServicoTurista.ESPORTE_LAZER && !comprovanteFile) {
      throw new BadRequestException(
        "O comprovante do Cadastur (Imagem ou PDF) é obrigatório para este tipo de serviço.",
      );
    }

    // Usando o novo padrão de pastas simplificado
    const nomePastaLimpo = sanitizarNomePasta(dto.nome);
    const uploadDir = `./uploads/servico_turista/${nomePastaLimpo}`;

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let logoUrl, fotoUrl, comprovanteUrl;

    if (logoFile) {
      const logoNome = `logo.webp`;
      await sharp(logoFile.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, logoNome));
      logoUrl = `/uploads/servico_turista/${nomePastaLimpo}/${logoNome}`;
    }

    if (fotoFile) {
      const fotoNome = `foto.webp`;
      await sharp(fotoFile.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, fotoNome));
      fotoUrl = `/uploads/servico_turista/${nomePastaLimpo}/${fotoNome}`;
    }

    if (comprovanteFile) {
      const ext = path.extname(comprovanteFile.originalname).toLowerCase();

      if (ext === ".pdf") {
        const comprovanteNome = `comprovante.pdf`;
        fs.writeFileSync(
          path.join(uploadDir, comprovanteNome),
          comprovanteFile.buffer,
        );
        comprovanteUrl = `/uploads/servico_turista/${nomePastaLimpo}/${comprovanteNome}`;
      } else {
        const comprovanteNome = `comprovante.webp`;
        await sharp(comprovanteFile.buffer)
          .resize(800)
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, comprovanteNome));
        comprovanteUrl = `/uploads/servico_turista/${nomePastaLimpo}/${comprovanteNome}`;
      }
    }

    return this.app.create(dto, req.user.id, logoUrl, fotoUrl, comprovanteUrl);
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
        { name: "comprovante", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateServicoTuristaRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      foto?: Express.Multer.File[];
      comprovante?: Express.Multer.File[];
    },
  ) {
    const usuarioLogado = req.user;
    const existente = await this.app.findById(id);

    const nomePastaLimpo = sanitizarNomePasta(dto.nome || existente.nome);
    const uploadDir = `./uploads/servico_turista/${nomePastaLimpo}`;

    let logoUrl: string | undefined;
    let fotoUrl: string | undefined;
    let comprovanteUrl: string | undefined;
    const logoFile = files?.logo?.[0];
    const fotoFile = files?.foto?.[0];
    const comprovanteFile = files?.comprovante?.[0];

    if (logoFile) {
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const logoNome = `logo.webp`;
      await sharp(logoFile.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, logoNome));
      logoUrl = `/uploads/servico_turista/${nomePastaLimpo}/${logoNome}`;
    }

    if (fotoFile) {
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const fotoNome = `foto.webp`;
      await sharp(fotoFile.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, fotoNome));
      fotoUrl = `/uploads/servico_turista/${nomePastaLimpo}/${fotoNome}`;
    }

    if (comprovanteFile) {
      const ext = path.extname(comprovanteFile.originalname).toLowerCase();

      if (ext === ".pdf") {
        const comprovanteNome = `comprovante.pdf`;
        fs.writeFileSync(
          path.join(uploadDir, comprovanteNome),
          comprovanteFile.buffer,
        );
        comprovanteUrl = `/uploads/servico_turista/${nomePastaLimpo}/${comprovanteNome}`;
      } else {
        const comprovanteNome = `comprovante.webp`;
        await sharp(comprovanteFile.buffer)
          .resize(800)
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, comprovanteNome));
        comprovanteUrl = `/uploads/servico_turista/${nomePastaLimpo}/${comprovanteNome}`;
      }
    }

    return this.app.update(
      id,
      dto,
      usuarioLogado,
      logoUrl,
      fotoUrl,
      comprovanteUrl,
    );
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
