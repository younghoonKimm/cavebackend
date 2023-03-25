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
import { AwaitQueue } from 'awaitqueue';
import { Server, Socket } from 'socket.io';
import { Peer } from 'src/mediasoup/Peer';
import { Room } from 'src/mediasoup/Room';
import { mediasoupWorkers, startMediaSoup } from 'src/mediasoup/startMediaSoup';

import { SocketUser } from 'src/types/auth';
import { UserInputDto } from 'src/user/dto/user.dto';
import { onlineMap } from './onlineMap';

let nextMediasoupWorkerIdx = 0;

const queue = new AwaitQueue();

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

  getMediasoupWorker() {
    const worker = [...mediasoupWorkers][nextMediasoupWorkerIdx];

    if (++nextMediasoupWorkerIdx === [...mediasoupWorkers].length) {
      nextMediasoupWorkerIdx = 0;
    } else {
      ++nextMediasoupWorkerIdx;
    }

    return worker;
  }

  async getOrCreateRoom({ roomId, consumerReplicas }) {
    let room = this.rooms.get(roomId);
    // If the Room does not exist create a new one.
    if (!room) {
      const mediasoupWorker = this.getMediasoupWorker();

      room = await Room.create({ mediasoupWorker, roomId, consumerReplicas });

      room.on('close', () => this.rooms.delete(roomId));

      this.rooms.set(roomId, room);
    }

    return room;
  }

  createWebRtcTransport = async (router) => {
    return new Promise(async (resolve, reject) => {
      try {
        // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
        const webRtcTransport_options = {
          listenIps: [
            {
              ip: '0.0.0.0', // replace with relevant IP address
              // announcedIp: '10.0.0.115',
            },
          ],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        };

        // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
        let transport = await router.createWebRtcTransport(
          webRtcTransport_options,
        );

        transport.on('dtlsstatechange', (dtlsState) => {
          if (dtlsState === 'closed') {
            transport.close();
          }
        });

        transport.on('close', () => {
          console.log('transport closed');
        });

        resolve(transport);
      } catch (error) {
        reject(error);
      }
    });
  };

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
    // if (!onlineMap[socket.nsp.name]) {
    //   const mediasoupWorker = this.getMediasoupWorker();

    //  await Room.create({ mediasoupWorker, roomId, consumerReplicas });
    // }

    // if (room) {
    //   socket.to(socket.id).emit('room_full');
    // } else {
    // onlineMap[socket.nsp.name][socket.id] = user;
    socket.join(`${socket.nsp.name}`);

    queue.push(async () => {
      try {
        const newRoom = await this.getOrCreateRoom({
          roomId: socket.nsp.name,
          consumerReplicas: socket.id,
        });

        const peer = new Peer({ id: socket.id, roomId: socket.nsp.name });
        this.peers.set(`${socket.id}`, peer);

        console.log(this.rooms, this.rooms.get(socket.nsp.name));

        const rtpCapabilities = newRoom._mediasoupRouter.rtpCapabilities;

        this.server.to(socket.id).emit('joinRoom', rtpCapabilities);

        this.server
          .to(`${socket.nsp.name}`)
          .emit('joined', onlineMap[socket.nsp.name]);

        return;
      } catch (e) {
        console.log(e);
      }
    });
    // }
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @MessageBody() rtpCapabilities: any,
    @ConnectedSocket() socket: Socket,
  ) {
    this.server.to(socket.id).emit('joinRoom', rtpCapabilities);
    // this.server.to(`${socket.nsp.name}`).emit('getOffer', sdp);
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

  @SubscribeMessage('createWebRtcTransport')
  async handleCreateWebRtcTransport(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { consumer }: { consumer: boolean }, // callback: any,
  ) {
    const router = this.rooms.get(socket.nsp.name)._mediasoupRouter;
    const peer = this.peers.get(socket.id);

    if (router && peer) {
      try {
        const transport: any = await this.createWebRtcTransport(router);
        if (transport) {
          peer.addTransport(socket.id, transport);
          peer.addConsumer(socket.id, consumer);

          const params = {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          };

          return { params };
        }
      } catch (error) {
        return error;
      }
    }
  }

  @SubscribeMessage('transport-connect')
  transportConnect(
    @MessageBody() { dtlsParameters }: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const peer = this.peers.get(socket.id);

    console.log('cn', dtlsParameters);

    peer.getTransport(socket.id).connect({ dtlsParameters });
  }

  @SubscribeMessage('transport-produce')
  async transportProduce(
    @MessageBody() { kind, rtpParameters, appData }: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const peer = this.peers.get(socket.id);

    const producer = await peer.getTransport(socket.id).produce({
      kind,
      rtpParameters,
    });

    // console.log('Producer ID: ', producer.id, producer.kind);

    producer.on('transportclose', () => {
      console.log('transport for this producer closed ');
      producer.close();
    });

    const producers = [...this.peers].filter(([id, value]) =>
      value.roomId === socket.nsp.name ? value : null,
    );

    // console.log(producers);
    return {
      id: producer.id,
      isProducer: producers.length > 1 ? true : false,
      // isProducer: producers.length > 1 ? true : false,
    };

    // const socket.nsp.name
  }

  @SubscribeMessage('getProducers')
  async getProducers(
    @MessageBody()
    @ConnectedSocket()
    socket: Socket,
  ) {
    const producerIds = [];
    return producerIds;
  }

  afterInit(server: Server) {}

  handleConnection(@ConnectedSocket() socket: Socket) {
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    // delete onlineMap[socket.nsp.name][socket.id];
    this.rooms.delete(socket.id);

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
