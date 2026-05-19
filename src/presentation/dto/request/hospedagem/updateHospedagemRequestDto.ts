import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateHospedagemRequestDto } from "./createHospedagemRequestDto";
import { StatusEstabelecimento } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class UpdateHospedagemRequestDto extends PartialType(
  CreateHospedagemRequestDto,
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
