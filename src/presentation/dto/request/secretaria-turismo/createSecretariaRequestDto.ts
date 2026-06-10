import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSecretariaRequestDto {
  @ApiProperty({
    example: "Bem-vindo à Secretaria de Turismo de Saquarema...",
    description: "Texto explicativo institucional",
  })
  @IsString()
  @IsNotEmpty()
  textoExplicativo: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: "Arquivo de vídeo institucional",
  })
  video?: any;
}
