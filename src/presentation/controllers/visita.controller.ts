import { Controller, Post, Get, Param, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { VisitaApplication } from "../../application/applications/visita.Application";

@ApiTags("Visitas / Check-ins")
@Controller("visitas")
export class VisitaController {
  constructor(private readonly app: VisitaApplication) {}

  // ==========================================
  // 1. TOGGLE (Marcar/Desmarcar) GASTRONOMIA
  // ==========================================
  @Post("gastronomia/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Faz check-in (ou remove se já existir) numa Gastronomia",
  })
  async toggleGastronomia(@Param("id") gastronomiaId: string, @Req() req: any) {
    const usuarioId = req.user.id;
    return this.app.toggleGastronomia(usuarioId, gastronomiaId);
  }

  // ==========================================
  // 2. TOGGLE (Marcar/Desmarcar) ATIVIDADE
  // ==========================================
  @Post("atividade/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Faz check-in (ou remove se já existir) numa Atividade",
  })
  async toggleAtividade(@Param("id") atividadeId: string, @Req() req: any) {
    const usuarioId = req.user.id;
    return this.app.toggleAtividade(usuarioId, atividadeId);
  }

  // ==========================================
  // 3. GET - MINHAS VISITAS
  // ==========================================
  @Get("minhas")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Devolve as listas de IDs (Gastronomias e Atividades) que o usuário logado já visitou",
  })
  async getMinhasVisitas(@Req() req: any) {
    const usuarioId = req.user.id;
    return this.app.getMinhasVisitas(usuarioId);
  }
}
