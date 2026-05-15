import { PartialType } from "@nestjs/swagger";
import { CreateGastronomiaRequestDto } from "./createGastronomiaRequestDto";

export class UpdateGastronomiaRequestDto extends PartialType(
  CreateGastronomiaRequestDto,
) {}
