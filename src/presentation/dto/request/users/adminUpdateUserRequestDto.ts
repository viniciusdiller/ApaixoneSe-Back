import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateUserRequestDto } from "./createUserRequestDto";

export class AdminUpdateUserRequestDto extends PartialType(CreateUserRequestDto) {
  @ApiProperty({
    example: true,
    description: "Define se o usuário está ativo",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
