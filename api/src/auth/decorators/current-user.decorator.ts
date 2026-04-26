import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserWithDetails } from 'src/users/entities/user.entity';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (key: keyof UserWithDetails | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: UserWithDetails }>();
    const user = request.user;

    return key ? user?.[key] : user;
  },
);
