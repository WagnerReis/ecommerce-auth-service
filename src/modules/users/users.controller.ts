import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserPresenter } from './presenters/user-presenter';
import { NotFoundError } from './use-cases/errors/not-found.error';
import { GetUserUseCase } from './use-cases/get-user.usecase';
import { RegisterUserUseCase } from './use-cases/register.usecase';

@Controller('users')
export class UsersController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

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

  @Get()
  async getUser(@CurrentUser() user: { sub: string }) {
    try {
      const result = await this.getUserUseCase.execute(user.sub);

      if (result.isLeft()) {
        const error = result.value;

        if (error instanceof NotFoundError) {
          throw new NotFoundException(error.message);
        } else {
          throw new InternalServerErrorException(error);
        }
      }

      return UserPresenter.toHTTP(result.value.user);
    } catch (error) {
      throw new HttpException(error.message as string, 400);
    }
  }
}
