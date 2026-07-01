import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Verifica se as variáveis essenciais estão presentes
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
      this.logger.warn('Configurações de e-mail (MAIL_HOST, USER ou PASS) ausentes. E-mails estarão desativados.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 465,
      secure: true, // Obrigatório para porta 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Necessário para alguns servidores corporativos/governamentais
      tls: {
        rejectUnauthorized: false 
      }
    });

    // Testa a conexão ao iniciar
    this.transporter.verify().then(() => {
      this.logger.log('Conexão com o servidor SMTP estabelecida com sucesso!');
    }).catch((err) => {
      this.logger.error('Erro ao conectar no servidor SMTP:', err);
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    if (!this.transporter) {
      this.logger.warn(`Simulando envio de e-mail para ${to}: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`E-mail enviado com sucesso para ${to}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail para ${to}`, error);
      throw error;
    }
  }
}