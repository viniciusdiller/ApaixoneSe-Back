import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsUrl } from "class-validator";

export class UpdateImagemMesDto {
  @ApiProperty({ example: "https://meusite.com/imagens/capa-abril.jpg" })
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: "Deve ser uma URL válida (http/https)" })
  imagemUrl!: string;
}
