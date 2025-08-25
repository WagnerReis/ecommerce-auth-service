import { Either, left, right } from '@/core/either';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { User } from '../entities/user.entity';
import { UserRepositoryInterface } from '../repositories/user-repository.interface';
import { NotFoundError } from './errors/not-found.error';

type GetUserResponse = Either<
  NotFoundError,
  {
    user: User;
  }
>;

@Injectable()
export class GetUserUseCase {
  private logger = new Logger(GetUserUseCase.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<GetUserResponse> {
    const cached = await this.cacheManager.get<User>(`user:${userId}`);
    if (cached) {
      this.logger.log(`User ${userId} found in cache`);
      return right({ user: cached });
    }

    const userFound = await this.userRepository.findById(userId);

    if (!userFound) {
      return left(new NotFoundError('User not found'));
    }

    await this.cacheManager.set(`user:${userId}`, userFound, 5000 * 60);
    this.logger.log(`User ${userId} cached`);

    return right({ user: userFound });
  }
}
