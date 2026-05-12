import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa o CORS (como você tinha no app.ts)
  app.enableCors();

  // Ativa a validação automática dos DTOs em toda a aplicação
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuração automatizada do Swagger
  const config = new DocumentBuilder()
    .setTitle("Apaixone-Se API")
    .setDescription("Documentação oficial do backend")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const PORT = process.env.PORT || 6969;
  await app.listen(PORT);
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}/api`);
}
bootstrap();
