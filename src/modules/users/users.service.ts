import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(userData: {
    email: string;
    password: string;
    username: string;
  }): Promise<User> {
    return this.userModel.create({
      email: userData.email,
      password: userData.password,
      username: userData.username,
    } as any);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findByPk(id);
  }
}