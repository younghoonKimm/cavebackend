import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Token = createParamDecorator(
  (_, ctx: ExecutionContext): ParameterDecorator => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.user);
    return request.user;
  },
);
