import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.BACKEND_PORT || 3000;
  console.log(
    `Launching NestJS app on port ${port}, URL: http://0.0.0.0:${port}`,
  );
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(port);
}
bootstrap();
