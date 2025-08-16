import { User } from '@/modules/users/entities/user.entity';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { GenerateTokensUseCase } from './generate-tokens.usecase';

let inMemoryUserRepository: InMemoryUserRepository;
let bcryptHasher: FakeEncrypter;
let sut: GenerateTokensUseCase;

describe('GenerateTokensUseCase', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    bcryptHasher = new FakeEncrypter();

    sut = new GenerateTokensUseCase(bcryptHasher);
  });

  it('should return a access token and a refresh token', async () => {
    const user = new User({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password-hashed',
    });

    await inMemoryUserRepository.create(user);

    const result = await sut.execute(user.id);

    expect(result.isRight()).toBe(true);
    expect(result.value).toHaveProperty('accessToken');
    expect(result.value).toHaveProperty('refreshToken');
  });
});
