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
  rooms: Map<any, any>;
  peers: Map<any, any>;
  constructor() {
    this.rooms = new Map();
    this.peers = new Map();
  }
  @WebSocketServer() public server: Server;

  @SubscribeMessage('message')
  // @UseGuards(SocketGuard)
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: SocketUser,
  ): string {
    console.log(data);
    this.server.to(`${client.nsp.name}`).emit('messaged', data);
    // const rtpCapabilities = router.rtpCapabilities
    return data;
  }

  @SubscribeMessage('login')
  async handleLogin(
    @MessageBody() user: UserInputDto,
    @ConnectedSocket() socket: Socket,
  ) {
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }

    // if (room) {
    //   socket.to(socket.id).emit('room_full');
    // } else {
    // onlineMap[socket.nsp.name][socket.id] = user;

    onlineMap[socket.nsp.name][socket.id] = user;

    socket.join(`${socket.nsp.name}`);

    // queue.push(async () => {
    //   try {
    //     const newRoom = await this.getOrCreateRoom({
    //       roomId: socket.nsp.name,
    //       consumerReplicas: socket.id,
    //     });

    //     // const peer = new Peer({ id: socket.id, roomId: socket.nsp.name });
    //     // this.peers.set(`${socket.id}`, peer);

    //     const rtpCapabilities = newRoom._mediasoupRouter.rtpCapabilities;

    this.server
      .to(`${socket.nsp.name}`)
      .emit('joined', onlineMap[socket.nsp.name]);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @MessageBody() rtpCapabilities: any,
    @ConnectedSocket() socket: Socket,
  ) {
    this.server.to(socket.id).emit('joinRoom', rtpCapabilities);
    // this.server.to(`${socket.nsp.name}`).emit('getOffer', sdp);
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() sdp: any, @ConnectedSocket() socket: Socket) {
    socket.broadcast.emit('getAnswer', sdp);
  }

  afterInit(server: Server) {}

  handleConnection(@ConnectedSocket() socket: Socket) {
    // if (!onlineMap[socket.nsp.name]) {
    //   onlineMap[socket.nsp.name] = {};
    // }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    // this.rooms.delete(socket.id);
    // this.server
    //   .to(`${socket.nsp.name}`)
    //   .emit('exit', onlineMap[socket.nsp.name]);
    // this.server
    //   .to(`${socket.nsp.name}`)
    //   .emit('joined', onlineMap[socket.nsp.name]);

    if (onlineMap[socket.nsp.name]) {
      delete onlineMap[socket.nsp.name][socket.id];
    } else {
      onlineMap[socket.nsp.name] = {};
    }
    // socket.to(`${socket.nsp.name}`).emit('messaged', onlineMap[socket.nsp.name]);
  }
}
