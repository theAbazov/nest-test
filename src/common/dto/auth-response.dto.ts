import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../modules/users/user.entity';

class UserResponseDto {
  @ApiProperty({ description: 'Уникальный идентификатор пользователя' })
  id: string;

  @ApiProperty({ description: 'Email пользователя' })
  email: string;

  @ApiProperty({ description: 'Имя пользователя' })
  username: string;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ 
    description: 'Данные пользователя',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({ 
    description: 'JWT токен для аутентификации',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
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