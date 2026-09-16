import { Type } from "class-transformer";
import { NormalizeMultipartText } from "../../decorators/normalizeMultipartText.decorator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsInt, MaxLength } from "class-validator";

export class CreateTuristandoRequestDto {
  @ApiProperty({
    example: "Igreja de Nossa Senhora de Nazareth",
    description: "T\u00edtulo do bloco Turistando",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150, { message: "O título deve ter no máximo 150 caracteres." })
  titulo!: string;

  @ApiProperty({
    example: "Um dos pontos mais visitados da cidade de Saquarema...",
    description: "Texto do bloco Turistando",
  })
  @IsString()
  @IsNotEmpty()
  @NormalizeMultipartText()
  @MaxLength(1000, { message: "O texto deve ter no máximo 3000 caracteres." })
  texto!: string;

  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    description: "M\u00faltiplas imagens do local",
  })
  imagens?: any[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({
    example: 1,
    description: "Ordem do bloco Turistando",
  })
  ordem?: number;
}
