import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginRequestDto {
  @ApiProperty({
    example: "viniciusvalle",
    description: "Pode ser o email ou o nome de utilizador",
  })
  @IsString()
  @IsNotEmpty({ message: "O identificador é obrigatório" })
  identificador!: string;

  @ApiProperty({ example: "SenhaSegura123!" })
  @IsString()
  @IsNotEmpty({ message: "A senha é obrigatória" })
  senha!: string;
}
