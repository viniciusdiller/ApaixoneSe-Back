import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

const DIA_MS = 24 * 60 * 60 * 1000;

export function validarApenasUmVinculo(data: any) {
  const idsPreenchidos = [
    data.gastronomiaId,
    data.hospedagemId,
    data.eventoId,
    data.atividadeId,
    data.servicoTuristaId,
  ].filter((id) => id != null && id !== "");

  if (idsPreenchidos.length !== 1) {
    throw new BadRequestException(
      "Um item do roteiro deve estar associado a EXATAMENTE UM local (Hospedagem, Gastronomia, Evento, Atividade ou Serviço).",
    );
  }
}

/**
 * dataInicio/dataFim são datas (meia-noite UTC) e o item vem em horário local
 * convertido para UTC. A janela tem folga de fuso: o Front faz a checagem exata
 * em horário local, aqui é só rede de segurança.
 */
export function validarDentroDoPeriodo(
  dataHoraAgendada: Date | string,
  dataInicio: Date | string,
  dataFim: Date | string,
) {
  const t = new Date(dataHoraAgendada).getTime();
  const min = new Date(dataInicio).getTime() - DIA_MS;
  const max = new Date(dataFim).getTime() + 2 * DIA_MS;

  if (Number.isNaN(t) || t < min || t >= max) {
    throw new BadRequestException(
      "A data do item deve estar dentro do período do roteiro.",
    );
  }
}

/** FK inexistente (ex.: local removido/inventado): vira 400 genérico em vez de 500. */
export function ehViolacaoDeFk(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003"
  );
}
