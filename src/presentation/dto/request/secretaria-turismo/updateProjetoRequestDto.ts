import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateProjetoRequestDto {
  @ApiProperty({
    example: "Curso de Atendimento ao Turista",
    description: "Título do Curso/Projeto",
    required: false,
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({
    example: "Capacitação gratuita voltada para moradores locais...",
    description: "Descrição do curso",
    required: false,
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Nova imagem de capa do projeto",
    required: false,
  })
  imagem?: any;
}
