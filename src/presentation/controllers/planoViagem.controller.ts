import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { PlanoViagemApplication } from "../../application/applications/planoViagem.Application";
import { CreatePlanoViagemRequestDto } from "../dto/request/plano-viagem/createPlanoViagemRequestDto";
import { UpdatePlanoViagemRequestDto } from "../dto/request/plano-viagem/updatePlanoViagemRequestDto";

@ApiTags("Meu Roteiro (Planos de Viagem)")
@Controller("plano-viagem")
@UseGuards(JwtAuthGuard) // 🔒 TODAS as rotas deste controller exigem login!
@ApiBearerAuth()
export class PlanoViagemController {
  constructor(private readonly app: PlanoViagemApplication) {}

  @Post()
  @ApiOperation({ summary: "Criar um novo Roteiro de Viagem" })
  async create(@Body() dto: CreatePlanoViagemRequestDto, @Req() req: any) {
    return this.app.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Listar TODOS os Meus Roteiros" })
  async findMeusPlanos(@Req() req: any) {
    // O Req.user.id garante que a listagem é individual para cada telemóvel/browser
    return this.app.findMeusPlanos(req.user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Ver detalhes de um Roteiro (Privado)" })
  async findById(@Param("id") id: string, @Req() req: any) {
    return this.app.findById(id, req.user);
  }

  @Put(":id")
  @ApiOperation({ summary: "Editar o Título ou Datas do Roteiro" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePlanoViagemRequestDto,
    @Req() req: any,
  ) {
    return this.app.update(id, dto, req.user);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Apagar um Roteiro inteiro (E todos os seus itens)",
  })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.app.delete(id, req.user);
  }
}
