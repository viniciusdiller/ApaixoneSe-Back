import { PartialType } from "@nestjs/swagger";
import { CreateLocalCulturalRequestDto } from "./createLocalCulturalRequestDto";

export class UpdateLocalCulturalRequestDto extends PartialType(
  CreateLocalCulturalRequestDto,
) {}
