import { HashCompare } from '@/core/cryptography/hash-comparer';
import { HashGenerator } from '@/core/cryptography/hash-generator';
import { Either, left, right } from '@/core/either';
import { UserRepositoryInterface } from '@/modules/users/repositories/user-repository.interface';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GenerateTokensUseCase } from './generate-tokens.usecase';

type SignInResponse = Either<
  UnauthorizedException | BadRequestException,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class SignInUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly generateTokensUseCase: GenerateTokensUseCase,
    private readonly hashCompare: HashCompare,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute(email: string, pass: string): Promise<SignInResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new UnauthorizedException('User not found'));
    }

    const isPasswordValid = this.hashCompare.compare(pass, user.password);

    if (!isPasswordValid) {
      return left(new UnauthorizedException('Invalid password'));
    }

    const result = await this.generateTokensUseCase.execute(user.id);

    if (result.isLeft()) {
      return left(new BadRequestException());
    }

    const { accessToken, refreshToken } = result.value;

    const refreshTokenHash = await this.hashGenerator.hash(refreshToken);

    user.refreshToken = refreshTokenHash;

    await this.userRepository.save(user);

    return right({ accessToken, refreshToken });
  }
}
