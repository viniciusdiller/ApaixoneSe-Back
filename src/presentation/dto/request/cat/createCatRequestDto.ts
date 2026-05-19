import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class CreateCatRequestDto {
  @ApiProperty({ description: "Texto informativo do CAT" })
  @IsString()
  @IsNotEmpty()
  texto!: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Mapa ou informativo",
  })
  arquivo!: any;
}
