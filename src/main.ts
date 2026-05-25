import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { json, urlencoded } from "express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Aumenta o limite do body para suportar imagens em base64 (data URLs)
  // O padrão do Express é 100kb — insuficiente para imagens. 10mb cobre a maioria dos casos.
  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ limit: "10mb", extended: true }));

  // Ativa o CORS (como você tinha no app.ts)
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // Ativa a validação automática dos DTOs em toda a aplicação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Isto permite que a pasta física 'uploads' seja acessível pelo navegador
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

  // Configuração automatizada do Swagger
  const config = new DocumentBuilder()
    .setTitle("Apaixone-Se API")
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
