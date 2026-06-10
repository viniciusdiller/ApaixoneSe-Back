import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSecretariaRequestDto {
  @ApiProperty({
    example: "Bem-vindo \u00e0 Secretaria de Turismo de Saquarema...",
    description: "Texto explicativo institucional",
  })
  @IsString()
  @IsNotEmpty()
  textoExplicativo!: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: "Arquivo de v\u00eddeo institucional",
  })
  video?: any;
}
