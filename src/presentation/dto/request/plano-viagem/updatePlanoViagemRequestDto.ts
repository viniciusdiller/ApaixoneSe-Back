import { PartialType } from "@nestjs/swagger";
import { CreatePlanoViagemRequestDto } from "../plano-viagem/createPlanoViagemRequestDto";

export class UpdatePlanoViagemRequestDto extends PartialType(
  CreatePlanoViagemRequestDto,
) {}
