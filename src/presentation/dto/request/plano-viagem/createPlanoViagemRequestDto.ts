import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  MaxLength,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ItemPlanoViagemInlineDto } from "../item-plano-viagem/createItemPlanoViagemRequestDto";

export class CreatePlanoViagemRequestDto {
  @ApiProperty({
    example: "Férias de Verão 2026",
    description: "Nome do roteiro",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80, {
    message: "O título informado é muito longo.",
  })
  titulo!: string;

  @ApiProperty({
    example: "2026-12-15T00:00:00Z",
    description: "Data de início da viagem",
  })
  @IsDateString()
  @IsNotEmpty()
  dataInicio!: Date;

  @ApiProperty({
    example: "2026-12-25T00:00:00Z",
    description: "Data de fim da viagem",
  })
  @IsDateString()
  @IsNotEmpty()
  dataFim!: Date;

  @ApiProperty({
    required: false,
    type: [ItemPlanoViagemInlineDto],
    description: "Itens criados junto com o roteiro, de forma atômica",
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50, { message: "Quantidade de itens acima do permitido." })
  @ValidateNested({ each: true })
  @Type(() => ItemPlanoViagemInlineDto)
  itens?: ItemPlanoViagemInlineDto[];
}
