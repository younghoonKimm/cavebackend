import { Socket } from 'socket.io';
import { UserInputDto } from 'src/user/dto/user.dto';

export interface GoogleUser {
  provider?: string;
  providerId?: string;
  email: string;
  name: string;
  picture?: string;
}

export interface SocketUser extends Socket {
  user: UserInputDto;
}
