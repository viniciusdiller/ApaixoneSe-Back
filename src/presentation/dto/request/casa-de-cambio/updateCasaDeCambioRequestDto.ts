import { PartialType } from "@nestjs/swagger";
import { CreateCasaDeCambioRequestDto } from "./createCasaDeCambioRequestDto";

export class UpdateCasaDeCambioRequestDto extends PartialType(
  CreateCasaDeCambioRequestDto,
) {}
