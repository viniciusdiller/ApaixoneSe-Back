import { NormalizeMultipartText } from "../../decorators/normalizeMultipartText.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateSecretariaRequestDto {
  @ApiProperty({
    example: "Bem-vindo à Secretaria de Turismo de Saquarema...",
    description: "Texto explicativo institucional",
    required: false,
  })
  @IsString()
  @IsOptional()
  @NormalizeMultipartText()
  @MaxLength(2000, {
    message: "O texto explicativo deve ter no máximo 5000 caracteres.",
  })
  textoExplicativo?: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: "Arquivo de vídeo institucional",
  })
  video?: any;
}
