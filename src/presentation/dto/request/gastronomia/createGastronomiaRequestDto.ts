import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from "class-validator";

export class CreateGastronomiaRequestDto {
  @ApiProperty({ example: "Vinecao Restaurante" })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: "2299938764" })
  @IsString()
  @IsNotEmpty()
  telefone!: string;

  @ApiProperty({ required: false, example: "vineco" })
  @IsString()
  @IsOptional()
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
  endereco!: string;

  @ApiProperty({ required: false, example: "Frutos do Mar e Grelhados" })
  @IsString()
  @IsOptional()
  especialidade?: string;

  @ApiProperty({ example: "22897452000164" })
  @IsString()
  @IsNotEmpty()
  cnpj!: string;

  @ApiProperty({ example: "Vinícius Diller" })
  @IsString()
  @IsNotEmpty()
  responsavelNome!: string;

  @ApiProperty({ example: "17829397767" })
  @IsString()
  @IsNotEmpty()
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
