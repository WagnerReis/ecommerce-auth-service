import { HashGenerator } from '@/core/cryptography/hash-generator';
import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { User } from '../entities/user.entity';
import { UserRepositoryInterface } from '../repositories/user-repository.interface';

@Injectable()
export class RegisterUserUseCase {
  private logger = new Logger();

  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly hashGenerator: HashGenerator,
    private readonly i18n: I18nService,
  ) {}

  async execute(data: CreateUserDTO): Promise<User> {
    try {
      const userAlreadyExists = await this.userRepository.findByEmail(
        data.email,
      );

      if (userAlreadyExists) {
        throw new Error(this.i18n.t('validation.userAlreadyExists'));
      }

      const hashedPassword = await this.hashGenerator.hash(data.password);

      const user = new User({
        ...data,
        password: hashedPassword,
      });

      const createdUser = await this.userRepository.create(user);
      this.logger.debug(`User created successfully: ${createdUser.email}`);
      return createdUser;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new Error('Error registering user: ' + error.message);
    }
  }
}
