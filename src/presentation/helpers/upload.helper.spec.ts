import { BadRequestException } from "@nestjs/common";
import sharp from "sharp";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  prepararImagemWebp,
  prepararImagemOuPdf,
  gravarArquivos,
  removerArquivos,
} from "./upload.helper";

function criarFile(
  buffer: Buffer,
  originalname = "arquivo.bin",
  mimetype = "application/octet-stream",
): Express.Multer.File {
  return {
    fieldname: "arquivo",
    originalname,
    encoding: "7bit",
    mimetype,
    size: buffer.length,
    buffer,
    destination: "",
    filename: "",
    path: "",
    stream: undefined as any,
  };
}

describe("upload.helper", () => {
  let pngValido: Buffer;

  beforeAll(async () => {
    pngValido = await sharp({
      create: {
        width: 20,
        height: 20,
        channels: 3,
        background: { r: 10, g: 100, b: 200 },
      },
    })
      .png()
      .toBuffer();
  });

  describe("prepararImagemWebp", () => {
    it("converte PNG válido para WEBP", async () => {
      const resultado = await prepararImagemWebp(
        criarFile(pngValido, "foto.png", "image/png"),
        "Foto",
        "foto",
        500,
      );

      expect(resultado.nomeArquivo).toMatch(/^foto_\d+_[a-f0-9]{8}\.webp$/);
      const meta = await sharp(resultado.conteudo).metadata();
      expect(meta.format).toBe("webp");
    });

    it("rejeita DOCX (ZIP) com BadRequestException e mensagem de tipo inválido", async () => {
      const docxFalso = Buffer.from("PK\x03\x04conteudo-de-docx-zip");
      await expect(
        prepararImagemWebp(
          criarFile(
            docxFalso,
            "documento.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ),
          "Foto",
          "foto",
          500,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'Tipo de arquivo inválido em "Foto". Envie uma imagem (JPG, PNG ou WEBP).',
        ),
      );
    });

    it("rejeita HEIC e BMP mesmo com extensão .jpg", async () => {
      const heicHeader = Buffer.from(
        "\x00\x00\x00\x18ftypheic\x00\x00\x00\x00heicmif1",
        "binary",
      );
      await expect(
        prepararImagemWebp(
          criarFile(heicHeader, "foto_iphone.jpg", "image/jpeg"),
          "Foto",
          "foto",
          500,
        ),
      ).rejects.toThrow(/Tipo de arquivo inválido em "Foto"/);

      const bmpHeader = Buffer.from("BM6\x00\x00\x00\x00\x00\x00\x00", "binary");
      await expect(
        prepararImagemWebp(
          criarFile(bmpHeader, "imagem.bmp", "image/bmp"),
          "Logo",
          "logo",
          500,
        ),
      ).rejects.toThrow(/Tipo de arquivo inválido em "Logo"/);
    });

    it("rejeita PDF quando apenas imagem é esperada", async () => {
      const pdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF");
      await expect(
        prepararImagemWebp(
          criarFile(pdfBuffer, "arquivo.pdf", "application/pdf"),
          "Logo",
          "logo",
          500,
        ),
      ).rejects.toThrow(/Tipo de arquivo inválido em "Logo"/);
    });

    it("rejeita buffer vazio com BadRequestException", async () => {
      await expect(
        prepararImagemWebp(
          criarFile(Buffer.alloc(0), "vazio.png", "image/png"),
          "Logo",
          "logo",
          500,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("prepararImagemOuPdf", () => {
    it("aceita PDF real pelos magic bytes (%PDF-), independente da extensão", async () => {
      const pdfBuffer = Buffer.from("%PDF-1.7\nconteudo pdf\n%%EOF");
      const resultado = await prepararImagemOuPdf(
        criarFile(pdfBuffer, "cadastur_sem_extensao", "application/octet-stream"),
        "Comprovante Cadastur",
        "comprovante",
        800,
      );

      expect(resultado.nomeArquivo).toMatch(
        /^comprovante_\d+_[a-f0-9]{8}\.pdf$/,
      );
      expect(resultado.conteudo.equals(pdfBuffer)).toBe(true);
    });

    it("rejeita DOCX enviado no comprovante com BadRequestException clara", async () => {
      const docxFalso = Buffer.from("PK\x03\x04word/document.xml");
      await expect(
        prepararImagemOuPdf(
          criarFile(docxFalso, "comprovante.docx"),
          "Comprovante Cadastur",
          "comprovante",
          800,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'Tipo de arquivo inválido em "Comprovante Cadastur". Envie um PDF ou uma imagem (JPG, PNG ou WEBP).',
        ),
      );
    });

    it("rejeita arquivo renomeado para .pdf que não tem cabeçalho %PDF-", async () => {
      const falsoPdf = Buffer.from("Isto nao e um PDF nem uma imagem");
      await expect(
        prepararImagemOuPdf(
          criarFile(falsoPdf, "falso.pdf", "application/pdf"),
          "Comprovante Cadastur",
          "comprovante",
          800,
        ),
      ).rejects.toThrow(/Tipo de arquivo inválido em "Comprovante Cadastur"/);
    });

    it("converte imagem PNG enviada no comprovante para WEBP", async () => {
      const resultado = await prepararImagemOuPdf(
        criarFile(pngValido, "comprovante.png", "image/png"),
        "Comprovante Cadastur",
        "comprovante",
        800,
      );

      expect(resultado.nomeArquivo).toMatch(
        /^comprovante_\d+_[a-f0-9]{8}\.webp$/,
      );
      const meta = await sharp(resultado.conteudo).metadata();
      expect(meta.format).toBe("webp");
    });
  });

  describe("gravarArquivos e removerArquivos", () => {
    it("cria o diretório se não existir e grava todos os arquivos", () => {
      const baseTmp = fs.mkdtempSync(path.join(os.tmpdir(), "upload-helper-"));
      const subDir = path.join(baseTmp, "pasta_nova", "sub");

      try {
        const caminhos = gravarArquivos(subDir, [
          { nomeArquivo: "a.pdf", conteudo: Buffer.from("%PDF-1.4") },
          { nomeArquivo: "b.webp", conteudo: Buffer.from("webp") },
        ]);

        expect(caminhos).toHaveLength(2);
        expect(fs.existsSync(caminhos[0])).toBe(true);
        expect(fs.existsSync(caminhos[1])).toBe(true);

        removerArquivos(caminhos);
        expect(fs.existsSync(caminhos[0])).toBe(false);
        expect(fs.existsSync(caminhos[1])).toBe(false);
      } finally {
        fs.rmSync(baseTmp, { recursive: true, force: true });
      }
    });
  });
});
