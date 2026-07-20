import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateLocalCulturalRequestDto {
  @ApiProperty({
    example: "Igreja de Nossa Senhora de Nazareth",
    description: "Nome do local cultural",
  })
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório." })
  nome!: string;

  @ApiProperty({
    example:
      "Erguida no século XVII, é o principal marco histórico da cidade.",
    description: "Descrição curta exibida no card",
  })
  @IsString()
  @IsNotEmpty({ message: "A descrição é obrigatória." })
  descricao!: string;

  @ApiProperty({
    example: "A Igreja de Nossa Senhora de Nazareth é muito mais do que...",
    description: "Texto completo exibido ao abrir os detalhes do local",
  })
  @IsString()
  @IsNotEmpty({ message: "O texto é obrigatório." })
  texto!: string;

  @ApiPropertyOptional({
    type: "string",
    format: "binary",
    description: 'Imagem do local, enviada no campo "imagem"',
  })
  imagem?: any;

  @ApiPropertyOptional({ example: "Rua Principal, 123 - Centro, Saquarema - RJ" })
  @IsOptional()
  @IsString()
  endereco?: string;
}
