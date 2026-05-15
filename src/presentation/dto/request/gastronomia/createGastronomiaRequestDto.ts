import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

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

  @ApiProperty({
    example: "635b1aac-cb78-4c6c-9b9b-824512047256",
    description: "ID do usuário criador",
  })
  @IsString()
  @IsNotEmpty()
  usuarioId!: string;

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
