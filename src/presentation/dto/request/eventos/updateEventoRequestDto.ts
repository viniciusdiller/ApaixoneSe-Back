import { PartialType } from "@nestjs/swagger";
import { CreateEventoRequestDto } from "./createEventoRequestDto";

export class UpdateEventoRequestDto extends PartialType(
  CreateEventoRequestDto,
) {}
