import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Put,
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

@ApiTags("Autenticação e Usuários") // O nome da aba lá no Swagger
@Controller("users") // A URL base será /users
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
    // O @Body() já garante que o JSON que chegou passou pelo DTO e é válido!
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
  async update(@Param("id") id: string, @Body() dto: any, @Req() req: any) {
    return this.userApplication.update(id, dto, req.user);
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
  @HttpCode(HttpStatus.OK) // Força o status 200 em vez do 201 padrão do Post
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
}
