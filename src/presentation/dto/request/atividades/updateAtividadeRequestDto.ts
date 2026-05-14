import { PartialType } from "@nestjs/swagger";
import { CreateAtividadeRequestDto } from "./createAtividadeRequestDto";

// O PartialType faz a mágica de copiar o CreateDto e deixar tudo opcional (?) automaticamente!
export class UpdateAtividadeRequestDto extends PartialType(
  CreateAtividadeRequestDto,
) {}
