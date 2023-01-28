import { HttpStatus } from '@nestjs/common';
import { CommonOutput } from 'src/common/dto/common.dto';

export class AuthOutputDto extends CommonOutput {
  accessToken?: string;
  refreshToken?: string;
}

export class AuthTokenOutput {
  accessToken?: string;
  refreshToken?: string;
  status?: HttpStatus;
}
