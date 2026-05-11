import { ApiProperty } from "@nestjs/swagger";
import { PerfilUsuario } from "../../../data/entities/user.Entity";

export class UserResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "Vinícius Valle" })
  nome!: string;

  @ApiProperty({ example: "viniciusvalle" })
  usuario!: string;

  @ApiProperty({ example: "vinicius@email.com" })
  email!: string;

  @ApiProperty({ enum: ["USUARIO", "PARCEIRO", "ADMIN"] })
  perfil!: PerfilUsuario;

  @ApiProperty({ example: "2026-05-11T15:15:00.000Z" })
  createdAt!: Date;
}
