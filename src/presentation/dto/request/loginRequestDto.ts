import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class LoginRequestDto {
  @ApiProperty({
    example: "viniciusvalle",
    description: "Pode ser o email ou o nome de utilizador",
  })
  @IsString()
  @IsNotEmpty({ message: "O identificador é obrigatório" })
  @MaxLength(191, {
    message: "O identificador informado é muito longo.",
  })
  identificador!: string;

  @ApiProperty({ example: "SenhaSegura123!" })
  @IsString()
  @IsNotEmpty({ message: "A senha é obrigatória" })
  @MaxLength(64, {
    message: "A senha informada é muito longa.",
  })
  senha!: string;
}
