import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateSecretariaRequestDto {
  @ApiProperty({
    example: "Bem-vindo à Secretaria de Turismo de Saquarema...",
    description: "Texto explicativo institucional",
    required: false,
  })
  @IsString()
  @IsOptional()
  textoExplicativo?: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: "Arquivo de vídeo institucional",
  })
  video?: any;
}
