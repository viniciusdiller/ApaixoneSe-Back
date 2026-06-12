import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { json, urlencoded } from "express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ limit: "10mb", extended: true }));

  // CORS: credentials:true é incompatível com origin:"*".
  // Usar uma função que reflete a origem da requisição permite
  // qualquer cliente (dev + produção) sem bloquear o preflight OPTIONS.
  app.enableCors({
    origin: (origin, callback) => callback(null, origin ?? true),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization,Accept",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

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
