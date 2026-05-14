import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsDateString } from "class-validator";

export class CreateEventoRequestDto {
  @ApiProperty({
    example: "Saquarema Country Fest",
    description: "Título oficial do evento",
  })
  @IsString()
  @IsNotEmpty({ message: "O título é obrigatório" })
  titulo!: string;

  @ApiProperty({
    example: "O maior evento country da região dos lagos...",
    description: "Detalhes do evento",
  })
  @IsString()
  @IsNotEmpty({ message: "A descrição é obrigatória" })
  descricao!: string;

  @ApiProperty({
    example: "2026-04-01T20:00:00Z",
    description: "Data e hora no formato ISO8601",
  })
  @IsDateString({}, { message: "Forneça uma data válida" })
  @IsNotEmpty({ message: "A data é obrigatória" })
  data!: string;

  @ApiProperty({ example: "Parque de Exposições, Sampaio Corrêa" })
  @IsString()
  @IsNotEmpty({ message: "O local é obrigatório" })
  local!: string;
}
