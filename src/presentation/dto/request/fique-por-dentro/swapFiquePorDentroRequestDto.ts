import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class SwapFiquePorDentroRequestDto {
  @ApiProperty({ description: "ID do primeiro item" })
  @IsString()
  @IsNotEmpty()
  idA!: string;

  @ApiProperty({ description: "ID do segundo item" })
  @IsString()
  @IsNotEmpty()
  idB!: string;
}
