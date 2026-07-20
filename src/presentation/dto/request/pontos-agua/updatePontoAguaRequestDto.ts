import { PartialType } from "@nestjs/swagger";
import { CreatePontoAguaRequestDto } from "./createPontoAguaRequestDto";

export class UpdatePontoAguaRequestDto extends PartialType(
  CreatePontoAguaRequestDto,
) {}
