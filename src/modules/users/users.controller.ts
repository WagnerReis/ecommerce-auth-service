import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { RegisterUserUseCase } from './use-cases/register.usecase';

@Controller('users')
export class UsersController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post()
  async register(@Body() userData: CreateUserDTO) {
    try {
      return await this.registerUserUseCase.execute(userData);
    } catch (error) {
      throw new HttpException(error.message as string, 400);
    }
  }
}
