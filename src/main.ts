import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

// somewhere in your initialization file

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(3001);
}
bootstrap();
