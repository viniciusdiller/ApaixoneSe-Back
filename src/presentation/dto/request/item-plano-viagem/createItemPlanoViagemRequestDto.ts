import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsUUID,
} from "class-validator";

export class CreateItemPlanoViagemRequestDto {
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
  anotacao?: string;

  @ApiProperty({ description: "ID do Plano de Viagem (Pai)" })
  @IsUUID()
  @IsNotEmpty()
  planoViagemId!: string;

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
