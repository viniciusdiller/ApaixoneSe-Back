import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsUrl } from "class-validator";

export class UpdateImagemMesDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "A imagem da capa do mês",
  })
  file!: any;
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: "Deve ser uma URL válida (http/https)" })
  imagemUrl!: string;
}
