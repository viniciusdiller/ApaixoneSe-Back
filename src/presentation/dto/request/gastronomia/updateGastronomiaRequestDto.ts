import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateGastronomiaRequestDto } from "./createGastronomiaRequestDto";
import { StatusEstabelecimento } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class UpdateGastronomiaRequestDto extends PartialType(
  CreateGastronomiaRequestDto,
) {
  @ApiProperty({
    enum: StatusEstabelecimento,
    example: StatusEstabelecimento.PENDENTE,
    required: false,
    description: "Status do estabelecimento (Apenas Admin deve alterar)",
  })
  @IsOptional()
  @IsEnum(StatusEstabelecimento)
  status?: StatusEstabelecimento;
}
