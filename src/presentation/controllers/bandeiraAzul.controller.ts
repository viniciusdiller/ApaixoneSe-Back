import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { BandeiraAzulApplication } from "../../application/applications/bandeiraAzul.Application";
import { SalvarBandeiraAzulRequestDto } from "../dto/request/bandeira-azul/salvarBandeiraAzulRequestDto";

const UPLOAD_DIR = "./uploads/bandeira-azul";
const MAX_MIDIA_BYTES = 30 * 1024 * 1024;
const MIMES_IMAGEM = ["image/jpeg", "image/png", "image/webp"];
const EXT_VIDEO: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/ogg": ".ogv",
};

@ApiTags("Bandeira Azul")
@Controller("bandeira-azul")
export class BandeiraAzulController {
  constructor(private readonly app: BandeiraAzulApplication) {}

  @Get()
  @ApiOperation({
    summary:
      "Retorna a página informativa da Bandeira Azul (null se ainda não publicada)",
  })
  @ApiResponse({ status: 200, description: "Página ou null." })
  async find() {
    return (await this.app.find()) ?? null;
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Salva (cria ou substitui) a página da Bandeira Azul (Administrador)",
  })
  @ApiResponse({ status: 200, description: "Página salva." })
  @ApiResponse({ status: 400, description: "Dados inválidos." })
  @ApiResponse({ status: 401, description: "Não autenticado." })
  @ApiResponse({ status: 403, description: "Apenas administradores." })
  async save(@Body() dto: SalvarBandeiraAzulRequestDto, @Req() req: any) {
    return this.app.save(dto, req.user);
  }

  @Post("midia")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary:
      "Envia uma imagem (jpg/png/webp) ou vídeo (mp4/webm/ogg, até 30MB) e devolve a URL (Administrador)",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: { arquivo: { type: "string", format: "binary" } },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Arquivo salvo.",
    schema: { example: { url: "/uploads/bandeira-azul/img_1700000000000.webp" } },
  })
  @ApiResponse({ status: 400, description: "Arquivo ausente ou formato inválido." })
  @ApiResponse({ status: 403, description: "Apenas administradores." })
  @UseInterceptors(
    FileInterceptor("arquivo", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_MIDIA_BYTES, files: 1 },
    }),
  )
  async uploadMidia(
    @UploadedFile() arquivo: Express.Multer.File | undefined,
    @Req() req: any,
  ) {
    this.app.verificarAdmin(req.user);
    if (!arquivo) throw new BadRequestException("Nenhum arquivo enviado.");

    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    // Extensão/nome definidos pelo servidor — nunca pelo nome enviado pelo cliente
    if (MIMES_IMAGEM.includes(arquivo.mimetype)) {
      const nome = `img_${Date.now()}.webp`;
      try {
        await sharp(arquivo.buffer)
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(UPLOAD_DIR, nome));
      } catch {
        throw new BadRequestException("Imagem inválida.");
      }
      return { url: `/uploads/bandeira-azul/${nome}` };
    }

    const extVideo = EXT_VIDEO[arquivo.mimetype];
    if (extVideo) {
      const nome = `video_${Date.now()}${extVideo}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, nome), arquivo.buffer);
      return { url: `/uploads/bandeira-azul/${nome}` };
    }

    throw new BadRequestException(
      "Formato inválido. Use imagem (jpg/png/webp) ou vídeo (mp4/webm/ogg).",
    );
  }
}
