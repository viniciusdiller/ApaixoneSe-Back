import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { TipoPontoAgua } from "@prisma/client";

export class CreatePontoAguaRequestDto {
  @ApiProperty({ enum: TipoPontoAgua, example: TipoPontoAgua.PRAIA })
  @IsEnum(TipoPontoAgua, { message: "Tipo inválido. Escolha PRAIA ou LAGOA." })
  @IsNotEmpty({ message: "O tipo é obrigatório." })
  tipo!: TipoPontoAgua;

  @ApiProperty({ example: "Praia de Itaúna" })
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório." })
  nome!: string;

  @ApiProperty({
    example: "Pico clássico da WSL com ondas de classe mundial.",
    description: "Descrição curta exibida nos cards",
  })
  @IsString()
  @IsNotEmpty({ message: "A descrição curta é obrigatória." })
  descricaoCurta!: string;

  @ApiProperty({
    example:
      "Itaúna é referência internacional do esporte brasileiro, com ondas constantes durante todo o ano.",
    description: "Descrição completa exibida na página de detalhes",
  })
  @IsString()
  @IsNotEmpty({ message: "A descrição é obrigatória." })
  descricao!: string;

  @ApiPropertyOptional({
    type: "string",
    description:
      'JSON com a lista de filtros/tags, ex: ["surf","bandeira azul"]',
  })
  @IsOptional()
  @IsString()
  filtros?: string;

  @ApiPropertyOptional({ example: "true" })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  acessivel?: boolean;

  @ApiPropertyOptional({
    example: "iniciante",
    description:
      "Dificuldade de surf: iniciante, intermediário ou avançado.",
  })
  @IsOptional()
  @IsString()
  dificuldade?: string;

  @ApiPropertyOptional({ example: "Rua Principal, 123 - Centro, Saquarema - RJ" })
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional({ example: "true" })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  estacionamento?: boolean;

  @ApiPropertyOptional({ example: "true" })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  quiosques?: boolean;

  @ApiPropertyOptional({ example: -22.9358 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "A latitude deve ser um número válido." })
  latitude?: number;

  @ApiPropertyOptional({ example: -42.4779 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "A longitude deve ser um número válido." })
  longitude?: number;

  @ApiPropertyOptional({
    type: "string",
    format: "binary",
    description: 'Imagem principal, enviada no campo "imagem"',
  })
  imagem?: any;
}
