import { PartialType, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateCatRequestDto } from "./createCatRequestDto";

export class UpdateCatRequestDto extends PartialType(CreateCatRequestDto) {
  @ApiPropertyOptional({
    type: "string",
    description:
      'JSON com a ordem final das imagens: cada item é a URL de uma imagem existente mantida, ou o marcador "__new__" na posição de cada novo arquivo enviado (na ordem em que foram anexados no campo "imagens"). Imagens existentes ausentes da lista são removidas.',
  })
  @IsOptional()
  @IsString()
  ordem?: string;
}
