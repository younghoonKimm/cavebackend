import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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
import { onlineMap } from './onlineMap';

@WebSocketGateway({ namespace: /\/ws-.+/ })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() public server: Server;

  @SubscribeMessage('message')
  // @UseGuards(SocketGuard)
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() socket: SocketUser,
  ): string {
    console.log(data);

    socket.to(`${socket.nsp.name}`).emit('messaged', data);

    socket.emit('messaged', data);

    return data;
  }

  @SubscribeMessage('login')
  handleLogin(
    @MessageBody() data: { id: string; conference: string[] },
    @ConnectedSocket() socket: Socket,
  ) {
    onlineMap[socket.nsp.name] = [...onlineMap[socket.nsp.name], socket.id];

    socket.join(`${socket.nsp.name}`);

    socket.to(`${socket.nsp.name}`).emit('offer', onlineMap[socket.nsp.name]);
  }

  afterInit(server: Server) {
    // console.log(server);
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = [];
    }

    // const isTokenValid = this.jwtService.verify(token.toString(), {
    //   secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    // });

    console.log('joined');

    onlineMap[socket.nsp.name] = [...onlineMap[socket.nsp.name], socket.id];

    socket.join(`${socket.nsp.name}`);

    socket.emit('offer', onlineMap[socket.nsp.name]);

    // socket.to(`${socket.nsp.name}`).emit('offer', onlineMap[socket.nsp.name]);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    let onlines = onlineMap[socket.nsp.name]?.filter(
      (online: string | null) => online !== socket.id,
    );

    if (onlines.length <= 0) {
      delete onlineMap[socket.nsp.name];
    } else {
      onlineMap[socket.nsp.name] = onlines;
    }

    // socket.to(`${socket.nsp.name}`).emit('messaged', onlineMap[socket.nsp.name]);
  }
}
