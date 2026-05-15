import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateGastronomiaRequestDto {
  @ApiProperty() @IsString() @IsNotEmpty() nome!: string;
  @ApiProperty() @IsString() @IsNotEmpty() telefone!: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  instagram?: string;
  @ApiProperty() @IsString() @IsNotEmpty() endereco!: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  especialidade?: string;
  @ApiProperty() @IsString() @IsNotEmpty() cnpj!: string;
  @ApiProperty() @IsString() @IsNotEmpty() responsavelNome!: string;
  @ApiProperty() @IsString() @IsNotEmpty() responsavelCpf!: string;
  @ApiProperty() @IsString() @IsNotEmpty() usuarioId!: string;

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
