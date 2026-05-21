import {
  Controller,
  Post,
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
import { ItemPlanoViagemApplication } from "../../application/applications/itemPlanoViagem.Application";
import { CreateItemPlanoViagemRequestDto } from "../dto/request/item-plano-viagem/createItemPlanoViagemRequestDto";

@ApiTags("Meu Roteiro (Itens)")
@Controller("item-plano-viagem")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ItemPlanoViagemController {
  constructor(private readonly app: ItemPlanoViagemApplication) {}

  @Post()
  @ApiOperation({ summary: "Adicionar uma Atividade/Local ao Roteiro" })
  async create(@Body() dto: CreateItemPlanoViagemRequestDto, @Req() req: any) {
    return this.app.create(dto, req.user);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover uma Atividade/Local do Roteiro" })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.app.delete(id, req.user);
  }
}
