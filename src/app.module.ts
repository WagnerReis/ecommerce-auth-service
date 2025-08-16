import { CryptographyModule } from '@app/cryptography';
import { envSchema } from '@app/env/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
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
  ],
})
export class AppModule {}
