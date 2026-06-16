import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class CreateFiquePorDentroRequestDto {
  @ApiProperty({
    description:
      'Posição da imagem na galeria. Deve ser um número de 1 a 5 (como texto: "1", "2", "3", "4" ou "5").',
    example: "1",
  })
  @IsString()
  @IsNotEmpty()
  ordem!: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Arquivo de imagem (jpg, png, webp, etc.)",
  })
  imagem!: any;
}
