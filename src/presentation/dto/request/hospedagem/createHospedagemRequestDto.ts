import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateHospedagemRequestDto {
  @ApiProperty({
    example: "Pousada Viva-Mar",
    description: "Nome da hospedagem",
  })
  @IsString()
  @IsNotEmpty()
  nome!: string;
  @ApiProperty({
    example: "(11) 99999-9999",
    description: "Telefone da hospedagem",
  })
  @IsString()
  @IsNotEmpty()
  telefone!: string;
  @ApiProperty({
    example: "@pousadaVivaMar",
    description: "Instagram da hospedagem",
  })
  @IsOptional()
  @IsString()
  instagram?: string;
  @ApiProperty({
    example: "Av. Brasil, 1000",
    description: "Endereço da hospedagem",
  })
  @IsString()
  @IsNotEmpty()
  endereco!: string;
  @ApiProperty({
    example: "A melhor pousada da cidade!",
    description: "Texto diferencial da hospedagem",
  })
  @IsString()
  @IsNotEmpty()
  textoDiferencial!: string;
  @ApiProperty({
    example: "12.345.678/0001-90",
    description: "CNPJ da hospedagem",
  })
  @IsString()
  @IsNotEmpty()
  cnpj!: string;

  @ApiProperty({
    example: "João da Silva",
    description: "Nome do responsável pela hospedagem",
  })
  @IsString()
  @IsNotEmpty()
  responsavelNome!: string;

  @ApiProperty({
    example: "123.456.789-00",
  })
  @IsString()
  @IsNotEmpty()
  responsavelCpf!: string;
  @ApiProperty({
    example: "Logo da hospedagem",
  })
  logo!: any;
  @ApiProperty({
    example: "Documento PDF da hospedagem",
  })
  documentoPdf!: any;
}
