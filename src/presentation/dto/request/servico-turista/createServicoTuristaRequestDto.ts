import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  ArrayMinSize,
  ValidateIf,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";
import {
  TipoServicoTurista,
  TipoRoteiro,
  ModalidadeEsporte,
} from "@prisma/client";
import { OnlyDigits } from "../../decorators/onlyDigits.decorator";
import { ToBoolean } from "../../decorators/toBoolean.decorator";
import { MustAccept } from "../../decorators/mustAccept.decorator";

export class CreateServicoTuristaRequestDto {
  @ApiProperty({ enum: TipoServicoTurista })
  @IsEnum(TipoServicoTurista)
  @IsNotEmpty()
  tipo!: TipoServicoTurista;

  @MaxLength(120, {
    message: "O nome informado é muito longo.",
  })
  @ApiProperty() @IsString() @IsNotEmpty() nome!: string;
  @MaxLength(20, {
    message: "O telefone informado é muito longo.",
  })
  @OnlyDigits()
  @ApiProperty() @IsString() @IsNotEmpty() telefone!: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(31, {
    message: "O Instagram informado é muito longo.",
  })
  instagram?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(191, {
    message: "O endereço informado é muito longo.",
  })
  endereco?: string;

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
    example: "2024-12-31",
    description: "Data de validade do serviço (se aplicável)",
    required: false,
  })
  @IsOptional()
  @IsString()
  validade?: string;

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
  @MaxLength(2000, {
    message: "A descrição informada é muito longa.",
  })
  descricao?: string;

  // ==========================================
  // CAMPOS ESPECÍFICOS: GUIAS DE TURISMO
  // ==========================================
  @ApiProperty({ required: false })
  @ValidateIf((o) => o.tipo === TipoServicoTurista.GUIA_TURISMO)
  @OnlyDigits()
  @IsString()
  @IsNotEmpty({ message: "O CNPJ é obrigatório para Guias." })
  @MaxLength(18, {
    message: "O CNPJ informado é muito longo.",
  })
  cnpj?: string;

  @ApiProperty({
    enum: TipoRoteiro,
    isArray: true,
    required: false,
    description: "Obrigatório para Guias (pelo menos um roteiro)",
    example: ["DE_PRAIAS", "ECOLOGICO"],
  })
  @ValidateIf((o) => o.tipo === TipoServicoTurista.GUIA_TURISMO)
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
  @IsArray()
  @ArrayMinSize(1, {
    message: "Selecione ao menos um roteiro especializado.",
  })
  @IsEnum(TipoRoteiro, { each: true })
  roteiros?: TipoRoteiro[];

  @ApiProperty({ required: false, example: "Português, Inglês" })
  @ValidateIf((o) => o.tipo === TipoServicoTurista.GUIA_TURISMO)
  @IsString()
  @IsNotEmpty({ message: "Os idiomas são obrigatórios para Guias." })
  @MaxLength(150, {
    message: "Os idiomas informados são muito longos.",
  })
  idiomas?: string;

  // ==========================================
  // CAMPO ESPECÍFICO: ESPORTE/LAZER
  // ==========================================
  @ApiProperty({
    enum: ModalidadeEsporte,
    isArray: true,
    required: false,
    description: "Obrigatório para Esporte/Lazer (pelo menos uma modalidade)",
    example: ["AQUATICO", "TERRESTRE"],
  })
  @ValidateIf((o) => o.tipo === TipoServicoTurista.ESPORTE_LAZER)
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
  @IsArray()
  @ArrayMinSize(1, {
    message: "Selecione ao menos uma modalidade (Aéreo, Aquático ou Terrestre).",
  })
  @IsEnum(ModalidadeEsporte, { each: true })
  modalidades?: ModalidadeEsporte[];

  @ApiProperty({
    example: true,
    description:
      "Aceite do Termo de Adesão e Autorização de Uso de Imagem e Dados",
  })
  @ToBoolean()
  @IsBoolean()
  @MustAccept()
  termoAceite!: boolean;

  // ==========================================
  // FICHEIROS (Tratados no Controller, mas documentados aqui)
  // ==========================================
  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: "Obrigatório para Agências, Esportes e Locadoras",
  })
  @IsOptional()
  logo?: any;

  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: "Obrigatório apenas para Guias",
  })
  @IsOptional()
  foto?: any;

  @ApiProperty({
    type: "string",
    format: "binary",
    description:
      "Comprovante do Cadastur (Obrigatório exceto Esporte_Lazer. PDF ou Imagem)",
    required: false,
  })
  @IsOptional()
  comprovante?: any;

  @ApiProperty({
    type: "string",
    format: "binary",
    description:
      "Documento do CNPJ (Obrigatório apenas para Esporte/Lazer. PDF ou Imagem)",
    required: false,
  })
  @IsOptional()
  documentoCnpj?: any;
}
