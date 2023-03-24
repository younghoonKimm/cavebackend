import { EventEmitter } from 'stream';
import { config } from './config';

export class Peer extends EventEmitter {
  _id: string;
  _roomId: string;
  _name: string;
  _profileImg: string;
  _rtpCapabilities: any;
  _transports: Map<any, any>;
  _producers: Map<any, any>;
  _consumers: Map<any, any>;
  _closed: boolean;

  constructor({ id, roomId }) {
    super();
    this._id = id;
    this._roomId = roomId;
    this._name = null;
    this._profileImg = null;
    this._rtpCapabilities = null;
    this._transports = new Map();
    this._producers = new Map();
    this._consumers = new Map();
    this._closed = false;
  }

  get nickName() {
    return this._name;
  }

  set nickName(name) {
    this._name = name;
  }

  get rtpCapabilities() {
    return this._rtpCapabilities;
  }

  set rtpCapabilities(rtpCapabilities) {
    this._rtpCapabilities = rtpCapabilities;
  }

  get transports() {
    return this._transports;
  }

  addTransport(id, transport) {
    this.transports.set(id, transport);
  }

  getTransport(id: string) {
    return this.transports.get(id);
  }

  get producers() {
    return this._producers;
  }

  getConsumerTransport() {
    return Array.from(this.transports.values()).find(
      (t) => t.appData.consuming,
    );
  }

  removeTransport(id) {
    this.transports.delete(id);
  }

  addProducer(id: string, producer: any) {
    this.producers.set(id, producer);
  }

  getProducer(id: string) {
    return this.producers.get(id);
  }

  removeProducer(id: string) {
    this.producers.delete(id);
  }

  addConsumer(id: string, consumer: any) {
    this.consumers.set(id, consumer);
  }

  get consumers() {
    return this._consumers;
  }

  removeConsumer(id: string) {
    this.consumers.delete(id);
  }

  get peerInfo() {
    const peerInfo = {
      id: this._id,
      nickName: this.nickName,
      picture: this._profileImg,
    };

    return peerInfo;
  }
}
