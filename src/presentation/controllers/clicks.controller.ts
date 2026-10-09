import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { ClicksThrottlerGuard } from "../guards/clicksThrottler.guard";
import { ClickCounterApplication } from "../../application/applications/clickCounter.Application";
import { RegistrarClickRequestDto } from "../dto/request/clicks/registrarClickRequestDto";
import { ClickStatsQueryDto } from "../dto/request/clicks/clickStatsQueryDto";
import { ClickStatsPaginatedResponseDto } from "../dto/response/clickStatsResponse.dto";

@ApiTags("Clicks (Analytics)")
@Controller("clicks")
export class ClicksController {
  constructor(private readonly app: ClickCounterApplication) {}

  @Post()
  @UseGuards(ClicksThrottlerGuard)
  @Throttle({ clicks: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Registra um clique anônimo (público, rate limit 30/min/IP)",
  })
  @ApiResponse({ status: 204, description: "Clique registrado" })
  @ApiResponse({ status: 429, description: "Rate limit excedido" })
  async registrar(@Body() dto: RegistrarClickRequestDto): Promise<void> {
    await this.app.registrar(dto.categoria, dto.pagina);
  }

  @Get("stats")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Consulta agregados de cliques, paginado (Administrador)" })
  @ApiResponse({ status: 200, type: ClickStatsPaginatedResponseDto })
  async stats(
    @Req() req: any,
    @Query() query: ClickStatsQueryDto,
  ): Promise<ClickStatsPaginatedResponseDto> {
    return this.app.stats(req.user, query);
  }
}
