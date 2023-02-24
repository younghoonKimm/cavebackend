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

var a = 0;
@WebSocketGateway({ namespace: /\/ws-.+/ })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {
    a += 1;
    console.log(a);
  }
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
    @MessageBody() data: { id: string; conference: string[] },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(`${socket.nsp.name}`);

    // console.log(this.server);

    this.server
      .to(`${socket.nsp.name}`)
      .emit('offer', onlineMap[socket.nsp.name]);
  }

  afterInit(server: Server) {
    // console.log(server);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = [];
    }

    onlineMap[socket.nsp.name] = [...onlineMap[socket.nsp.name], socket.id];
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    let onlines = onlineMap[socket.nsp.name]?.filter(
      (online: string | null) => online !== socket.id,
    );

    console.log('disconnect');

    if (onlines.length <= 0) {
      delete onlineMap[socket.nsp.name];
    } else {
      onlineMap[socket.nsp.name] = onlines;
    }

    // socket.to(`${socket.nsp.name}`).emit('messaged', onlineMap[socket.nsp.name]);
  }
}
