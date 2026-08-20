import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser { id: string; openId: string }

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedUser => {
  const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
  return request.user;
});
