import { User } from '@/modules/users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { RemoveRefreshTokenUseCase } from './remove-refresh-token.usecase';

let inMemoryUserRepository: InMemoryUserRepository;
let sut: RemoveRefreshTokenUseCase;

describe('RemoveRefreshTokenUseCase', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();

    sut = new RemoveRefreshTokenUseCase(inMemoryUserRepository);
  });

  it('should remove refresh token from user', async () => {
    const user = new User({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password-hashed',
      refreshToken: 'any_refresh_token',
    });

    await inMemoryUserRepository.create(user);

    const result = await sut.execute(user.id);

    expect(result.isRight()).toBe(true);
    const userFound = await inMemoryUserRepository.findByEmail(user.email);
    expect(userFound?.refreshToken).toBe('');
  });

  it('should throw an error if user not found in database', async () => {
    const result = await sut.execute('any_id');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundException);
  });
});
