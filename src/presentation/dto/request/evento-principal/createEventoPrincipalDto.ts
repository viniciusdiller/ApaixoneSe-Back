import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from "class-validator";

export class CreateEventoPrincipalRequestDto {
  @ApiProperty({ example: "Saquarema Pro 2026" })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty({ example: "WSL Championship Tour", required: false })
  @IsString()
  @IsOptional()
  etapa?: string;

  @ApiProperty({ example: "2026-06-20T00:00:00Z" })
  @IsDateString()
  @IsNotEmpty()
  data!: string;
}
