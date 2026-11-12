import { BadRequestException, Logger } from "@nestjs/common";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

/**
 * Helper de upload compartilhado.
 *
 * Fluxo em duas fases para nunca deixar arquivo pela metade em disco:
 *   1. `prepararImagemWebp` / `prepararImagemOuPdf` — valida o CONTEÚDO real do
 *      arquivo (metadata do sharp / magic bytes do PDF, nunca a extensão ou o
 *      mimetype declarados pelo cliente) e já gera o buffer final em memória.
 *      Qualquer arquivo inválido vira 400 com mensagem clara, em vez de deixar
 *      o erro do sharp subir como 500.
 *   2. `gravarArquivos` — só depois de TODOS os arquivos estarem prontos, cria
 *      a pasta (sempre) e grava. Se a gravação falhar no meio, desfaz o que já
 *      tinha sido gravado.
 *
 * Quem chama deve usar `removerArquivos` se a etapa seguinte (ex: banco) falhar.
 */

const logger = new Logger("UploadHelper");

/** Formatos de imagem aceitos (nomes conforme `sharp.metadata().format`). */
export const FORMATOS_IMAGEM_ACEITOS: readonly string[] = ["jpeg", "png", "webp"];

export const DESCRICAO_FORMATOS_IMAGEM = "JPG, PNG ou WEBP";

export function mensagemImagemInvalida(campo: string): string {
  return `Tipo de arquivo inválido em "${campo}". Envie uma imagem (${DESCRICAO_FORMATOS_IMAGEM}).`;
}

export function mensagemImagemOuPdfInvalido(campo: string): string {
  return `Tipo de arquivo inválido em "${campo}". Envie um PDF ou uma imagem (${DESCRICAO_FORMATOS_IMAGEM}).`;
}

export function mensagemImagemCorrompida(campo: string): string {
  return `Não foi possível processar a imagem enviada em "${campo}". O arquivo pode estar corrompido ou ser grande demais. Tente outra imagem (${DESCRICAO_FORMATOS_IMAGEM}).`;
}

export interface ArquivoPreparado {
  nomeArquivo: string;
  conteudo: Buffer;
}

function ehPdf(buffer: Buffer): boolean {
  return (
    buffer.length >= 5 && buffer.subarray(0, 5).toString("latin1") === "%PDF-"
  );
}

async function ehImagemAceita(buffer: Buffer): Promise<boolean> {
  try {
    const { format } = await sharp(buffer).metadata();
    return !!format && FORMATOS_IMAGEM_ACEITOS.includes(format);
  } catch {
    // sharp não reconheceu o conteúdo (docx, HEIC, BMP, lixo...)
    return false;
  }
}

function gerarNome(prefixo: string, extensao: string): string {
  return `${prefixo}_${Date.now()}_${randomUUID().slice(0, 8)}.${extensao}`;
}

async function converterParaWebp(
  buffer: Buffer,
  largura: number,
  campo: string,
): Promise<Buffer> {
  try {
    return await sharp(buffer).resize(largura).webp({ quality: 80 }).toBuffer();
  } catch (err) {
    // Cabeçalho válido mas conteúdo truncado/corrompido, ou imagem acima do
    // limite de pixels do sharp: erro do cliente, não do servidor.
    logger.warn(
      `Falha ao converter imagem do campo "${campo}": ${(err as Error)?.message}`,
    );
    throw new BadRequestException(mensagemImagemCorrompida(campo));
  }
}

function bufferDoArquivo(file: Express.Multer.File, mensagem: string): Buffer {
  if (!file?.buffer || file.buffer.length === 0) {
    throw new BadRequestException(mensagem);
  }
  return file.buffer;
}

/** Aceita somente imagem JPG/PNG/WEBP e devolve o arquivo já convertido em WEBP. */
export async function prepararImagemWebp(
  file: Express.Multer.File,
  campo: string,
  prefixo: string,
  largura: number,
): Promise<ArquivoPreparado> {
  const buffer = bufferDoArquivo(file, mensagemImagemInvalida(campo));
  if (!(await ehImagemAceita(buffer))) {
    throw new BadRequestException(mensagemImagemInvalida(campo));
  }
  return {
    nomeArquivo: gerarNome(prefixo, "webp"),
    conteudo: await converterParaWebp(buffer, largura, campo),
  };
}

/** Aceita PDF (gravado como está) ou imagem JPG/PNG/WEBP (convertida em WEBP). */
export async function prepararImagemOuPdf(
  file: Express.Multer.File,
  campo: string,
  prefixo: string,
  larguraImagem: number,
): Promise<ArquivoPreparado> {
  const buffer = bufferDoArquivo(file, mensagemImagemOuPdfInvalido(campo));

  if (ehPdf(buffer)) {
    return { nomeArquivo: gerarNome(prefixo, "pdf"), conteudo: buffer };
  }

  if (!(await ehImagemAceita(buffer))) {
    throw new BadRequestException(mensagemImagemOuPdfInvalido(campo));
  }
  return {
    nomeArquivo: gerarNome(prefixo, "webp"),
    conteudo: await converterParaWebp(buffer, larguraImagem, campo),
  };
}

/**
 * Grava os arquivos no diretório (criando-o se preciso). Tudo ou nada: se
 * algum falhar, remove os já gravados e relança o erro original.
 * Retorna os caminhos físicos gravados (para rollback posterior).
 */
export function gravarArquivos(
  diretorio: string,
  arquivos: ArquivoPreparado[],
): string[] {
  if (arquivos.length === 0) return [];

  const gravados: string[] = [];
  try {
    fs.mkdirSync(diretorio, { recursive: true });
    for (const arquivo of arquivos) {
      const destino = path.join(diretorio, arquivo.nomeArquivo);
      fs.writeFileSync(destino, arquivo.conteudo);
      gravados.push(destino);
    }
    return gravados;
  } catch (err) {
    removerArquivos(gravados);
    throw err;
  }
}

/** Remoção best-effort: nunca lança, só registra no log. */
export function removerArquivos(caminhos: string[]): void {
  for (const caminho of caminhos) {
    try {
      fs.rmSync(caminho, { force: true });
    } catch (err) {
      logger.error(
        `Falha ao remover arquivo órfão ${caminho}: ${(err as Error)?.message}`,
      );
    }
  }
}
