import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateFiquePorDentroRequestDto {
  @ApiPropertyOptional({
    description: 'Nova posição da imagem na galeria ("1" a "5")',
    example: "3",
  })
  @IsOptional()
  @IsString()
  ordem?: string;
}
