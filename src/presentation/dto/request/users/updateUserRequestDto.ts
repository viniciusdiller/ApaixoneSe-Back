import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateUserRequestDto } from "./createUserRequestDto";

// Edição do próprio perfil: sem perfil/active (esses só pela rota de admin)
export class UpdateUserRequestDto extends PartialType(
  OmitType(CreateUserRequestDto, ["perfil"] as const),
) {}