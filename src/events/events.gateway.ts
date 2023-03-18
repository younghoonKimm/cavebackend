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
import { Room } from 'src/mediasoup/Room';
import { mediasoupWorkers, startMediaSoup } from 'src/mediasoup/startMediaSoup';

import { SocketUser } from 'src/types/auth';
import { UserInputDto } from 'src/user/dto/user.dto';
import { onlineMap } from './onlineMap';

let nextMediasoupWorkerIdx = 0;

function getMediasoupWorker() {
  const worker = [...mediasoupWorkers][nextMediasoupWorkerIdx];

  if (++nextMediasoupWorkerIdx === [...mediasoupWorkers].length)
    nextMediasoupWorkerIdx = 0;

  return worker;
}

@WebSocketGateway({ namespace: /\/ws-.+/ })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  rooms: Map<any, any>;
  constructor() {
    this.rooms = new Map();
  }
  @WebSocketServer() public server: Server;

  async getOrCreateRoom({ roomId, consumerReplicas }) {
    let room = this.rooms.get(roomId);
    // If the Room does not exist create a new one.
    if (!room) {
      const mediasoupWorker = getMediasoupWorker();

      room = await Room.create({ mediasoupWorker, roomId, consumerReplicas });

      this.rooms.set(roomId, room);

      console.log(room);

      room.on('close', () => this.rooms.delete(roomId));
    }

    return room;
  }

  @SubscribeMessage('message')
  // @UseGuards(SocketGuard)
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: SocketUser,
  ): string {
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
      const mediasoupWorker = getMediasoupWorker();

      //  await Room.create({ mediasoupWorker, roomId, consumerReplicas });
    }
    if (Object.entries(onlineMap[socket.nsp.name]).length > 10) {
      socket.to(socket.id).emit('room_full');
    } else {
      onlineMap[socket.nsp.name][socket.id] = user;
      socket.join(`${socket.nsp.name}`);

      // this.server.to(socket.id).emit('send-offer');
      await this.getOrCreateRoom({
        roomId: socket.nsp.name,
        consumerReplicas: socket.id,
      });
      this.server.to(socket.id).emit('get-capability', getMediasoupWorker());

      this.server
        .to(`${socket.nsp.name}`)
        .emit('joined', onlineMap[socket.nsp.name]);
    }
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() sdp: any, @ConnectedSocket() socket: Socket) {
    socket.broadcast.emit('getOffer', sdp);

    // this.server.to(`${socket.nsp.name}`).emit('getOffer', sdp);
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() sdp: any, @ConnectedSocket() socket: Socket) {
    // console.log(socket.id);
    // socket.to(socket.id).emit('getAnswer', sdp);

    socket.broadcast.emit('getAnswer', sdp);
  }

  @SubscribeMessage('candidate')
  handleCandidate(
    @MessageBody() candidate: any,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.broadcast.emit('getCandidate', candidate);

    // this.server.to(`${socket.nsp.name}`).emit('getCandidate', candidate);
  }

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
      .emit('exit', onlineMap[socket.nsp.name]);
    // this.server
    //   .to(`${socket.nsp.name}`)
    //   .emit('joined', onlineMap[socket.nsp.name]);

    // console.log('disconnect');

    // if (onlines.length <= 0) {
    //   delete onlineMap[socket.nsp.name];
    // } else {
    //   onlineMap[socket.nsp.name] = onlines;
    // }

    // socket.to(`${socket.nsp.name}`).emit('messaged', onlineMap[socket.nsp.name]);
  }
}
