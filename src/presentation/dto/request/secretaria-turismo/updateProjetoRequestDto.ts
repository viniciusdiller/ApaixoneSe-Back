import { NormalizeMultipartText } from "../../decorators/normalizeMultipartText.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProjetoRequestDto {
  @ApiProperty({
    example: "Curso de Atendimento ao Turista",
    description: "Título do Curso/Projeto",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(150, { message: "O título deve ter no máximo 150 caracteres." })
  titulo?: string;

  @ApiProperty({
    example: "Capacitação gratuita voltada para moradores locais...",
    description: "Descrição do curso",
    required: false,
  })
  @IsString()
  @IsOptional()
  @NormalizeMultipartText()
  @MaxLength(1000, {
    message: "A descrição deve ter no máximo 3000 caracteres.",
  })
  descricao?: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Nova imagem de capa do projeto",
    required: false,
  })
  imagem?: any;
}
