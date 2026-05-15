import { ApiProperty } from "@nestjs/swagger";
import { StatusEstabelecimento } from "@prisma/client";

export class GastronomiaResponseDto {
  @ApiProperty({ example: "5d6095ec-619f-493f-b458-714d8af67843" })
  id!: string;

  @ApiProperty({ example: "Vinecao" })
  nome!: string;

  @ApiProperty({ example: "2299938764" })
  telefone!: string;

  @ApiProperty({ example: "vineco", required: false, nullable: true })
  instagram?: string | null;

  @ApiProperty({ example: "Rua Jaime Warde de Carvalho, 9, 2" })
  endereco!: string;

  @ApiProperty({
    example: "Especialidade da Casa",
    required: false,
    nullable: true,
  })
  especialidade?: string | null;

  @ApiProperty({ example: "22897452455646" })
  cnpj!: string;

  @ApiProperty({ example: "Vinícius Diller" })
  responsavelNome!: string;

  @ApiProperty({ example: "17829397767" })
  responsavelCpf!: string;

  @ApiProperty({ example: "/uploads/gastronomia/vinecao/documento.pdf" })
  documentoPdfUrl!: string;

  @ApiProperty({ example: "/uploads/gastronomia/vinecao/logo.webp" })
  logoUrl!: string;

  @ApiProperty({ enum: StatusEstabelecimento, example: "PENDENTE" })
  status!: StatusEstabelecimento;

  @ApiProperty({ example: "635b1aac-cb78-4c6c-9b9b-824512047256" })
  usuarioId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
