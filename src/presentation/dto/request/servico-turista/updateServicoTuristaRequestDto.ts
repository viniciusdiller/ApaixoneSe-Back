import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateServicoTuristaRequestDto } from "./createServicoTuristaRequestDto";
import { StatusEstabelecimento } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class UpdateServicoTuristaRequestDto extends PartialType(
  CreateServicoTuristaRequestDto,
) {
  @ApiProperty({ enum: StatusEstabelecimento, required: false })
  @IsOptional()
  @IsEnum(StatusEstabelecimento)
  status?: StatusEstabelecimento;
}
