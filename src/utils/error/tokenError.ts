import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_JWT_EXPIRED } from 'src/common/constants/errorConstants';

export const returnTokenError = (error) => {
  if (error.message === ERROR_JWT_EXPIRED) {
    throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
  }

  throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
};
