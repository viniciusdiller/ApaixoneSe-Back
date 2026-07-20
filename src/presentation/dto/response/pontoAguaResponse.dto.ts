import { ApiProperty } from "@nestjs/swagger";
import { TipoPontoAgua } from "@prisma/client";

export class PontoAguaResponseDto {
  @ApiProperty({ example: "uuid-1234-5678" })
  id!: string;

  @ApiProperty({ enum: TipoPontoAgua, example: "PRAIA" })
  tipo!: TipoPontoAgua;

  @ApiProperty({ example: "Praia de Itaúna" })
  nome!: string;

  @ApiProperty({ example: "praia-de-itauna" })
  slug!: string;

  @ApiProperty({ example: "Pico clássico da WSL com ondas de classe mundial." })
  descricaoCurta!: string;

  @ApiProperty({ example: "Itaúna é referência internacional do esporte..." })
  descricao!: string;

  @ApiProperty({
    example: "/public/pontos-agua/praia_de_itauna/imagem_1718046234123.webp",
    required: false,
  })
  imagemUrl?: string | null;

  @ApiProperty({ type: [String], required: false, example: ["surf", "bandeira azul"] })
  filtros?: string[] | null;

  @ApiProperty({ example: true })
  acessivel!: boolean;

  @ApiProperty({ example: "avançado", required: false })
  dificuldade?: string | null;

  @ApiProperty({ example: true })
  estacionamento!: boolean;

  @ApiProperty({ example: true })
  quiosques!: boolean;

  @ApiProperty({ example: "Rua Principal, 123 - Centro, Saquarema - RJ", required: false })
  endereco?: string | null;

  @ApiProperty({ example: -22.9358, required: false })
  latitude?: number | null;

  @ApiProperty({ example: -42.4779, required: false })
  longitude?: number | null;

  @ApiProperty()
  createdAt!: Date;
}
