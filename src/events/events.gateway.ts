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

@WebSocketGateway({ namespace: /\/ws-.+/ })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() public server: Server;
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ): string {
    console.log(data);
    socket.emit('messaged', data);

    return 'Hello world!';
  }

  @SubscribeMessage('login')
  handleLogin(
    @MessageBody() data: { id: number; conference: number[] },
    @ConnectedSocket() socket: Socket,
  ) {
    const newConference = socket.nsp;

    onlineMap[socket.nsp.name][socket.id] = data.id;
    newConference.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));

    data.conference.forEach((channel) => {
      console.log('join', socket.nsp.name, channel);
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
