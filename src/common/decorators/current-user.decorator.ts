import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/users/user.entity';

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
