import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { UserApplication } from "../../application/applications/user.Application";
import { CreateUserRequestDto } from "../dto/request/users/createUserRequestDto";
import { UserResponseDto } from "../dto/response/userResponse.dto";
import { LoginRequestDto } from "../dto/request/loginRequestDto";
import { LoginResponseDto } from "../dto/response/loginResponse.dto";
import { ForgotPasswordRequestDto } from "../dto/request/auth/forgotPasswordRequest.dto";
import { ResetPasswordRequestDto } from "../dto/request/auth/resetPasswordRequest.dto";
import { VerifyEmailRequestDto } from "../dto/request/auth/verifyEmailRequest.dto";
import { SetActiveRequestDto } from "../dto/request/users/setActiveRequestDto";
import { UpdateUserRequestDto } from "../dto/request/users/updateUserRequestDto";

@ApiTags("Autenticação e Usuários")
@Controller("users")
export class UserController {
  constructor(private readonly userApplication: UserApplication) {}

  // ---------------------------------------------------------
  // ROTA: POST /users/register
  // ---------------------------------------------------------
  @Post("register")
  @ApiOperation({ summary: "Cria uma nova conta de usuário" })
  @ApiResponse({
    status: 201,
    description: "Usuário criado com sucesso",
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Erro de validação ou email/usuário já existente",
  })
  async register(
    @Body() createUserDto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.userApplication.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lista todos os usuários (Apenas Admin)" })
  async findAll(@Req() req: any) {
    return this.userApplication.findAll(req.user);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Busca um usuário por ID (Dono ou Admin)" })
  async findById(@Param("id") id: string, @Req() req: any) {
    return this.userApplication.findById(id, req.user);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualiza um usuário (Dono ou Admin)" })
  async update(@Param("id") id: string, @Body() dto: UpdateUserRequestDto, @Req() req: any) {
    return this.userApplication.update(id, dto, req.user);
  }

  // ---------------------------------------------------------
  // ROTA: PATCH /users/:id  — altera apenas o campo active
  // Usado pelo painel admin para alternar "Email verificado"
  // ---------------------------------------------------------
  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Altera o status active do usuário (apenas Admin)" })
  @ApiResponse({
    status: 200,
    description: "Status atualizado com sucesso",
    type: UserResponseDto,
  })
  async setActive(
    @Param("id") id: string,
    @Body() dto: SetActiveRequestDto,
    @Req() req: any,
  ) {
    return this.userApplication.update(id, { active: dto.active }, req.user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Exclui um usuário (Dono ou Admin)" })
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.userApplication.delete(id, req.user);
  }

  // ---------------------------------------------------------
  // ROTA: POST /users/login
  // ---------------------------------------------------------
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Autentica um usuário e retorna um token JWT" })
  @ApiResponse({
    status: 200,
    description: "Login efetuado com sucesso",
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: "Credenciais incorretas" })
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.userApplication.login(loginDto);
  }

  // ---------------------------------------------------------
  // ROTA: POST /users/verify-email
  // Recebe o código OTP de 6 dígitos enviado ao e-mail
  // NÃO há mais GET /users/verify-email — o usuário não clica
  // em link que aponta para o backend.
  // ---------------------------------------------------------
  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verifica o e-mail com código OTP de 6 dígitos" })
  @ApiResponse({ status: 200, description: "E-mail verificado com sucesso" })
  @ApiResponse({ status: 400, description: "Código inválido ou expirado" })
  async verifyEmail(@Body() dto: VerifyEmailRequestDto) {
    await this.userApplication.verifyEmail(dto.token);
    return { message: "E-mail verificado com sucesso." };
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Envia código OTP de recuperação de senha para o e-mail" })
  @ApiResponse({ status: 200, description: "E-mail de recuperação enviado" })
  async forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    await this.userApplication.forgotPassword(dto.email);
    return { message: "Código de recuperação enviado para o e-mail informado." };
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Redefine a senha usando código OTP de 6 dígitos" })
  @ApiResponse({ status: 200, description: "Senha redefinida com sucesso" })
  async resetPassword(@Body() dto: ResetPasswordRequestDto) {
    await this.userApplication.resetPassword(dto.token, dto.senha);
    return { message: "Senha redefinida com sucesso." };
  }
}
