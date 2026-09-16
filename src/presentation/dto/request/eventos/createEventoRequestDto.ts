import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateEventoRequestDto {
  @ApiProperty({
    example: "Saquarema Country Fest",
    description: "Título oficial do evento",
  })
  @IsString()
  @IsNotEmpty({ message: "O título é obrigatório" })
  @MaxLength(150, {
    message: "O título informado é muito longo.",
  })
  titulo!: string;

  @ApiProperty({
    example: "O maior evento country da região dos lagos...",
    description: "Detalhes do evento",
  })
  @IsString()
  @IsNotEmpty({ message: "A descrição é obrigatória" })
  @MaxLength(2000, {
    message: "A descrição informada é muito longa.",
  })
  descricao!: string;

  @ApiProperty({
    example: "2026-04-01T20:00:00Z",
    description: "Data e hora de início do evento, no formato ISO8601",
  })
  @IsDateString({}, { message: "Forneça uma data de início válida" })
  @IsNotEmpty({ message: "A data é obrigatória" })
  data!: string;

  @ApiPropertyOptional({
    example: "2026-04-03T23:00:00Z",
    description:
      "Data e hora de término do evento, no formato ISO8601. Omita para um evento de um único dia.",
  })
  @IsOptional()
  @IsDateString({}, { message: "Forneça uma data final válida" })
  dataFim?: string;

  @ApiProperty({ example: "Parque de Exposições, Sampaio Corrêa" })
  @IsString()
  @IsNotEmpty({ message: "O local é obrigatório" })
  @MaxLength(150, {
    message: "O local informado é muito longo.",
  })
  local!: string;

  @ApiPropertyOptional({ example: "Av. Sampaio Corrêa, 500 - Saquarema - RJ" })
  @IsOptional()
  @IsString()
  @MaxLength(191, {
    message: "O endereço informado é muito longo.",
  })
  endereco?: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: 'Imagem de fundo do evento enviada no campo "foto" (compatível com "imagem")',
  })
  foto?: any;

  @ApiPropertyOptional({
    example: "true",
    description:
      "Se marcado, o evento entra no carrossel 'Fique Por Dentro' da home (limite de 4 eventos em destaque simultâneos)",
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  destaque?: boolean;
}
