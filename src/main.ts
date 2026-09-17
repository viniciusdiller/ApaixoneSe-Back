import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./presentation/filters/prisma-exception.filter";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as express from "express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("api");

  app.use("/api/uploads", express.static(join(__dirname, "..", "uploads")));
  app.use("/api/public", express.static(join(__dirname, "..", "public")));

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

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

  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("Apaixone-Se API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  const PORT = process.env.PORT || 3305;
  console.log("📂 Caminho UPLOADS:", join(__dirname, "..", "uploads"));
  console.log("📂 Caminho PUBLIC:", join(__dirname, "..", "public"));
  await app.listen(PORT);
  console.log(`🚀 Swagger disponível em: http://localhost:${PORT}/api-docs`);
}
bootstrap();
