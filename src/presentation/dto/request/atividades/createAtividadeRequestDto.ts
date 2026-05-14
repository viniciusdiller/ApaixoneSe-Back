import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
} from "class-validator";
import { TipoRoteiro } from "@prisma/client";

export class CreateAtividadeRequestDto {
  @ApiProperty({
    example: "Surfe na Praia de Itaúna",
    description: "O título da atividade",
  })
  @IsString()
  @IsNotEmpty({ message: "O título é obrigatório" })
  titulo!: string;

  @ApiProperty({
    example:
      "Conhecido como o Maracanã do Surfe, Itaúna oferece as melhores ondas...",
    description: "Descrição detalhada",
  })
  @IsString()
  @IsNotEmpty({ message: "A descrição é obrigatória" })
  descricao!: string;

  @ApiProperty({
    example: "Praia de Itaúna, Saquarema",
    description: "Local físico",
  })
  @IsString()
  @IsNotEmpty({ message: "O local é obrigatório" })
  local!: string;

  @ApiProperty({
    example: -22.9242,
    required: false,
    description: "Latitude para o mapa",
  })
  @IsNumber({}, { message: "A latitude deve ser um número válido" })
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    example: -42.5097,
    required: false,
    description: "Longitude para o mapa",
  })
  @IsNumber({}, { message: "A longitude deve ser um número válido" })
  @IsOptional()
  longitude?: number;

  // Aqui usamos o nosso ENUM oficial do banco de dados!
  @ApiProperty({ enum: TipoRoteiro, example: TipoRoteiro.ESPORTE_E_AVENTURA })
  @IsEnum(TipoRoteiro, {
    message: "Roteiro inválido. Escolha um dos roteiros oficiais.",
  })
  @IsNotEmpty({ message: "O roteiro é obrigatório" })
  roteiro!: TipoRoteiro;
}
