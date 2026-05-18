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
import { HospedagemApplication } from "../../application/applications/hospedagem.Application";
import { CreateHospedagemRequestDto } from "../dto/request/hospedagem/createHospedagemRequestDto";
import { UpdateHospedagemRequestDto } from "../dto/request/hospedagem/updateHospedagemRequestDto";
import { HospedagemResponseDto } from "../dto/response/hospedagemResponse.dto";

function sanitizarNomePasta(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
}

@ApiTags("Hospedagem")
@Controller("hospedagem")
export class HospedagemController {
  constructor(private readonly app: HospedagemApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Registar nova hospedagem" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateHospedagemRequestDto })
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
    @Body() dto: CreateHospedagemRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      documentoPdf?: Express.Multer.File[];
    },
  ) {
    const logoFile = files?.logo?.[0];
    const pdfFile = files?.documentoPdf?.[0];
    if (!logoFile || !pdfFile)
      throw new BadRequestException("Logo e PDF são obrigatórios.");

    const nomePastaLimpo = sanitizarNomePasta(dto.nome);
    // PASTAS DA HOSPEDAGEM
    const uploadDir = `./uploads/hospedagem/${nomePastaLimpo}`;
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const logoNome = `logo.webp`;
    await sharp(logoFile.buffer)
      .resize(500)
      .webp({ quality: 80 })
      .toFile(path.join(uploadDir, logoNome));
    const pdfNome = `documento.pdf`;
    fs.writeFileSync(path.join(uploadDir, pdfNome), pdfFile.buffer);

    const logoUrl = `/uploads/hospedagem/${nomePastaLimpo}/${logoNome}`;
    const pdfUrl = `/uploads/hospedagem/${nomePastaLimpo}/${pdfNome}`;

    return this.app.create(dto, req.user.id, logoUrl, pdfUrl);
  }

  // ==========================================
  // 2. READ (GET)
  // ==========================================
  @Get()
  @ApiOperation({ summary: "Lista todos as Hospedagens" })
  @ApiResponse({ status: 200, type: [HospedagemResponseDto] })
  async findAll() {
    return this.app.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca uma hospedagem pelo ID" })
  async findById(@Param("id") id: string) {
    return this.app.findById(id);
  }

  // ==========================================
  // 3. UPDATE (PUT)
  // ==========================================
  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Atualiza uma hospedagem",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateHospedagemRequestDto })
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
    @Body()
    dto: UpdateHospedagemRequestDto,
    @Req() req: any,
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      documentoPdf?: Express.Multer.File[];
    },
  ) {
    const usuarioLogado = req.user;

    const existente = await this.app.findById(id);
    const nomePastaLimpo = sanitizarNomePasta(dto.nome || existente.nome);
    const uploadDir = `./uploads/hospedagem/${nomePastaLimpo}`;

    let logoUrl: string | undefined;
    let pdfUrl: string | undefined;

    // Tentamos extrair os ficheiros
    const logoFile = files?.logo?.[0];
    const pdfFile = files?.documentoPdf?.[0];

    // Se a variável logoFile tem algo, nós usamos o buffer dela
    if (logoFile) {
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const logoNome = `logo.webp`;
      await sharp(logoFile.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, logoNome));
      logoUrl = `/uploads/hospedagem/${nomePastaLimpo}/${logoNome}`;
    }

    // Se a variável pdfFile tem algo, nós usamos o buffer dela
    if (pdfFile) {
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const pdfNome = `documento.pdf`;
      fs.writeFileSync(path.join(uploadDir, pdfNome), pdfFile.buffer);
      pdfUrl = `/uploads/hospedagem/${nomePastaLimpo}/${pdfNome}`;
    }

    return this.app.update(id, dto, usuarioLogado, logoUrl, pdfUrl);
  }

  // ==========================================
  // 4. DELETE (DELETE)
  // ==========================================
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta uma hospedagem" })
  @ApiResponse({ status: 204, description: "Deletado com sucesso" })
  async delete(@Param("id") id: string, @Req() req: any) {
    const usuarioLogado = req.user;
    return this.app.delete(id, usuarioLogado);
  }
}
