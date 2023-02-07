import { HttpStatus } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';
import { CommonOutput } from 'src/common/dto/common.dto';
import { UserEntity } from 'src/user/entities/user.entity';

export class AuthOutputDto extends CommonOutput {
  accessToken?: string;
  refreshToken?: string;
}

export class AuthTokenOutput {
  accessToken?: string;
  refreshToken?: string;
  status?: HttpStatus;
}

class UserProfile extends PartialType(UserEntity) {}

export class UserOutput {
  user: UserProfile;
}
