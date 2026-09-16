import { NormalizeMultipartText } from "../../decorators/normalizeMultipartText.decorator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCatMovelRequestDto {
  @ApiPropertyOptional({
    description: "Novo título do card",
    example: "Passeio de Barco",
  })
  @IsString()
  @IsOptional()
  @MaxLength(150, { message: "O título deve ter no máximo 150 caracteres." })
  titulo?: string;

  @ApiPropertyOptional({
    description: "Nova descrição do card",
    example: "Explore os rios da região em um passeio inesquecível.",
  })
  @IsString()
  @IsOptional()
  @NormalizeMultipartText()
  @MaxLength(1000, {
    message: "A descrição deve ter no máximo 5000 caracteres.",
  })
  descricao?: string;

  @ApiPropertyOptional({
    type: "string",
    format: "binary",
    description: "Nova imagem do card (substitui a mídia anterior). Envie imagem OU vídeo, não ambos.",
  })
  imagem?: Express.Multer.File;

  @ApiPropertyOptional({
    type: "string",
    format: "binary",
    description: "Novo vídeo do card (substitui a mídia anterior). Envie imagem OU vídeo, não ambos.",
  })
  video?: Express.Multer.File;

  @ApiPropertyOptional({
    type: "array",
    items: { type: "string", format: "binary" },
    description: "Novas imagens a adicionar à galeria.",
  })
  @IsOptional()
  imagens?: any[];

  @ApiPropertyOptional({
    type: "string",
    description:
      'JSON com a ordem final das imagens da galeria: cada item é a URL de uma imagem existente mantida, ou o marcador "__new__" na posição de cada novo arquivo enviado (na ordem em que foram anexados no campo "imagens"). Imagens existentes ausentes da lista são removidas.',
  })
  @IsOptional()
  @IsString()
  ordem?: string;
}
