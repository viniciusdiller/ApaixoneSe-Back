import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { EventoPrincipalApplication } from "../../application/applications/eventoPrincipal.Application";
import { CreateEventoPrincipalRequestDto } from "../dto/request/evento-principal/createEventoPrincipalDto";
import { UpdateEventoPrincipalRequestDto } from "../dto/request/evento-principal/updateEventoPrincipalDto";

@ApiTags("Evento Principal (Contagem Decrescente)")
@Controller("evento-principal")
export class EventoPrincipalController {
  constructor(private readonly app: EventoPrincipalApplication) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cria o evento principal (Apenas ADMIN)" })
  async create(@Body() dto: CreateEventoPrincipalRequestDto, @Req() req: any) {
    return this.app.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: "Busca a lista de eventos principais" })
  async findAll() {
    return this.app.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca um evento principal por ID" })
  async findById(@Param("id") id: string) {
    return this.app.findById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualiza o evento principal (Apenas ADMIN)" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateEventoPrincipalRequestDto,
    @Req() req: any,
  ) {
    return this.app.update(id, dto, req.user);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deleta um evento principal (Apenas ADMIN)" })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.app.delete(id, req.user);
  }
}
