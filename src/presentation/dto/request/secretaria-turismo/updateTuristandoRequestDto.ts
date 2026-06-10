import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateTuristandoRequestDto {
  @ApiProperty({
    example: "Igreja de Nossa Senhora de Nazareth",
    description: "Título do bloco Turistando",
    required: false,
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({
    example: "Um dos pontos mais visitados da cidade de Saquarema...",
    description: "Texto do bloco Turistando",
    required: false,
  })
  @IsString()
  @IsOptional()
  texto?: string;

  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    description: "Novas imagens do local (substitui as anteriores)",
    required: false,
  })
  imagens?: any[];
}
