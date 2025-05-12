import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from 'src/core/transform.interceptor';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe(
    { whitelist: true, transform: true, forbidNonWhitelisted: true }
  ));
  const reflector = app.get(Reflector);
  // const jwtService = app.get(JwtService);
  // const configService = app.get(ConfigService);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useStaticAssets(join(__dirname, '..', 'public'));


  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    preflightContinue: false,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2']
  });



  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
