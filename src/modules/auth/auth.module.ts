import { CookieManagerModule } from '@app/cookie/cookie-manager.module';
import { CryptographyModule } from '@app/cryptography';
import { EnvModule, EnvService } from '@app/env';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/repositories/typeorm/user-repository';
import { UserRepositoryInterface } from '../users/repositories/user-repository.interface';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CreateRefreshTokenUseCase } from './usecases/create-refresh-token.usecase';
import { GenerateTokensUseCase } from './usecases/generate-tokens.usecase';
import { RemoveRefreshTokenUseCase } from './usecases/remove-refresh-token.usecase';
import { SignInUseCase } from './usecases/sing-in.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EnvModule,
    CryptographyModule,
    CookieManagerModule,
    JwtModule.registerAsync({
      global: true,
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    SignInUseCase,
    GenerateTokensUseCase,
    CreateRefreshTokenUseCase,
    RemoveRefreshTokenUseCase,
    {
      provide: UserRepositoryInterface,
      useClass: UserRepository,
    },
  ],
})
export class AuthModule {}
