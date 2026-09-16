import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";

export class ForgotPasswordRequestDto {
  @ApiProperty({
    example: "usuario@email.com",
    description: "E-mail da conta para recuperação de senha",
  })
  @IsEmail({}, { message: "Forneça um e-mail válido" })
  @IsNotEmpty({ message: "O e-mail é obrigatório" })
  @MaxLength(191, {
    message: "O e-mail informado é muito longo.",
  })
  email!: string;
}
