import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserPresenter } from './presenters/user-presenter';
import { RegisterUserUseCase } from './use-cases/register.usecase';

@Controller('users')
export class UsersController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Public()
  @Post()
  async register(@Body() userData: CreateUserDTO) {
    try {
      const user = await this.registerUserUseCase.execute(userData);
      return UserPresenter.toHTTP(user);
    } catch (error) {
      throw new HttpException(error.message as string, 400);
    }
  }
}
