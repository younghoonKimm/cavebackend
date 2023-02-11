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
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ): string {
    const receiverSocketId = getKeyByValue(onlineMap[`/ws-sub`], Number(2));
    console.log(receiverSocketId);
    socket.emit('messaged', data);
    // socket.to(receiverSocketId).emit('messaged', data);

    return data;
  }

  @SubscribeMessage('login')
  handleLogin(
    @MessageBody() data: { id: number; conferences: number[] },
    @ConnectedSocket() socket: Socket,
  ) {
    const newConference = socket.nsp;

    onlineMap[socket.nsp.name][socket.id] = data.id;
    newConference.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));

    data.conferences.forEach((channel) => {
      socket.join(`${socket.nsp.name}-${channel}`);
    });
  }

  afterInit(server: Server) {
    console.log('ws init');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }

    socket.emit('hello', socket.nsp.name);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const newChannel = socket.nsp;

    delete onlineMap[socket.nsp.name][socket.id];

    newChannel.emit('hello', Object.values(onlineMap[socket.nsp.name]));
  }
}
