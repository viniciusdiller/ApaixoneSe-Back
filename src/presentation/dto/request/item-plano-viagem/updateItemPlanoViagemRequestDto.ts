import { PartialType } from "@nestjs/swagger";
import { CreateItemPlanoViagemRequestDto } from "./createItemPlanoViagemRequestDto";

export class UpdateItemPlanoViagemRequestDto extends PartialType(
  CreateItemPlanoViagemRequestDto,
) {}
