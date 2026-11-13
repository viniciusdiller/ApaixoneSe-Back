import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  ValidateNested,
} from "class-validator";

// Só caminhos de upload do próprio servidor ou http(s) — barra javascript:, data: etc.
const URL_SEGURA = /^(\/uploads\/|https?:\/\/)\S+$/i;
const LINK_SEGURO = /^https?:\/\/\S+$/i;

export class BandeiraAzulMidiaDto {
  @ApiProperty({ example: "/uploads/bandeira-azul/img_1700000000000.webp" })
  @IsString()
  @MaxLength(1000)
  @Matches(URL_SEGURA, { message: "URL de mídia inválida." })
  url!: string;

  @ApiPropertyOptional({ example: "https://exemplo.com/mais-informacoes" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Matches(LINK_SEGURO, { message: "Link inválido." })
  link?: string;
}

export class BandeiraAzulBlocoDto {
  @ApiProperty({ enum: ["text", "image", "video"] })
  @IsIn(["text", "image", "video"])
  type!: "text" | "image" | "video";

  @ApiProperty({ example: "A Bandeira Azul é um selo internacional..." })
  @IsString()
  @MaxLength(20000)
  content!: string;

  @ApiPropertyOptional({ example: "#ffffff" })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: "Cor de fundo inválida." })
  bgColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBold?: boolean;

  @ApiPropertyOptional({ type: [BandeiraAzulMidiaDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => BandeiraAzulMidiaDto)
  images?: BandeiraAzulMidiaDto[];

  @ApiPropertyOptional({ type: [BandeiraAzulMidiaDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => BandeiraAzulMidiaDto)
  videos?: BandeiraAzulMidiaDto[];
}

export class SalvarBandeiraAzulRequestDto {
  @ApiProperty({ example: "Praias com Bandeira Azul" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titulo!: string;

  @ApiPropertyOptional({ example: "Conheça o selo de qualidade ambiental" })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitulo?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["/uploads/bandeira-azul/img_1700000000000.webp"],
    description: "Fotos do carrossel do banner, na ordem de exibição",
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  @Matches(URL_SEGURA, { each: true, message: "URL de imagem do banner inválida." })
  bannerImagens?: string[];

  @ApiProperty({ type: [BandeiraAzulBlocoDto] })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BandeiraAzulBlocoDto)
  blocos!: BandeiraAzulBlocoDto[];
}
