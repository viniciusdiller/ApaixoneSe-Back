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
import { ServicoTuristaApplication } from "../../application/applications/servicoTurista.Application";
import { CreateServicoTuristaRequestDto } from "../dto/request/servico-turista/createServicoTuristaRequestDto";
import { UpdateServicoTuristaRequestDto } from "../dto/request/servico-turista/updateServicoTuristaRequestDto";
import { TipoServicoTurista } from "@prisma/client";
import {
  ArquivoPreparado,
  prepararImagemWebp,
  prepararImagemOuPdf,
  gravarArquivos,
  removerArquivos,
} from "../helpers/upload.helper";

function sanitizarNomePasta(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
}

interface ArquivosServicoTurista {
  logo?: Express.Multer.File[];
  foto?: Express.Multer.File[];
  comprovante?: Express.Multer.File[];
  documentoCnpj?: Express.Multer.File[];
}

interface ResultadoPreparoArquivos {
  arquivos: ArquivoPreparado[];
  logoUrl?: string;
  fotoUrl?: string;
  comprovanteUrl?: string;
  documentoCnpjUrl?: string;
}

async function prepararArquivosServicoTurista(
  nomePastaLimpo: string,
  files?: ArquivosServicoTurista,
): Promise<ResultadoPreparoArquivos> {
  const logoFile = files?.logo?.[0];
  const fotoFile = files?.foto?.[0];
  const comprovanteFile = files?.comprovante?.[0];
  const documentoCnpjFile = files?.documentoCnpj?.[0];

  const baseUrl = `/uploads/servico_turista/${nomePastaLimpo}`;
  const arquivos: ArquivoPreparado[] = [];
  let logoUrl: string | undefined;
  let fotoUrl: string | undefined;
  let comprovanteUrl: string | undefined;
  let documentoCnpjUrl: string | undefined;

  if (logoFile) {
    const prep = await prepararImagemWebp(logoFile, "Logo", "logo", 500);
    arquivos.push(prep);
    logoUrl = `${baseUrl}/${prep.nomeArquivo}`;
  }

  if (fotoFile) {
    const prep = await prepararImagemWebp(fotoFile, "Foto", "foto", 500);
    arquivos.push(prep);
    fotoUrl = `${baseUrl}/${prep.nomeArquivo}`;
  }

  if (comprovanteFile) {
    const prep = await prepararImagemOuPdf(
      comprovanteFile,
      "Comprovante Cadastur",
      "comprovante",
      800,
    );
    arquivos.push(prep);
    comprovanteUrl = `${baseUrl}/${prep.nomeArquivo}`;
  }

  if (documentoCnpjFile) {
    const prep = await prepararImagemOuPdf(
      documentoCnpjFile,
      "Documento do CNPJ",
      "documento_cnpj",
      800,
    );
    arquivos.push(prep);
    documentoCnpjUrl = `${baseUrl}/${prep.nomeArquivo}`;
  }

  return { arquivos, logoUrl, fotoUrl, comprovanteUrl, documentoCnpjUrl };
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
    summary: "Registra novo Serviço (Guia, Agência, Esporte ou Locadora)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateServicoTuristaRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "logo", maxCount: 1 },
        { name: "foto", maxCount: 1 },
        { name: "comprovante", maxCount: 1 },
        { name: "documentoCnpj", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() dto: CreateServicoTuristaRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: ArquivosServicoTurista,
  ) {
    const logoFile = files?.logo?.[0];
    const fotoFile = files?.foto?.[0];
    const comprovanteFile = files?.comprovante?.[0];
    const documentoCnpjFile = files?.documentoCnpj?.[0];

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
        "O comprovante do Cadastur (PDF ou imagem JPG, PNG ou WEBP) é obrigatório para este tipo de serviço.",
      );
    }
    if (dto.tipo === TipoServicoTurista.ESPORTE_LAZER && !documentoCnpjFile) {
      throw new BadRequestException(
        "O documento do CNPJ (PDF ou imagem JPG, PNG ou WEBP) é obrigatório para Esporte/Lazer.",
      );
    }

    const nomePastaLimpo = sanitizarNomePasta(dto.nome);
    const uploadDir = `./uploads/servico_turista/${nomePastaLimpo}`;

    // 1. Valida e converte TODOS os arquivos em memória antes de tocar no disco
    const { arquivos, logoUrl, fotoUrl, comprovanteUrl, documentoCnpjUrl } =
      await prepararArquivosServicoTurista(nomePastaLimpo, files);

    // 2. Grava de forma atômica (cria a pasta se não existir)
    const caminhosGravados = gravarArquivos(uploadDir, arquivos);

    try {
      return await this.app.create(
        dto,
        req.user.id,
        logoUrl,
        fotoUrl,
        comprovanteUrl,
        documentoCnpjUrl,
      );
    } catch (err) {
      removerArquivos(caminhosGravados);
      throw err;
    }
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
        { name: "documentoCnpj", maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateServicoTuristaRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: ArquivosServicoTurista,
  ) {
    const usuarioLogado = req.user;

    // 1. Checa existência e permissão ANTES de processar ou gravar arquivos
    const existente = await this.app.obterExistenteAutorizadoParaEdicao(
      id,
      usuarioLogado,
      dto.status,
    );

    const nomePastaLimpo = sanitizarNomePasta(dto.nome || existente.nome);
    const uploadDir = `./uploads/servico_turista/${nomePastaLimpo}`;

    // 2. Valida e converte TODOS os arquivos em memória antes de tocar no disco
    const { arquivos, logoUrl, fotoUrl, comprovanteUrl, documentoCnpjUrl } =
      await prepararArquivosServicoTurista(nomePastaLimpo, files);

    // 3. Grava de forma atômica (garante criação da pasta também para comprovante)
    const caminhosGravados = gravarArquivos(uploadDir, arquivos);

    try {
      return await this.app.update(
        id,
        dto,
        usuarioLogado,
        logoUrl,
        fotoUrl,
        comprovanteUrl,
        documentoCnpjUrl,
      );
    } catch (err) {
      removerArquivos(caminhosGravados);
      throw err;
    }
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
