import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateProjetoRequestDto {
  @ApiProperty({
    example: "Curso de Atendimento ao Turista",
    description: "T\u00edtulo do Curso/Projeto",
  })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty({
    example: "Capacita\u00e7\u00e3o gratuita voltada para moradores locais...",
    description: "Descri\u00e7\u00e3o do curso",
  })
  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Imagem de capa do projeto",
  })
  imagem?: any;
}
