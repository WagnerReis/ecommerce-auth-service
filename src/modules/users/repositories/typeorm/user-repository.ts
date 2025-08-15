import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserRepositoryInterface } from '../user-repository.interface';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(User)
    private readonly ormRepo: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return await this.ormRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.ormRepo.findOne({
      where: { email },
    });

    return user;
  }
}
