import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ApaixoneSe API",
      version: "1.0.0",
      description: "Documentação da API de Usuários",
    },
    // Definimos as categorias (tags) aqui
    tags: [
      { name: "Usuários", description: "Gerenciamento de contas de usuários" },
    ],
    // DEFINIMOS AS ROTAS DIRETAMENTE AQUI, EM FORMATO DE OBJETO!
    paths: {
      "/api/users/register": {
        post: {
          summary: "Cria uma nova conta de usuário",
          tags: ["Usuários"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nome", "usuario", "email", "senha"],
                  properties: {
                    nome: { type: "string", example: "Vinícius Diller" },
                    usuario: { type: "string", example: "viniciusdiller" },
                    email: {
                      type: "string",
                      example: "viniciusdiller.sgms@gmail.com",
                    },
                    senha: {
                      type: "string",
                      format: "password",
                      example: "SenhaSegura123!",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Usuário criado com sucesso" },
            "400": { description: "Erro de validação (ex: email já existe)" },
            "500": { description: "Erro interno do servidor" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Como agora a configuração está toda aqui dentro,
  // deixamos a lista de arquivos de busca vazia para ele não procurar nos comentários.
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
