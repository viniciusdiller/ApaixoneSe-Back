import { NormalizeMultipartText } from "../../decorators/normalizeMultipartText.decorator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCatMovelRequestDto {
  @ApiProperty({
    description: "Título do card do CAT Móvel",
    example: "Visita ao Museu Histórico",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150, { message: "O título deve ter no máximo 150 caracteres." })
  titulo!: string;

  @ApiProperty({
    description: "Descrição do card do CAT Móvel",
    example: "Conheça a história da nossa cidade através do acervo do museu.",
  })
  @IsString()
  @IsNotEmpty()
  @NormalizeMultipartText()
  @MaxLength(1000, {
    message: "A descrição deve ter no máximo 5000 caracteres.",
  })
  descricao!: string;

  @ApiPropertyOptional({
    type: "string",
    format: "binary",
    description: "Imagem do card (envie imagem OU vídeo, não ambos). Será convertida para WebP.",
  })
  imagem?: Express.Multer.File;

  @ApiPropertyOptional({
    type: "string",
    format: "binary",
    description: "Vídeo do card (envie imagem OU vídeo, não ambos). Formatos: mp4, mov, webm.",
  })
  video?: Express.Multer.File;

  @ApiPropertyOptional({
    type: "array",
    items: { type: "string", format: "binary" },
    description: "Galeria de imagens exibida em carrossel ao lado da mídia principal.",
  })
  @IsOptional()
  imagens?: any[];

  @ApiPropertyOptional({
    type: "string",
    description: "JSON com a ordem das imagens enviadas (ignorado na criação — sem imagens existentes para reordenar).",
  })
  @IsOptional()
  @IsString()
  ordem?: string;
}
