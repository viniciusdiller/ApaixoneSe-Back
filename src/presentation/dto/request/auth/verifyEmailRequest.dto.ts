import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyEmailRequestDto {
  @ApiProperty({
    example: "a1b2c3d4e5f6",
    description: "Token de verificação enviado por e-mail",
  })
  @IsString()
  @IsNotEmpty({ message: "O token é obrigatório" })
  token!: string;
}
