import { FakeHasher } from 'test/cryptography/fake-hasher';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { User } from '../entities/user.entity';
import { RegisterUserUseCase } from './register.usecase';

let inMemoryUserRepository: InMemoryUserRepository;
let hashGenerator: FakeHasher;
let i18n: any;
let SUT: RegisterUserUseCase;

describe('Register user use case', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    hashGenerator = new FakeHasher();
    i18n = {
      t: (key: string) => key, // Mock simples que retorna a chave
    };
    SUT = new RegisterUserUseCase(inMemoryUserRepository, hashGenerator, i18n);
  });

  it('should register a new user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securepassword',
    } as CreateUserDTO;

    const user = await SUT.execute(userData);

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
  });

  it('should throw error when user already exists', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securepassword',
    } as CreateUserDTO;

    const existingUser = new User({
      ...userData,
      password: 'hashedpassword',
    });
    await inMemoryUserRepository.create(existingUser);

    await expect(SUT.execute(userData)).rejects.toThrow(
      'validation.userAlreadyExists',
    );
  });
});
