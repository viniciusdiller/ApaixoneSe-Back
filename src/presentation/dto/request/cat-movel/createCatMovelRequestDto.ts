import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCatMovelRequestDto {
  @ApiProperty({
    description: "Título do card do CAT Móvel",
    example: "Visita ao Museu Histórico",
  })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty({
    description: "Descrição do card do CAT Móvel",
    example: "Conheça a história da nossa cidade através do acervo do museu.",
  })
  @IsString()
  @IsNotEmpty()
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
}
