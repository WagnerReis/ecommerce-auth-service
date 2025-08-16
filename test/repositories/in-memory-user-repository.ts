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

  async save(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
    return new Promise((resolve) => resolve(user));
  }

  async findById(id: string): Promise<User | null> {
    return new Promise((resolve) => {
      const user = this.users.find((user) => user.id === id);
      resolve(user || null);
    });
  }
}
