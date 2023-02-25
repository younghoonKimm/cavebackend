import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { SocketUser } from 'src/types/auth';
import { UserInputDto } from 'src/user/dto/user.dto';
import { onlineMap } from './onlineMap';

@WebSocketGateway({ namespace: /\/ws-.+/ })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}
  @WebSocketServer() public server: Server;

  @SubscribeMessage('message')
  // @UseGuards(SocketGuard)
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: SocketUser,
  ): string {
    this.server.to(`${client.nsp.name}`).emit('messaged', data);

    return data;
  }

  @SubscribeMessage('login')
  handleLogin(
    @MessageBody() user: UserInputDto,
    @ConnectedSocket() socket: Socket,
  ) {
    if (Object.entries(onlineMap[socket.nsp.name]).length > 3) {
      socket.to(socket.id).emit('room_full');
    } else {
      onlineMap[socket.nsp.name][socket.id] = user;
      socket.join(`${socket.nsp.name}`);

      this.server
        .to(`${socket.nsp.name}`)
        .emit('joined', onlineMap[socket.nsp.name]);
    }
  }

  @SubscribeMessage('candidate')
  handleCandidate(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {}

  afterInit(server: Server) {}

  handleConnection(@ConnectedSocket() socket: Socket) {
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    delete onlineMap[socket.nsp.name][socket.id];

    this.server
      .to(`${socket.nsp.name}`)
      .emit('joined', onlineMap[socket.nsp.name]);

    // console.log('disconnect');

    // if (onlines.length <= 0) {
    //   delete onlineMap[socket.nsp.name];
    // } else {
    //   onlineMap[socket.nsp.name] = onlines;
    // }

    // socket.to(`${socket.nsp.name}`).emit('messaged', onlineMap[socket.nsp.name]);
  }
}
