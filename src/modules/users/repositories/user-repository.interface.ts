import { User } from '../entities/user.entity';

export abstract class UserRepositoryInterface {
  abstract create(user: User): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
}
