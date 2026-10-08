import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { createHash, randomInt } from "crypto";

import { UserRepository } from "../../data/repositories/user.repository";
import { AuthTokenRepository } from "../../data/repositories/authToken.repository";
import { EmailService } from "../services/email.service";
import {
  buildVerifyEmailTemplate,
  buildForgotPasswordTemplate,
} from "../email-templates";

import { User, PerfilUsuario } from "../../data/entities/user.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";
import { CreateUserRequestDto } from "../../presentation/dto/request/users/createUserRequestDto";
import { UserResponseDto } from "../../presentation/dto/response/userResponse.dto";
import { LoginRequestDto } from "../../presentation/dto/request/loginRequestDto";
import { LoginResponseDto } from "../../presentation/dto/response/loginResponse.dto";

const AUTH_TOKEN_TYPE = {
  VERIFY_EMAIL: "VERIFY_EMAIL",
  RESET_PASSWORD: "RESET_PASSWORD",
} as const;

@Injectable()
export class UserApplication {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: AuthTokenRepository,
    private readonly emailService: EmailService
  ) {}

  // ==========================================
  // REGISTRO E VERIFICAÇÃO
  // ==========================================
  async create(data: CreateUserRequestDto): Promise<UserResponseDto> {
    if (data.perfil === "ADMIN") {
      throw new BadRequestException("Não é permitido criar uma conta de administrador por este canal.");
    }

    const emailExiste = await this.userRepository.findByEmail(data.email);
    if (emailExiste) throw new BadRequestException("Este email já está em uso.");

    const usuarioExiste = await this.userRepository.findByUsuario(data.usuario);
    if (usuarioExiste) throw new BadRequestException("Este nome de usuário já está em uso.");

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(data.senha, salt);

    const novoUser = new User({
      nome: data.nome,
      usuario: data.usuario,
      email: data.email,
      senha: senhaCriptografada,
      perfil: data.perfil as PerfilUsuario,
      active: false,
    });

    const userSalvo = await this.userRepository.save(novoUser);
    if (!userSalvo.id) {
      throw new InternalServerErrorException("Erro ao criar usuário.");
    }

    // Gera código OTP de 6 dígitos
    const codigo = randomInt(0, 1000000).toString().padStart(6, "0");
    const tokenHash = createHash("sha256").update(codigo).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
    const verifyPageUrl = `${frontendUrl}/verificar-email`;

    await this.tokenRepository.create(
      userSalvo.id,
      tokenHash,
      AUTH_TOKEN_TYPE.VERIFY_EMAIL,
      expiresAt,
    );

    const { subject, text, html } = buildVerifyEmailTemplate({
      nome: data.nome,
      codigo,
      verifyPageUrl,
    });

    await this.emailService.sendEmail(data.email, subject, text, html);

    return this.mapToResponseDto(userSalvo);
  }

  async verifyEmail(codigo: string) {
    const normalizedCodigo = (codigo || "").trim();
    if (!normalizedCodigo) {
      throw new BadRequestException("Código inválido ou ausente.");
    }

    if (!/^\d{6}$/.test(normalizedCodigo)) {
      throw new BadRequestException("O código deve ter 6 dígitos numéricos.");
    }

    const tokenHash = createHash("sha256").update(normalizedCodigo).digest("hex");
    const authToken = await this.tokenRepository.findByToken(tokenHash);

    if (
      !authToken ||
      authToken.type !== AUTH_TOKEN_TYPE.VERIFY_EMAIL ||
      authToken.expiresAt < new Date()
    ) {
      throw new BadRequestException("Código inválido ou expirado.");
    }

    await this.userRepository.update(authToken.userId, { active: true });
    await this.tokenRepository.delete(authToken.id);
  }

  // ==========================================
  // LOGIN
  // ==========================================
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    let user = null;
    if (data.identificador.includes("@")) {
      user = await this.userRepository.findByEmail(data.identificador);
    } else {
      user = await this.userRepository.findByUsuario(data.identificador);
    }

    if (!user || !(await bcrypt.compare(data.senha, user.senha))) {
      throw new UnauthorizedException("Credenciais incorretas.");
    }

    if (!user.active) {
      throw new UnauthorizedException("Por favor, verifique seu e-mail antes de acessar.");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new InternalServerErrorException("Erro de configuração.");

    // Sessão de ADMIN mais curta (5h)
    const expiresIn = user.perfil === "ADMIN" ? "5h" : "1d";
    const token = jwt.sign({ id: user.id, perfil: user.perfil }, secret, { expiresIn });

    return { token, user: this.mapToResponseDto(user) };
  }

  // ==========================================
  // ESQUECI A SENHA / RESET
  // ==========================================
  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException("Usuário não encontrado.");
    if (!user.id) {
      throw new InternalServerErrorException("Usuário inválido para recuperação de senha.");
    }

    const codigo = randomInt(0, 1000000).toString().padStart(6, "0");
    const tokenHash = createHash("sha256").update(codigo).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await this.tokenRepository.create(
      user.id,
      tokenHash,
      AUTH_TOKEN_TYPE.RESET_PASSWORD,
      expiresAt,
    );

    const { subject, text, html } = buildForgotPasswordTemplate({ codigo });

    await this.emailService.sendEmail(email, subject, text, html);
  }

  async resetPassword(token: string, newPassword: string) {
    const normalizedToken = (token || "").trim();
    if (!/^\d{6}$/.test(normalizedToken)) {
      throw new BadRequestException("O código deve ter 6 dígitos numéricos.");
    }

    const tokenHash = createHash("sha256").update(normalizedToken).digest("hex");
    const authToken = await this.tokenRepository.findByToken(tokenHash);

    if (
      !authToken ||
      authToken.type !== AUTH_TOKEN_TYPE.RESET_PASSWORD ||
      authToken.expiresAt < new Date()
    ) {
      throw new BadRequestException("Código inválido ou expirado.");
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(newPassword, salt);

    await this.userRepository.update(authToken.userId, { senha: senhaCriptografada });
    await this.tokenRepository.delete(authToken.id);
  }

  // ==========================================
  // OUTROS MÉTODOS (findAll, findById, update, delete)
  // ==========================================
  async findAll(usuarioLogado: IUsuarioLogado): Promise<UserResponseDto[]> {
    if (usuarioLogado.perfil !== "ADMIN") throw new ForbiddenException("Apenas administradores.");
    const users = await this.userRepository.findAll();
    return users.map((user) => this.mapToResponseDto(user));
  }

  async findById(id: string, usuarioLogado: IUsuarioLogado): Promise<UserResponseDto> {
    if (usuarioLogado.perfil !== "ADMIN" && usuarioLogado.id !== id)
      throw new ForbiddenException("Sem permissão.");
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado.");
    return this.mapToResponseDto(user);
  }

  async update(id: string, data: any, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.perfil !== "ADMIN" && usuarioLogado.id !== id)
      throw new ForbiddenException("Sem permissão.");

    // Regra de negócio: filtra campos editáveis conforme o perfil do usuário logado
    const CAMPOS_EDITAVEIS: Record<string, string[]> = {
      USUARIO: ["nome", "email", "usuario", "senha"],
      PARCEIRO: ["nome", "email", "usuario", "senha"],
      ADMIN: ["nome", "email", "usuario", "senha", "perfil", "active"],
    };

    const permitidos = CAMPOS_EDITAVEIS[usuarioLogado.perfil] || [];
    const camposNaoPermitidos = Object.keys(data).filter((c) => !permitidos.includes(c));

    if (camposNaoPermitidos.length > 0) {
      throw new BadRequestException("Campo não permitido.");
    }

    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado.");
    if (data.senha) {
      const salt = await bcrypt.genSalt(10);
      data.senha = await bcrypt.hash(data.senha, salt);
    }
    const atualizado = await this.userRepository.update(id, data);
    return this.mapToResponseDto(atualizado);
  }

  // Edição do próprio perfil (PUT /users/:id): só o dono, nem admin edita outro por aqui
  async updateProprio(id: string, data: any, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.id !== id) throw new ForbiddenException("Sem permissão.");
    return this.update(id, data, usuarioLogado);
  }

  // Edição administrativa (PUT /users/:id/admin): aceita perfil e active
  async updateAdmin(id: string, data: any, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.perfil !== "ADMIN")
      throw new ForbiddenException("Apenas administradores.");
    return this.update(id, data, usuarioLogado);
  }

  // Usado pela JwtStrategy: retorna o perfil e o status atuais do usuário
  // direto do banco, para não confiar apenas no perfil gravado no JWT.
  async obterSituacaoAtual(
    id: string,
  ): Promise<{ perfil: IUsuarioLogado["perfil"]; active: boolean } | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    return { perfil: user.perfil as IUsuarioLogado["perfil"], active: user.active };
  }

  async delete(id: string, usuarioLogado: IUsuarioLogado): Promise<void> {
    if (usuarioLogado.perfil !== "ADMIN" && usuarioLogado.id !== id)
      throw new ForbiddenException("Sem permissão.");
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado.");
    await this.userRepository.delete(id);
  }

  private mapToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      nome: user.nome,
      usuario: user.usuario,
      email: user.email,
      perfil: user.perfil,
      active: user.active,
      createdAt: user.createdAt,
    };
  }
}
