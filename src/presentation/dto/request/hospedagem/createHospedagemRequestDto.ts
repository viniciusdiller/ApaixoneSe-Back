import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { OnlyDigits } from "../../decorators/onlyDigits.decorator";
import { ToBoolean } from "../../decorators/toBoolean.decorator";
import { MustAccept } from "../../decorators/mustAccept.decorator";

export class CreateHospedagemRequestDto {
  @ApiProperty({
    example: "Pousada Viva-Mar",
    description: "Nome da hospedagem",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120, {
    message: "O nome informado é muito longo.",
  })
  nome!: string;

  @ApiProperty({
    example: "(11) 99999-9999",
    description: "Telefone da hospedagem",
  })
  @OnlyDigits()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, {
    message: "O telefone informado é muito longo.",
  })
  telefone!: string;

  @ApiProperty({
    description:
      "Array de tags (ex: ['Wi-Fi', 'Piscina', 'Pet Friendly']). Se enviar via FormData, pode enviar como string JSON.",
    required: false,
    example: ["Wi-Fi", "Ar Condicionado", "Piscina"],
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || Array.isArray(value)) {
      return value;
    }

    if (typeof value !== "string") {
      return value;
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, {
    message: "A hospedagem possui tags demais. Remova algumas e tente novamente.",
  })
  @IsString({ each: true })
  @MaxLength(40, {
    each: true,
    message: "Uma das tags informadas é muito longa.",
  })
  tags?: string[];

  @ApiProperty({
    example: "@pousadaVivaMar",
    description: "Instagram da hospedagem",
  })
  @IsOptional()
  @IsString()
  @MaxLength(31, {
    message: "O Instagram informado é muito longo.",
  })
  instagram?: string;

  @ApiProperty({
    example: "https://www.meusite.com.br",
    description: "Site oficial",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(191, {
    message: "O site informado é muito longo.",
  })
  site?: string;

  @ApiProperty({
    example: "Av. Brasil, 1000",
    description: "Endereço da hospedagem",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(191, {
    message: "O endereço informado é muito longo.",
  })
  endereco!: string;

  @ApiProperty({
    example: "A melhor pousada da cidade!",
    description: "Texto diferencial da hospedagem",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300, {
    message: "O texto diferencial informado é muito longo.",
  })
  textoDiferencial!: string;

  @ApiProperty({
    example: "12.345.678/0001-90",
    description: "CNPJ da hospedagem",
  })
  @OnlyDigits()
  @IsString()
  @IsNotEmpty()
  @MaxLength(18, {
    message: "O CNPJ informado é muito longo.",
  })
  cnpj!: string;

  @ApiProperty({
    example: "João da Silva",
    description: "Nome do responsável pela hospedagem",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120, {
    message: "O nome do responsável informado é muito longo.",
  })
  responsavelNome!: string;

  @ApiProperty({
    example: "123.456.789-00",
  })
  @OnlyDigits()
  @IsString()
  @IsNotEmpty()
  @MaxLength(14, {
    message: "O CPF do responsável informado é muito longo.",
  })
  responsavelCpf!: string;

  @ApiProperty({
    example: true,
    description:
      "Aceite do Termo de Adesão e Autorização de Uso de Imagem e Dados",
  })
  @ToBoolean()
  @IsBoolean()
  @MustAccept()
  termoAceite!: boolean;

  @ApiProperty({
    type: "string",
    format: "binary",
    example: "Logo da hospedagem",
  })
  logo!: any;

  @ApiProperty({
    type: "string",
    format: "binary",
    example: "Documento PDF da hospedagem",
  })
  documentoPdf!: any;
}
