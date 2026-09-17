import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MaxLength,
} from "class-validator";
import { OnlyDigits } from "../../decorators/onlyDigits.decorator";

export class CreateGastronomiaRequestDto {
  @ApiProperty({ example: "Vinecao Restaurante" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120, {
    message: "O nome informado é muito longo.",
  })
  nome!: string;

  @ApiProperty({ example: "2299938764" })
  @OnlyDigits()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, {
    message: "O telefone informado é muito longo.",
  })
  telefone!: string;

  @ApiProperty({ required: false, example: "vineco" })
  @IsString()
  @IsOptional()
  @MaxLength(31, {
    message: "O Instagram informado é muito longo.",
  })
  instagram?: string;

  @ApiProperty({
    example: "2027-12-31T23:59:59Z",
    description: "Data de validade (Apenas Admin)",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  validade?: string;

  @ApiProperty({ example: "Rua Jaime Warde de Carvalho, 9, 2 - Saquarema" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191, {
    message: "O endereço informado é muito longo.",
  })
  endereco!: string;

  @ApiProperty({ required: false, example: "Frutos do Mar e Grelhados" })
  @IsString()
  @IsOptional()
  @MaxLength(150, {
    message: "A especialidade informada é muito longa.",
  })
  especialidade?: string;

  @ApiProperty({ example: "22897452000164" })
  @OnlyDigits()
  @IsString()
  @IsNotEmpty()
  @MaxLength(18, {
    message: "O CNPJ informado é muito longo.",
  })
  cnpj!: string;

  @ApiProperty({ example: "Vinícius Diller" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120, {
    message: "O nome do responsável informado é muito longo.",
  })
  responsavelNome!: string;

  @ApiProperty({ example: "17829397767" })
  @OnlyDigits()
  @IsString()
  @IsNotEmpty()
  @MaxLength(14, {
    message: "O CPF do responsável informado é muito longo.",
  })
  responsavelCpf!: string;

  // Os Ficheiros:
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Logótipo da empresa (Imagem)",
  })
  logo!: any;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Comprovativo (PDF)",
  })
  documentoPdf!: any;
}
