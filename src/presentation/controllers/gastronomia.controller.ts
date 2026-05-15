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
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { GastronomiaApplication } from "../../application/applications/gastronomia.Application";
import { CreateGastronomiaRequestDto } from "../dto/request/gastronomia/createGastronomiaRequestDto";
import { UpdateGastronomiaRequestDto } from "../dto/request/gastronomia/updateGastronomiaRequestDto";
import { GastronomiaResponseDto } from "../dto/response/gastronomiaResponse.dto";

// FUNÇÃO AUXILIAR: Transforma "Restaurante do João!" em "restaurante_do_joao"
function sanitizarNomePasta(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
}

@ApiTags("Gastronomia (Comércio)")
@Controller("gastronomia")
export class GastronomiaController {
  constructor(private readonly app: GastronomiaApplication) {}

  // ==========================================
  // 1. CREATE (POST)
  // ==========================================
  @Post()
  @ApiOperation({
    summary: "Registar novo estabelecimento (cria pasta própria)",
  })
  @ApiResponse({ status: 201, type: GastronomiaResponseDto })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateGastronomiaRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "logo", maxCount: 1 },
        { name: "documentoPdf", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() dto: CreateGastronomiaRequestDto,
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      documentoPdf?: Express.Multer.File[];
    },
  ) {
    // 1. EXTRAÇÃO DIRETA: Tentamos pegar logo o ficheiro na posição [0]
    const logoFile = files?.logo?.[0];
    const pdfFile = files?.documentoPdf?.[0];

    // 2. VERIFICAÇÃO DIRETA: Se o ficheiro não existir, barramos!
    if (!logoFile || !pdfFile) {
      throw new BadRequestException(
        "É obrigatório enviar o logótipo e o documento em PDF.",
      );
    }

    // A partir daqui, o TypeScript JÁ SABE que logoFile e pdfFile existem e têm o ".buffer".
    const nomePastaLimpo = sanitizarNomePasta(dto.nome);
    const uploadDir = `./uploads/gastronomia/${nomePastaLimpo}`;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const logoNome = `logo.webp`;
    const logoCaminhoFisico = path.join(uploadDir, logoNome);
    await sharp(logoFile.buffer)
      .resize(500)
      .webp({ quality: 80 })
      .toFile(logoCaminhoFisico);

    const pdfNome = `documento.pdf`;
    const pdfCaminhoFisico = path.join(uploadDir, pdfNome);
    fs.writeFileSync(pdfCaminhoFisico, pdfFile.buffer);

    const logoUrl = `/uploads/gastronomia/${nomePastaLimpo}/${logoNome}`;
    const pdfUrl = `/uploads/gastronomia/${nomePastaLimpo}/${pdfNome}`;

    return this.app.create(dto, logoUrl, pdfUrl);
  }

  // ==========================================
  // 2. READ (GET)
  // ==========================================
  @Get()
  @ApiOperation({ summary: "Lista todos os estabelecimentos" })
  @ApiResponse({ status: 200, type: [GastronomiaResponseDto] })
  async findAll() {
    return this.app.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca um estabelecimento pelo ID" })
  async findById(@Param("id") id: string) {
    return this.app.findById(id);
  }

  // ==========================================
  // 3. UPDATE (PUT)
  // ==========================================
  @Put(":id")
  @ApiOperation({
    summary: "Atualiza um estabelecimento (Ficheiros são opcionais)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateGastronomiaRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "logo", maxCount: 1 },
        { name: "documentoPdf", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateGastronomiaRequestDto,
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      documentoPdf?: Express.Multer.File[];
    },
  ) {
    const existente = await this.app.findById(id);
    const nomePastaLimpo = sanitizarNomePasta(dto.nome || existente.nome);
    const uploadDir = `./uploads/gastronomia/${nomePastaLimpo}`;

    let logoUrl: string | undefined;
    let pdfUrl: string | undefined;

    // Tentamos extrair os ficheiros
    const logoFile = files?.logo?.[0];
    const pdfFile = files?.documentoPdf?.[0];

    // Se a variável logoFile tem algo, nós usamos o buffer dela
    if (logoFile) {
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const logoNome = `logo_${Date.now()}.webp`;
      await sharp(logoFile.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, logoNome));
      logoUrl = `/uploads/gastronomia/${nomePastaLimpo}/${logoNome}`;
    }

    // Se a variável pdfFile tem algo, nós usamos o buffer dela
    if (pdfFile) {
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const pdfNome = `documento_${Date.now()}.pdf`;
      fs.writeFileSync(path.join(uploadDir, pdfNome), pdfFile.buffer);
      pdfUrl = `/uploads/gastronomia/${nomePastaLimpo}/${pdfNome}`;
    }

    return this.app.update(id, dto, logoUrl, pdfUrl);
  }

  // ==========================================
  // 4. DELETE (DELETE)
  // ==========================================
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Deleta um estabelecimento" })
  @ApiResponse({ status: 204, description: "Deletado com sucesso" })
  async delete(@Param("id") id: string) {
    return this.app.delete(id);
  }
}
