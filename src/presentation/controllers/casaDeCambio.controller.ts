import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { CasaDeCambioApplication } from "../../application/applications/casaDeCambio.Application";
import { CreateCasaDeCambioRequestDto } from "../dto/request/casa-de-cambio/createCasaDeCambioRequestDto";
import { UpdateCasaDeCambioRequestDto } from "../dto/request/casa-de-cambio/updateCasaDeCambioRequestDto";

function sanitizarNomePasta(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
}

@ApiTags("Casa de Câmbio")
@Controller("casa-de-cambio")
export class CasaDeCambioController {
  constructor(private readonly app: CasaDeCambioApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cria uma Casa de Câmbio (Apenas Admin)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateCasaDeCambioRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "logo", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() dto: CreateCasaDeCambioRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { logo?: Express.Multer.File[] },
  ) {
    const file = files?.logo?.[0];
    const logoUrl = file
      ? await this.salvarLogoCasaDeCambio(file, dto.nome!)
      : undefined;

    return this.app.create(dto, req.user, logoUrl);
  }

  @Get()
  @ApiOperation({ summary: "Lista todas as Casas de Câmbio" })
  async findAll() {
    return this.app.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca uma Casa de Câmbio pelo ID" })
  async findById(@Param("id") id: string) {
    return this.app.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualiza uma Casa de Câmbio (Apenas Admin)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateCasaDeCambioRequestDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "logo", maxCount: 1 }], {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCasaDeCambioRequestDto,
    @Req() req: any,
    @UploadedFiles() files?: { logo?: Express.Multer.File[] },
  ) {
    const file = files?.logo?.[0];

    const casaExistente = file ? await this.app.findById(id) : null;
    const nomeCasa = dto.nome ?? casaExistente?.nome;

    const logoUrl =
      file && nomeCasa
        ? await this.salvarLogoCasaDeCambio(file, nomeCasa)
        : undefined;

    return this.app.update(id, dto, req.user, logoUrl);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta uma Casa de Câmbio (Apenas Admin)" })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.app.delete(id, req.user);
  }

  private async salvarLogoCasaDeCambio(
    file: Express.Multer.File,
    nomeCasa: string,
  ): Promise<string> {
    const pastaCasa = sanitizarNomePasta(nomeCasa);
    const uploadDir = path.join("./public/casa-de-cambio", pastaCasa);

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const nomeArquivo = `logo_${Date.now()}.webp`;

    await sharp(file.buffer)
      .resize(600)
      .webp({ quality: 85 })
      .toFile(path.join(uploadDir, nomeArquivo));

    return `/public/casa-de-cambio/${pastaCasa}/${nomeArquivo}`;
  }
}
