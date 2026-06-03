import { PartialType } from "@nestjs/swagger";
import { CreateEventoPrincipalRequestDto } from "./createEventoPrincipalDto";

export class UpdateEventoPrincipalRequestDto extends PartialType(
  CreateEventoPrincipalRequestDto,
) {}
