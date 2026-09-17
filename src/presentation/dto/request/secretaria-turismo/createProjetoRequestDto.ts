import { NormalizeMultipartText } from "../../decorators/normalizeMultipartText.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateProjetoRequestDto {
  @ApiProperty({
    example: "Curso de Atendimento ao Turista",
    description: "T\u00edtulo do Curso/Projeto",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150, { message: "O título deve ter no máximo 150 caracteres." })
  titulo!: string;

  @ApiProperty({
    example: "Capacita\u00e7\u00e3o gratuita voltada para moradores locais...",
    description: "Descri\u00e7\u00e3o do curso",
  })
  @IsString()
  @IsNotEmpty()
  @NormalizeMultipartText()
  @MaxLength(1000, {
    message: "A descrição deve ter no máximo 3000 caracteres.",
  })
  descricao!: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Imagem de capa do projeto",
  })
  imagem?: any;
}
