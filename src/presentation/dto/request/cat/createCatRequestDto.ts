import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCatRequestDto {
  @ApiProperty({ description: "Texto informativo do CAT" })
  @IsString()
  @IsNotEmpty()
  texto!: string;

  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    description: "Múltiplas imagens para a galeria do CAT",
    required: false,
  })
  @IsOptional()
  imagens?: any[];

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Vídeo do CAT (.mp4, .mov)",
    required: false,
  })
  @IsOptional()
  video?: any;
}
