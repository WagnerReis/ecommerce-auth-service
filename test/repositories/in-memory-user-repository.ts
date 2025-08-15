import { User } from 'src/modules/users/entities/user.entity';
import { UserRepositoryInterface } from 'src/modules/users/repositories/user-repository.interface';

export class InMemoryUserRepository implements UserRepositoryInterface {
  private users: User[] = [];

  async create(user: User): Promise<User> {
    this.users.push(user);
    return new Promise((resolve) => resolve(user));
  }

  async findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve) => {
      const user = this.users.find((user) => user.email === email);
      resolve(user || null);
    });
  }
}
