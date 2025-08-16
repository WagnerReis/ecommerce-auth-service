import { left, right } from '@/core/either';
import { User } from '@/modules/users/entities/user.entity';
import { EnvService } from '@app/env';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { CreateRefreshTokenUseCase } from './create-refresh-token.usecase';
import { GenerateTokensUseCase } from './generate-tokens.usecase';

let inMemoryUserRepository: InMemoryUserRepository;
let bcryptHasher: FakeEncrypter;
let hasher: FakeHasher;
let generateTokens: GenerateTokensUseCase;
let jwtService: JwtService;
let envService: EnvService;
let sut: CreateRefreshTokenUseCase;

describe('RefreshTokenUseCase', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    hasher = new FakeHasher();
    bcryptHasher = new FakeEncrypter();
    generateTokens = new GenerateTokensUseCase(bcryptHasher);
    jwtService = new JwtService();
    envService = new EnvService(new ConfigService());

    sut = new CreateRefreshTokenUseCase(
      inMemoryUserRepository,
      jwtService,
      envService,
      generateTokens,
      hasher,
    );
  });

  it('should return UnauthorizedException when refresh token is missing', async () => {
    const result = await sut.execute('');

    expect(result.isLeft()).toBe(true);
    const error = result.value as UnauthorizedException;
    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.message).toBe('Missing refresh token');
  });

  it('should return UnauthorizedException when refresh token is invalid', async () => {
    vi.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error();
    });

    const result = await sut.execute('invalid_token');

    expect(result.isLeft()).toBe(true);
    const error = result.value as UnauthorizedException;
    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.message).toBe('Invalid refresh token');
  });
  it('should return NotFoundException when user is not found', async () => {
    vi.spyOn(jwtService, 'verify').mockReturnValue({
      sub: 'non_existent_user_id',
    });
    vi.spyOn(inMemoryUserRepository, 'findById').mockResolvedValue(null);

    const result = await sut.execute('valid_token');

    expect(result.isLeft()).toBe(true);
    const error = result.value as NotFoundException;
    expect(error).toBeInstanceOf(NotFoundException);
    expect(error.message).toBe('User not found');
  });

  it('should return UnauthorizedException when refresh token does not match', async () => {
    const user = new User({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
    });

    vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: user.id });
    vi.spyOn(inMemoryUserRepository, 'findById').mockResolvedValue(user);
    vi.spyOn(hasher, 'compare').mockReturnValue(false);

    const result = await sut.execute('invalid_refresh_token');

    expect(result.isLeft()).toBe(true);
    const error = result.value as UnauthorizedException;
    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.message).toBe('Refresh token does not match');
  });

  it('should return BadRequestException when token generation fails', async () => {
    const user = new User({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
    });

    vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: user.id });
    vi.spyOn(inMemoryUserRepository, 'findById').mockResolvedValue(user);
    vi.spyOn(hasher, 'compare').mockReturnValue(true);
    vi.spyOn(generateTokens, 'execute').mockResolvedValue(left(null));

    const result = await sut.execute('valid_refresh_token');

    expect(result.isLeft()).toBe(true);
    const error = result.value as BadRequestException;
    expect(error).toBeInstanceOf(BadRequestException);
    expect(error.message).toBe('Failed to generate new tokens');
  });

  it('should successfully refresh tokens', async () => {
    const user = new User({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
    });

    vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: user.id });
    vi.spyOn(inMemoryUserRepository, 'findById').mockResolvedValue(user);
    vi.spyOn(hasher, 'compare').mockReturnValue(true);
    vi.spyOn(generateTokens, 'execute').mockResolvedValue(
      right({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      }),
    );

    const result = await sut.execute('valid_refresh_token');

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
    });
  });
});
