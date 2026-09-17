import { NormalizeMultipartText } from "../../decorators/normalizeMultipartText.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateSecretariaRequestDto {
  @ApiProperty({
    example: "Bem-vindo \u00e0 Secretaria de Turismo de Saquarema...",
    description: "Texto explicativo institucional",
  })
  @IsString()
  @IsNotEmpty()
  @NormalizeMultipartText()
  @MaxLength(2000, {
    message: "O texto explicativo deve ter no máximo 5000 caracteres.",
  })
  textoExplicativo!: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: "Arquivo de v\u00eddeo institucional",
  })
  video?: any;
}
