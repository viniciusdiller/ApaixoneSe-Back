import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { AtividadeApplication } from "../../application/applications/atividade.Application";
import { CreateAtividadeRequestDto } from "../dto/request/atividades/createAtividadeRequestDto";
import { AtividadeResponseDto } from "../dto/response/atividadeResponse.dto";
import { TipoRoteiro } from "@prisma/client";

@ApiTags("Atividades e Roteiros")
@Controller("atividades") // A URL base será localhost:3001/atividades
export class AtividadeController {
  constructor(private readonly atividadeApplication: AtividadeApplication) {}

  @Post()
  @ApiOperation({ summary: "Cadastra uma nova atividade num roteiro" })
  @ApiResponse({
    status: 201,
    description: "Atividade cadastrada",
    type: AtividadeResponseDto,
  })
  async create(
    @Body() createDto: CreateAtividadeRequestDto,
  ): Promise<AtividadeResponseDto> {
    return this.atividadeApplication.create(createDto);
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
  @ApiParam({
    name: "roteiro",
    enum: TipoRoteiro,
    description: "Ex: ESPORTE_E_AVENTURA",
  })
  @ApiResponse({ status: 200, type: [AtividadeResponseDto] })
  async findByRoteiro(
    @Param("roteiro") roteiro: TipoRoteiro,
  ): Promise<AtividadeResponseDto[]> {
    return this.atividadeApplication.findByRoteiro(roteiro);
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca os detalhes de uma atividade pelo ID" })
  @ApiResponse({ status: 200, type: AtividadeResponseDto })
  @ApiResponse({ status: 404, description: "Atividade não encontrada" })
  async findById(@Param("id") id: string): Promise<AtividadeResponseDto> {
    return this.atividadeApplication.findById(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Deleta uma atividade pelo ID" })
  @ApiResponse({ status: 204, description: "Atividade deletada com sucesso" })
  @ApiResponse({ status: 404, description: "Atividade não encontrada" })
  async delete(@Param("id") id: string): Promise<void> {
    return this.atividadeApplication.delete(id);
  }
}
