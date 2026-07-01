import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordRequestDto {
  @ApiProperty({
    example: "123456",
    description: "Token de recuperação recebido por e-mail",
  })
  @IsString()
  @IsNotEmpty({ message: "O token é obrigatório" })
  token!: string;

  @ApiProperty({
    example: "NovaSenha123!",
    description: "Nova senha da conta",
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "A senha deve ter pelo menos 6 caracteres" })
  senha!: string;
}
