import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository';
import { User } from '../entities/user.entity';
import { NotFoundError } from './errors/not-found.error';
import { GetUserUseCase } from './get-user.usecase';

let inMemoryUserRepository: InMemoryUserRepository;
let cacheManager: any;
let SUT: GetUserUseCase;

describe('Get user use case', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    cacheManager = {
      get: vi.fn(),
      set: vi.fn(),
    };
    SUT = new GetUserUseCase(cacheManager, inMemoryUserRepository);
  });

  it('should get a user successfully when user exists', async () => {
    // Arrange
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword',
    };

    const existingUser = new User(userData);
    await inMemoryUserRepository.create(existingUser);
    cacheManager.get.mockResolvedValue(null);
    cacheManager.set.mockResolvedValue(undefined);

    // Act
    const result = await SUT.execute(existingUser.id);

    // Assert
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user).toBeInstanceOf(User);
      expect(result.value.user.id).toBe(existingUser.id);
      expect(result.value.user.name).toBe(userData.name);
      expect(result.value.user.email).toBe(userData.email);
    }
    expect(cacheManager.get).toHaveBeenCalledWith(`user:${existingUser.id}`);
    expect(cacheManager.set).toHaveBeenCalledWith(
      `user:${existingUser.id}`,
      existingUser,
      5000 * 60,
    );
  });

  it('should return cached user when available', async () => {
    // Arrange
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword',
    };

    const existingUser = new User(userData);
    cacheManager.get.mockResolvedValue(existingUser);

    // Act
    const result = await SUT.execute(existingUser.id);

    // Assert
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user).toBeInstanceOf(User);
      expect(result.value.user.id).toBe(existingUser.id);
      expect(result.value.user.name).toBe(userData.name);
      expect(result.value.user.email).toBe(userData.email);
    }
    expect(cacheManager.get).toHaveBeenCalledWith(`user:${existingUser.id}`);
    expect(cacheManager.set).not.toHaveBeenCalled();
  });

  it('should return NotFoundError when user does not exist', async () => {
    // Arrange
    const nonExistentUserId = 'non-existent-id';

    // Act
    const result = await SUT.execute(nonExistentUserId);

    // Assert
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value?.message).toBe('User not found');
    }
  });

  it('should return NotFoundError when userId is empty string', async () => {
    // Arrange
    const emptyUserId = '';

    // Act
    const result = await SUT.execute(emptyUserId);

    // Assert
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value?.message).toBe('User not found');
    }
  });

  it('should return NotFoundError when userId is null', async () => {
    // Arrange
    const invalidUserId = '';

    // Act
    const result = await SUT.execute(invalidUserId);

    // Assert
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value?.message).toBe('User not found');
    }
  });
});
