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
import { UserRepository } from "../../data/repositories/user.repository";
import { User, PerfilUsuario } from "../../data/entities/user.Entity";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";
import { CreateUserRequestDto } from "../../presentation/dto/request/users/createUserRequestDto";
import { UserResponseDto } from "../../presentation/dto/response/userResponse.dto";
import { LoginRequestDto } from "../../presentation/dto/request/loginRequestDto";
import { LoginResponseDto } from "../../presentation/dto/response/loginResponse.dto";

@Injectable()
export class UserApplication {
  // O NestJS injeta o nosso Repository automaticamente aqui!
  constructor(private readonly userRepository: UserRepository) {}

  // ==========================================
  // REGISTRO DE USUÁRIO
  // ==========================================
  async create(data: CreateUserRequestDto): Promise<UserResponseDto> {
    // 1. Regra de Segurança: Bloquear ADMIN via rota pública
    if (data.perfil === "ADMIN") {
      throw new BadRequestException(
        "Não é permitido criar uma conta de administrador por este canal.",
      );
    }

    // 2. Verificar se o email ou usuário já existem
    const emailExiste = await this.userRepository.findByEmail(data.email);
    if (emailExiste)
      throw new BadRequestException("Este email já está em uso.");

    const usuarioExiste = await this.userRepository.findByUsuario(data.usuario);
    if (usuarioExiste)
      throw new BadRequestException("Este nome de usuário já está em uso.");

    // 3. Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(data.senha, salt);

    // 4. Criar a entidade e salvar no banco
    const novoUser = new User({
      nome: data.nome,
      usuario: data.usuario,
      email: data.email,
      senha: senhaCriptografada,
      perfil: data.perfil as PerfilUsuario,
    });

    const userSalvo = await this.userRepository.save(novoUser);

    // 5. Retornar os dados limpos (sem a senha)
    return this.mapToResponseDto(userSalvo);
  }

  // ==========================================
  // LOGIN DE USUÁRIO
  // ==========================================
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    let user = null;

    // 1. É email ou é usuário?
    if (data.identificador.includes("@")) {
      user = await this.userRepository.findByEmail(data.identificador);
    } else {
      user = await this.userRepository.findByUsuario(data.identificador);
    }

    // 2. Segurança: Mensagem genérica para não dar pistas (401 Unauthorized)
    if (!user) {
      throw new UnauthorizedException("Credenciais incorretas.");
    }

    // 3. Comparar a senha
    const senhaCorreta = await bcrypt.compare(data.senha, user.senha);
    if (!senhaCorreta) {
      throw new UnauthorizedException("Credenciais incorretas.");
    }

    // 4. Fabricar o Token JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new InternalServerErrorException(
        "Chave JWT não configurada no servidor.",
      );
    }

    const tokenPayload = {
      id: user.id,
      perfil: user.perfil,
    };

    const token = jwt.sign(tokenPayload, secret, { expiresIn: "1d" });

    // 5. Retornar Token + Dados
    return {
      token: token,
      user: this.mapToResponseDto(user),
    };
  }

  async findAll(usuarioLogado: IUsuarioLogado): Promise<UserResponseDto[]> {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem listar todos os usuários.",
      );
    }
    const users = await this.userRepository.findAll();
    return users.map((user) => this.mapToResponseDto(user));
  }

  async findById(
    id: string,
    usuarioLogado: IUsuarioLogado,
  ): Promise<UserResponseDto> {
    // Regra: Próprio usuário ou ADMIN
    if (usuarioLogado.perfil !== "ADMIN" && usuarioLogado.id !== id) {
      throw new ForbiddenException(
        "Você não tem permissão para ver detalhes de outro usuário.",
      );
    }

    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado.");
    return this.mapToResponseDto(user);
  }

  // 🔒 OWNERSHIP OU ADMIN
  async update(id: string, data: any, usuarioLogado: IUsuarioLogado) {
    if (usuarioLogado.perfil !== "ADMIN" && usuarioLogado.id !== id) {
      throw new ForbiddenException(
        "Você só pode alterar o seu próprio perfil.",
      );
    }

    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado.");

    // Se o usuário estiver enviando uma senha nova para atualizar, ela DEVE ser criptografada
    if (data.senha) {
      const salt = await bcrypt.genSalt(10);
      data.senha = await bcrypt.hash(data.senha, salt);
    }

    const atualizado = await this.userRepository.update(id, data);
    return this.mapToResponseDto(atualizado);
  }

  // 🔒 OWNERSHIP OU ADMIN
  async delete(id: string, usuarioLogado: IUsuarioLogado): Promise<void> {
    if (usuarioLogado.perfil !== "ADMIN" && usuarioLogado.id !== id) {
      throw new ForbiddenException("Você só pode excluir a sua própria conta.");
    }

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
      createdAt: user.createdAt,
    };
  }
}
