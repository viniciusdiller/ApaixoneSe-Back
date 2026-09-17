import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  MaxLength,
} from "class-validator";
import { PerfilUsuario } from "../../../../data/entities/user.Entity";

export class CreateUserRequestDto {
  @ApiProperty({
    example: "Vinícius Valle",
    description: "Nome completo do utilizador",
  })
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório" })
  @MaxLength(150, {
    message: "O nome informado é muito longo.",
  })
  nome!: string;

  @ApiProperty({
    example: "viniciusvalle",
    description: "Nome de utilizador único (@)",
  })
  @IsString()
  @IsNotEmpty({ message: "O nome de utilizador é obrigatório" })
  @MaxLength(30, {
    message: "O nome de usuário informado é muito longo.",
  })
  usuario!: string;

  @ApiProperty({ example: "vinicius@email.com", description: "Email válido" })
  @IsEmail({}, { message: "Forneça um email válido" })
  @IsNotEmpty({ message: "O email é obrigatório" })
  @MaxLength(191, {
    message: "O e-mail informado é muito longo.",
  })
  email!: string;

  @ApiProperty({
    example: "SenhaSegura123!",
    minLength: 6,
    description: "Senha com pelo menos 6 caracteres",
  })
  @IsString()
  @MinLength(6, { message: "A senha deve ter pelo menos 6 caracteres" })
  @MaxLength(64, {
    message: "A senha informada é muito longa.",
  })
  senha!: string;

  @ApiProperty({
    enum: ["USUARIO", "PARCEIRO", "ADMIN"],
    default: "USUARIO",
    required: false,
  })
  @IsOptional()
  @IsEnum(["USUARIO", "PARCEIRO", "ADMIN"], { message: "Perfil inválido" })
  perfil?: PerfilUsuario;
}
