import { CryptographyModule } from '@app/cryptography';
import { envSchema } from '@app/env/env';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppI18nModule } from '../i18n/i18n.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    UsersModule,
    DatabaseModule,
    CryptographyModule,
    AuthModule,
    AppI18nModule,
    HealthModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 60, // segundos
      max: 100, // número máximo de itens
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
