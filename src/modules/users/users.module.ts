import { CryptographyModule } from '@app/cryptography';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppI18nModule } from 'i18n/i18n.module';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/typeorm/user-repository';
import { UserRepositoryInterface } from './repositories/user-repository.interface';
import { RegisterUserUseCase } from './use-cases/register.usecase';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CryptographyModule,
    AppI18nModule,
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: UserRepositoryInterface,
      useClass: UserRepository,
    },
    RegisterUserUseCase,
  ],
})
export class UsersModule {}
