import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AtividadeApplication } from "../../application/applications/atividade.Application";
import { AtividadeResponseDto } from "../dto/response/atividadeResponse.dto";
import { CreateAtividadeRequestDto } from "../dto/request/atividades/createAtividadeRequestDto";
import { UpdateAtividadeRequestDto } from "../dto/request/atividades/updateAtividadeRequestDto";
import { TipoRoteiro } from "@prisma/client";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";

@ApiTags("Atividades e Roteiros")
@Controller("atividades")
export class AtividadeController {
  constructor(private readonly atividadeApplication: AtividadeApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cadastra uma nova atividade num roteiro (Apenas Admin)",
  })
  @ApiResponse({ status: 201, type: AtividadeResponseDto })
  async create(
    @Body() createDto: CreateAtividadeRequestDto,
    @Req() req: any,
  ): Promise<AtividadeResponseDto> {
    return this.atividadeApplication.create(createDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: "Lista todas as atividades de todos os roteiros" })
  @ApiResponse({ status: 200, type: [AtividadeResponseDto] })
  async findAll(): Promise<AtividadeResponseDto[]> {
    return this.atividadeApplication.findAll();
  }

  @Get("roteiro/:roteiro")
  @ApiOperation({
    summary: "Busca atividades filtradas por um roteiro específico",
  })
  @ApiParam({ name: "roteiro", enum: TipoRoteiro })
  @ApiResponse({ status: 200, type: [AtividadeResponseDto] })
  async findByRoteiro(
    @Param("roteiro") roteiro: TipoRoteiro,
  ): Promise<AtividadeResponseDto[]> {
    return this.atividadeApplication.findByRoteiro(roteiro);
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca os detalhes de uma atividade pelo ID" })
  @ApiResponse({ status: 200, type: AtividadeResponseDto })
  async findById(@Param("id") id: string): Promise<AtividadeResponseDto> {
    return this.atividadeApplication.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Atualiza os dados de uma atividade pelo ID (Apenas Admin)",
  })
  @ApiResponse({ status: 200, type: AtividadeResponseDto })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAtividadeRequestDto,
    @Req() req: any,
  ): Promise<AtividadeResponseDto> {
    return this.atividadeApplication.update(id, dto, req.user);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta uma atividade pelo ID (Apenas Admin)" })
  async delete(@Param("id") id: string, @Req() req: any): Promise<void> {
    return this.atividadeApplication.delete(id, req.user);
  }
}
