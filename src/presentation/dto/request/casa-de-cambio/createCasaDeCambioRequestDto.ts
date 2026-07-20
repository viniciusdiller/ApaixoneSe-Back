import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator"; // 👈 Importação necessária

export class CreateCasaDeCambioRequestDto {
  @ApiProperty({
    example: "Câmbio Seguro Oficial",
    description: "Nome da casa de câmbio",
  })
  @IsString({ message: "O nome deve ser uma string válida." })
  @IsNotEmpty({ message: "O nome não pode estar vazio." })
  nome?: string;

  @ApiProperty({
    example: "+55 22 99999-9999",
    description: "Telefone de contacto da casa de câmbio",
  })
  @IsString({ message: "O telefone deve ser uma string válida." })
  @IsNotEmpty({ message: "O telefone não pode estar vazio." })
  telefone?: string;

  @ApiProperty({
    example: "Rua Principal, 123 - Centro, Saquarema - RJ",
    description: "Endereço físico da casa de câmbio",
  })
  @IsString({ message: "O endereço deve ser uma string válida." })
  @IsNotEmpty({ message: "O endereço não pode estar vazio." })
  endereco?: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    required: false,
    description: 'Logo da casa de câmbio, enviada no campo "logo"',
  })
  logo?: any;
}
