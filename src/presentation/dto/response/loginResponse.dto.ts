import { ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "./userResponse.dto";

export class LoginResponseDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6..." })
  token!: string;

  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;
}
