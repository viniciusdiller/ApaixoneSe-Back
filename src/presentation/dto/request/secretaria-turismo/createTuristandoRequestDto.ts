import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTuristandoRequestDto {
  @ApiProperty({
    example: "Igreja de Nossa Senhora de Nazareth",
    description: "T\u00edtulo do bloco Turistando",
  })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty({
    example: "Um dos pontos mais visitados da cidade de Saquarema...",
    description: "Texto do bloco Turistando",
  })
  @IsString()
  @IsNotEmpty()
  texto!: string;

  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    description: "M\u00faltiplas imagens do local",
  })
  imagens?: any[];
}
