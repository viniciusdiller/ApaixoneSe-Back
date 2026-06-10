import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateProjetoRequestDto {
  @ApiProperty({
    example: "Curso de Atendimento ao Turista",
    description: "Título do Curso/Projeto",
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    example: "Capacitação gratuita voltada para moradores locais...",
    description: "Descrição do curso",
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Imagem de capa do projeto",
  })
  imagem?: any;
}
