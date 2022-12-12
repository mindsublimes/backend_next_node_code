import ResponseHandlerInterceptor from './interceptors/response-handler.interceptor';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log(`${process.cwd()}/.env.${process.env.NODE_ENV}`)
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseHandlerInterceptor());
  const whitelist = process.env.WHITE_LIST;
  app.enableCors({
    origin: (origin, callback) => {
      // Logging incoming requests
      console.log(`request coming from ${origin}`);
      if (whitelist.indexOf(origin) >= 0 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: 'Content-Type, Accept',
    methods: 'GET,PUT,POST,DELETE,UPDATE',
  });
  await app.listen(process.env.PORT, () => {
    console.log(`listening application at ${process.env.PORT}`);
  });
}
bootstrap();
