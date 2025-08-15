import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { User } from '../entities/user.entity';
import { RegisterUserUseCase } from './register.usecase';

let inMemoryUserRepository: InMemoryUserRepository;
let SUT: RegisterUserUseCase;

describe('Register user use case', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    SUT = new RegisterUserUseCase(inMemoryUserRepository);
  });

  it('should register a new user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securepassword',
    } as CreateUserDTO;

    const user = await SUT.execute(userData);

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.password).toBeUndefined();
  });
});
