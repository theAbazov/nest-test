import { User } from '../../modules/users/user.entity';

export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  };
  access_token: string;

  constructor(user: User, access_token: string) {
    this.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    this.access_token = access_token;
  }
}