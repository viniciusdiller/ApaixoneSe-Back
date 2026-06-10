import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { CasaDeCambioApplication } from "../../application/applications/casaDeCambio.Application";
import { CreateCasaDeCambioRequestDto } from "../dto/request/casa-de-cambio/createCasaDeCambioRequestDto";
import { UpdateCasaDeCambioRequestDto } from "../dto/request/casa-de-cambio/updateCasaDeCambioRequestDto";

@ApiTags("Casa de Câmbio")
@Controller("casa-de-cambio")
export class CasaDeCambioController {
  constructor(private readonly app: CasaDeCambioApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cria uma Casa de Câmbio (Apenas Admin)" })
  @ApiBody({ type: CreateCasaDeCambioRequestDto })
  async create(@Body() dto: CreateCasaDeCambioRequestDto, @Req() req: any) {
    return this.app.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: "Lista todas as Casas de Câmbio" })
  async findAll() {
    return this.app.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca uma Casa de Câmbio pelo ID" })
  async findById(@Param("id") id: string) {
    return this.app.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualiza uma Casa de Câmbio (Apenas Admin)" })
  @ApiBody({ type: UpdateCasaDeCambioRequestDto })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCasaDeCambioRequestDto,
    @Req() req: any,
  ) {
    return this.app.update(id, dto, req.user);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta uma Casa de Câmbio (Apenas Admin)" })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.app.delete(id, req.user);
  }
}
