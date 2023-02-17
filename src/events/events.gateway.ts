import { UseGuards } from '@nestjs/common';
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
import { SocketGuard } from 'src/auth/auth.guard.socket';
import { Token } from 'src/auth/decorator/auth.decorator';
import { SocketUser } from 'src/types/auth';
import { onlineMap } from './onlineMap';

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

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
    @ConnectedSocket() socket: SocketUser,
  ): string {
    // console.log(socket.handshake);

    // const receiverSocketId = getKeyByValue(onlineMap[socket.nsp.name], '32323');
    // console.log('data', socket.nsp.name);

    const receiverSocketId = getKeyByValue(onlineMap[socket.nsp.name], '32323');

    console.log(`/ws-${socket.nsp.name}`);

    socket.to(`${socket.nsp.name}`).emit('messaged', data);

    return data;
  }

  @SubscribeMessage('login')
  handleLogin(
    @MessageBody() data: { id: string; conferences: string[] },
    @ConnectedSocket() socket: Socket,
  ) {
    // onlineMap[socket.nsp.name][socket.id] = data.id;

    // newConference.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));

    data.conferences.forEach(() => {
      socket.join(`${socket.nsp.name}`);
    });
  }

  afterInit(server: Server) {}

  handleConnection(@ConnectedSocket() socket: Socket) {
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }

    socket.emit('hello', socket.nsp.name);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    // const newChannel = socket?.nsp;

    delete onlineMap[socket.nsp.name];

    // newChannel.emit('hello', Object.values(onlineMap[socket.nsp.name]));
  }
}
