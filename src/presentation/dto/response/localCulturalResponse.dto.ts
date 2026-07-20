import { ApiProperty } from "@nestjs/swagger";

export class LocalCulturalResponseDto {
  @ApiProperty({ example: "uuid-1234-5678" })
  id!: string;

  @ApiProperty({ example: "Igreja de Nossa Senhora de Nazareth" })
  nome!: string;

  @ApiProperty({
    example: "Erguida no século XVII, é o principal marco histórico da cidade.",
  })
  descricao!: string;

  @ApiProperty({ example: "A Igreja de Nossa Senhora de Nazareth é muito mais do que..." })
  texto!: string;

  @ApiProperty({
    example: "/public/cultura/igreja_de_nossa_senhora_de_nazareth/imagem_1718046234123.webp",
    required: false,
  })
  imagemUrl?: string | null;

  @ApiProperty({ example: "Rua Principal, 123 - Centro, Saquarema - RJ", required: false })
  endereco?: string | null;

  @ApiProperty()
  createdAt!: Date;
}
