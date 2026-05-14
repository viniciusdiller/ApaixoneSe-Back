import { ApiProperty } from "@nestjs/swagger";
import { TipoRoteiro } from "@prisma/client";

export class AtividadeResponseDto {
  @ApiProperty({ example: "uuid-1234-5678" })
  id!: string;

  @ApiProperty({ example: "Surfe na Praia de Itaúna" })
  titulo!: string;

  @ApiProperty({ example: "Conhecido como o Maracanã do Surfe..." })
  descricao!: string;

  @ApiProperty({ example: "Praia de Itaúna, Saquarema" })
  local!: string;

  @ApiProperty({ example: -22.9242, required: false })
  latitude?: number | null;

  @ApiProperty({ example: -42.5097, required: false })
  longitude?: number | null;

  @ApiProperty({ example: "https://site.com/foto-surfe.jpg", required: false })
  imagemUrl?: string | null;

  @ApiProperty({ enum: TipoRoteiro, example: "ESPORTE_E_AVENTURA" })
  roteiro!: TipoRoteiro;

  @ApiProperty()
  createdAt!: Date;
}
