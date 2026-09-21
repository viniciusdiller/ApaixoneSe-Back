import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsUUID,
  MaxLength,
} from "class-validator";

export class ItemPlanoViagemInlineDto {
  @ApiProperty({
    example: "2026-12-16T20:00:00Z",
    description: "Data e hora marcada para esta atividade",
  })
  @IsDateString()
  @IsNotEmpty()
  dataHoraAgendada!: Date;

  @ApiProperty({
    required: false,
    example: "Lembrar de levar a máquina fotográfica",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: "A anotação informada é muito longa.",
  })
  anotacao?: string;

  // ==========================================
  // IDs OPCIONAIS (Apenas UM deve ser enviado)
  // ==========================================
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  gastronomiaId?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  hospedagemId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() eventoId?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  atividadeId?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  servicoTuristaId?: string;
}

export class CreateItemPlanoViagemRequestDto extends ItemPlanoViagemInlineDto {
  @ApiProperty({ description: "ID do Plano de Viagem (Pai)" })
  @IsUUID()
  @IsNotEmpty()
  planoViagemId!: string;
}
