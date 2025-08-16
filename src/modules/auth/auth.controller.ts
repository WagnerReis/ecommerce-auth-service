import { CookieManagerInterface } from '@/core/cookie/cookie-manager.interface';
import { EnvService } from '@app/env';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import express from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { CreateRefreshTokenUseCase } from './usecases/create-refresh-token.usecase';
import { RemoveRefreshTokenUseCase } from './usecases/remove-refresh-token.usecase';
import { SignInUseCase } from './usecases/sing-in.usecase';

class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly envService: EnvService,
    private readonly cookieManager: CookieManagerInterface,
    private readonly refreshTokenUseCase: CreateRefreshTokenUseCase,
    private readonly removeRefreshTokenUseCase: RemoveRefreshTokenUseCase,
  ) {}

  private readonly logger: Logger = new Logger(AuthController.name);

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(SignInDto)
  async signIn(@Body() signInBody: SignInDto, @Res() res: express.Response) {
    try {
      this.logger.log(`Login attempt for email: ${signInBody.email}`);

      const result = await this.signInUseCase.execute(
        signInBody.email,
        signInBody.password,
      );

      if (result.isLeft()) {
        const error = result.value;
        this.logger.warn(`Login failed for email: ${signInBody.email}`);
        throw error;
      }

      const { accessToken, refreshToken } = result.value;

      this.cookieManager.setAuthCookies(res, accessToken, refreshToken);

      this.logger.log(`User successfully logged in: ${signInBody.email}`);

      return res.json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      this.logger.error(`Login error for email: ${signInBody.email}`);
      throw error;
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: express.Request, @Res() res: express.Response) {
    const refreshToken = req.cookies['refreshToken'] as string;

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    const { accessToken, refreshToken: newRefreshToken } = result.value;

    this.cookieManager.setAuthCookies(res, accessToken, newRefreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentUser('sub') userId: string,
    @Res() res: express.Response,
    @Req() req: express.Request,
  ) {
    try {
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      this.logger.log(`User logout initiated: ${userId} from IP: ${req.ip}`);

      const result = await this.removeRefreshTokenUseCase.execute(userId);

      if (result.isLeft()) {
        const error = result.value;
        this.logger.error(`Logout failed for user ${userId}: ${error.message}`);
        throw new BadRequestException(error.message);
      }

      this.cookieManager.clearAuthCookies(res);

      this.logger.log(`User successfully logged out: ${userId}`);

      return res.json({
        success: true,
        message: 'Successfully logged out',
      });
    } catch (error) {
      this.logger.error(`Logout error for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  @Get('me')
  getProfile(@CurrentUser() user: { sub: string }) {
    console.log('aqui');
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    this.logger.log(`Profile requested for user: ${user.sub}`);

    return user;
  }
}
