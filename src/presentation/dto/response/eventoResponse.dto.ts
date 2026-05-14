import { ApiProperty } from "@nestjs/swagger";

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

  // O pulo do gato: A imagem do mês já vai junto na resposta do evento!
  @ApiProperty({
    example: "https://site.com/foto-abril.jpg",
    required: false,
    nullable: true,
  })
  imagemMesUrl?: string | null;

  @ApiProperty()
  createdAt!: Date;
}
