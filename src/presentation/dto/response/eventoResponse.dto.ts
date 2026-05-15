import { ApiProperty } from "@nestjs/swagger";
import { Mes } from "@prisma/client";

export class EventoResponseDto {
  @ApiProperty({ example: "uuid-1234-5678" })
  id!: string;

  @ApiProperty({ example: "Saquarema Country Fest" })
  titulo!: string;

  @ApiProperty({ example: "O maior evento country..." })
  descricao!: string;

  @ApiProperty({ example: "2026-04-01T20:00:00.000Z" })
  data!: Date;

  @ApiProperty({ example: "Parque de Exposições, Sampaio Corrêa" })
  local!: string;

  // Novo campo: o Frontend usa isso para escolher a imagem
  @ApiProperty({ enum: Mes, example: "ABRIL" })
  mes!: Mes;

  @ApiProperty()
  createdAt!: Date;
}
