import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/typeorm/user-repository';
import { UserRepositoryInterface } from './repositories/user-repository.interface';
import { RegisterUserUseCase } from './use-cases/register.usecase';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
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
