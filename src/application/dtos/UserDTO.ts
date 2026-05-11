// O que vem da requisição do front-end (Input)
export interface CreateUserDTO {
  nome: string;
  usuario: string;
  email: string;
  senha: string;
}

// O que nós devolvemos para o front-end (Output)
// Repare que NÃO DEVOLVEMOS A SENHA! Essa é a grande utilidade do DTO de saída.
export interface UserOutputDTO {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  createdAt: Date;
}
