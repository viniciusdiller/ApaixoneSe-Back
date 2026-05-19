import { PartialType } from "@nestjs/swagger";
import { CreateCatRequestDto } from "./createCatRequestDto";

export class UpdateCatRequestDto extends PartialType(CreateCatRequestDto) {}
