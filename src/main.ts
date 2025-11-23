import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
console.log(process.env.JWT_ACCESS_SECRET)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS,
    credentials: true,
  });
  await app.listen(Number(process.env.PORT));
}
bootstrap();
