import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsDateString } from "class-validator";

export class CreatePlanoViagemRequestDto {
  @ApiProperty({
    example: "Férias de Verão 2026",
    description: "Nome do roteiro",
  })
  @IsString()
  @IsNotEmpty()
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
}
