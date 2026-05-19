import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateIf,
} from "class-validator";
import { TipoServicoTurista, TipoRoteiro } from "@prisma/client";

export class CreateServicoTuristaRequestDto {
  @ApiProperty({ enum: TipoServicoTurista })
  @IsEnum(TipoServicoTurista)
  @IsNotEmpty()
  tipo!: TipoServicoTurista;

  @ApiProperty() @IsString() @IsNotEmpty() nome!: string;
  @ApiProperty() @IsString() @IsNotEmpty() telefone!: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instagram?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() endereco?: string;

  // ==========================================
  // CAMPOS ESPECÍFICOS: AGÊNCIA E ESPORTE
  // ==========================================
  @ApiProperty({
    required: false,
    description: "Obrigatório para Agências e Esporte/Lazer",
  })
  @ValidateIf(
    (o) =>
      o.tipo === TipoServicoTurista.AGENCIA_TURISMO ||
      o.tipo === TipoServicoTurista.ESPORTE_LAZER,
  )
  @IsString()
  @IsNotEmpty({
    message: "A descrição é obrigatória para este tipo de serviço.",
  })
  descricao?: string;

  // ==========================================
  // CAMPOS ESPECÍFICOS: GUIAS DE TURISMO
  // ==========================================
  @ApiProperty({ required: false })
  @ValidateIf((o) => o.tipo === TipoServicoTurista.GUIA_TURISMO)
  @IsString()
  @IsNotEmpty({ message: "O CNPJ é obrigatório para Guias." })
  cnpj?: string;

  @ApiProperty({ enum: TipoRoteiro, required: false })
  @ValidateIf((o) => o.tipo === TipoServicoTurista.GUIA_TURISMO)
  @IsEnum(TipoRoteiro)
  @IsNotEmpty({ message: "O roteiro especializado é obrigatório para Guias." })
  roteiro?: TipoRoteiro;

  @ApiProperty({ required: false, example: "Português, Inglês" })
  @ValidateIf((o) => o.tipo === TipoServicoTurista.GUIA_TURISMO)
  @IsString()
  @IsNotEmpty({ message: "Os idiomas são obrigatórios para Guias." })
  idiomas?: string;

  // ==========================================
  // FICHEIROS (Tratados no Controller, mas documentados aqui)
  // ==========================================
  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: "Obrigatório para Agências, Esportes e Locadoras",
  })
  logo?: any;

  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: "Obrigatório apenas para Guias",
  })
  foto?: any;
}
