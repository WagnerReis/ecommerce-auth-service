import { HashGenerator } from '@/core/cryptography/hash-generator';
import { left } from '@/core/either';
import { User } from '@/modules/users/entities/user.entity';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { GenerateTokensUseCase } from './generate-tokens.usecase';
import { SignInUseCase } from './sing-in.usecase';

let inMemoryUserRepository: InMemoryUserRepository;
let bcryptHasher: FakeEncrypter;
let hashComparer: FakeHasher;
let hashGenerator: HashGenerator;
let generateTokens: GenerateTokensUseCase;
let sut: SignInUseCase;

describe('SignInUseCase', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    bcryptHasher = new FakeEncrypter();
    hashComparer = new FakeHasher();
    hashGenerator = new FakeHasher();
    generateTokens = new GenerateTokensUseCase(bcryptHasher);

    sut = new SignInUseCase(
      inMemoryUserRepository,
      generateTokens,
      hashComparer,
      hashGenerator,
    );
  });

  it('should return a access token', async () => {
    const user = new User({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password-hashed',
    });

    await inMemoryUserRepository.create(user);

    const result = await sut.execute('any_email', 'any_password');

    expect(result.isRight()).toBe(true);
    expect(result.value).toHaveProperty('accessToken');
  });

  it('should return unauthorized error if email is invalid', async () => {
    const result = await sut.execute('invalid_email', 'any_password');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedException);
  });

  it('should return unauthorized error if password is invalid', async () => {
    const user = new User({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password-hashed',
    });

    await inMemoryUserRepository.create(user);

    const result = await sut.execute('any_email', 'invalid_password');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedException);
  });

  it('should return an error if GenerateTokensUseCase fails', async () => {
    const user = new User({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password-hashed',
    });

    vi.spyOn(generateTokens, 'execute').mockResolvedValue(left(null));

    await inMemoryUserRepository.create(user);

    const result = await sut.execute('any_email', 'any_password');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestException);
  });
});
