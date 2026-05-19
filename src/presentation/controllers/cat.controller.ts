import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
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
import { CatApplication } from "../../application/applications/cat.Application";
import { CreateCatRequestDto } from "../dto/request/cat/createCatRequestDto";
import { UpdateCatRequestDto } from "../dto/request/cat/updateCatRequestDto";

@ApiTags("CAT (Centro de Atendimento ao Turista)")
@Controller("cat")
export class CatController {
  constructor(private readonly app: CatApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Registar nova informação do CAT (Apenas Admin)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateCatRequestDto })
  @UseInterceptors(FileInterceptor("arquivo", { storage: memoryStorage() }))
  async create(
    @Body() dto: CreateCatRequestDto,
    @Req() req: any,
    @UploadedFile() arquivo?: Express.Multer.File,
  ) {
    if (!arquivo) {
      throw new BadRequestException(
        "O arquivo (mapa/informativo) é obrigatório.",
      );
    }

    // Como o CAT não tem um "nome" de estabelecimento, usamos um timestamp para garantir uma pasta única
    const nomePasta = `cat_${Date.now()}`;
    const uploadDir = `./uploads/Cat/${nomePasta}`;

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // Mantemos a extensão original enviada (ex: .pdf, .jpg)
    const extensao = path.extname(arquivo.originalname) || ".pdf";
    const nomeArquivo = `arquivo${extensao}`;
    const caminhoFisico = path.join(uploadDir, nomeArquivo);

    fs.writeFileSync(caminhoFisico, arquivo.buffer);
    const arquivoUrl = `/uploads/Cat/${nomePasta}/${nomeArquivo}`;

    return this.app.create(dto, req.user, arquivoUrl);
  }

  @Get()
  @ApiOperation({ summary: "Lista todas as informações do CAT" })
  async findAll() {
    return this.app.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca uma informação do CAT pelo ID" })
  async findById(@Param("id") id: string) {
    return this.app.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualiza uma informação do CAT (Apenas Admin)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateCatRequestDto })
  @UseInterceptors(FileInterceptor("arquivo", { storage: memoryStorage() }))
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCatRequestDto,
    @Req() req: any,
    @UploadedFile() arquivo?: Express.Multer.File,
  ) {
    let arquivoUrl: string | undefined;

    if (arquivo) {
      // Pega o caminho antigo para substituir no mesmo lugar
      const existente = await this.app.findById(id);
      let uploadDir = "";

      if (existente.arquivoUrl) {
        uploadDir = `./${path.dirname(existente.arquivoUrl)}`;
      } else {
        const nomePasta = `cat_${Date.now()}`;
        uploadDir = `./uploads/Cat/${nomePasta}`;
      }

      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const extensao = path.extname(arquivo.originalname) || ".pdf";
      const nomeArquivo = `arquivo_${Date.now()}${extensao}`; // timestamp para evitar cache no frontend
      const caminhoFisico = path.join(uploadDir, nomeArquivo);

      fs.writeFileSync(caminhoFisico, arquivo.buffer);

      // Limpar a formatação da string para gravar na DB corretamente
      arquivoUrl = `${uploadDir.replace("./", "/")}/${nomeArquivo}`;
    }

    return this.app.update(id, dto, req.user, arquivoUrl);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta uma informação do CAT (Apenas Admin)" })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.app.delete(id, req.user);
  }
}
