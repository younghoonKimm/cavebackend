import { CommonOutput } from 'src/common/dto/common.dto';

export class AuthOutputDto extends CommonOutput {
  token?: string;
}
