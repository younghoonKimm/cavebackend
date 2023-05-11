import { EventEmitter } from 'stream';
// import { config } from './config';

/**
 * Room class.
 *
 * This is not a "mediasoup Room" by itself, by a custom class that holds
 * a protoo Room (for signaling with WebSocket clients) and a mediasoup Router
 * (for sending and receiving media to/from those WebSocket peers).
 */
export class Room extends EventEmitter {
  _roomId: any;
  _closed: boolean;
  _broadcasters: Map<any, any>;
  _webRtcServer: any;
  _mediasoupRouter: any;
  _audioLevelObserver: any;
  _activeSpeakerObserver: any;
  _bot: any;
  _consumerReplicas: any;
  _networkThrottled: boolean;
  _protooRoom: any;
  /**
   * Factory function that creates and returns Room instance.
   *
   * @async
   *
   * @param {mediasoup.Worker} mediasoupWorker - The mediasoup Worker in which a new
   *   mediasoup Router must be created.
   * @param {String} roomId - Id of the Room instance.
   */
  static async create({ mediasoupWorker, roomId, consumerReplicas }: any) {
    // Router media codecs.
    // const { mediaCodecs } = config.mediasoup.router;

    // Create a mediasoup Router.
    const mediasoupRouter = await mediasoupWorker[1].worker.createRouter({
      // mediaCodecs,
    });

    // Create a mediasoup AudioLevelObserver.
    const audioLevelObserver = await mediasoupRouter.createAudioLevelObserver({
      maxEntries: 1,
      threshold: -80,
      interval: 800,
    });

    // Create a mediasoup ActiveSpeakerObserver.

    // const activeSpeakerObserver =
    //   await mediasoupRouter.createActiveSpeakerObserver();

    return new Room({
      roomId,
      mediasoupRouter,
      audioLevelObserver,
      // activeSpeakerObserver,
      consumerReplicas,
    });
  }

  constructor({
    roomId,
    mediasoupRouter,
    audioLevelObserver,
    // activeSpeakerObserver,
    consumerReplicas,
  }) {
    super();

    this.setMaxListeners(6);

    // Room id.
    // @type {String}
    this._roomId = roomId;

    // Closed flag.
    // @type {Boolean}
    this._closed = false;

    // protoo Room instance.
    // @type {protoo.Room}

    // Map of broadcasters indexed by id. Each Object has:
    // - {String} id
    // - {Object} data
    //   - {String} displayName
    //   - {Object} device
    //   - {RTCRtpCapabilities} rtpCapabilities
    //   - {Map<String, mediasoup.Transport>} transports
    //   - {Map<String, mediasoup.Producer>} producers
    //   - {Map<String, mediasoup.Consumers>} consumers
    //   - {Map<String, mediasoup.DataProducer>} dataProducers
    //   - {Map<String, mediasoup.DataConsumers>} dataConsumers
    // @type {Map<String, Object>}
    this._broadcasters = new Map();

    // mediasoup Router instance.
    // @type {mediasoup.Router}
    this._mediasoupRouter = mediasoupRouter;

    // mediasoup AudioLevelObserver.
    // @type {mediasoup.AudioLevelObserver}
    this._audioLevelObserver = audioLevelObserver;

    // mediasoup ActiveSpeakerObserver.
    // @type {mediasoup.ActiveSpeakerObserver}
    // this._activeSpeakerObserver = activeSpeakerObserver;

    // Consumer replicas.
    // @type {Number}
    this._consumerReplicas = consumerReplicas || 0;

    // Network throttled.
    // @type {Boolean}
    this._networkThrottled = false;

    // Handle audioLevelObserver.
  }

  /**
   * Closes the Room instance by closing the protoo Room and the mediasoup Router.
   */
  close() {
    this._closed = true;

    // Close the mediasoup Router.
    this._mediasoupRouter.close();

    // Close the Bot.
    this._bot.close();

    // Emit 'close' event.
    this.emit('close');

    // Stop network throttling.
  }

  /**
   * Called from server.js upon a protoo WebSocket connection request from a
   * browser.
   *
   * @param {String} peerId - The id of the protoo peer to be created.
   * @param {Boolean} consume - Whether this peer wants to consume from others.
   * @param {protoo.WebSocketTransport} protooWebSocketTransport - The associated
   *   protoo WebSocket transport.
   */

  getRouterRtpCapabilities() {
    return this._mediasoupRouter.rtpCapabilities;
  }

  _handleActiveSpeakerObserver() {
    this._activeSpeakerObserver.on('dominantspeaker', (dominantSpeaker) => {
      console.log(
        'activeSpeakerObserver "dominantspeaker" event [producerId:%s]',
        dominantSpeaker.producer.id,
      );
    });
  }

  /**
   * Creates a mediasoup Consumer for the given mediasoup Producer.
   *
   * @async
   */
  async _createConsumer({ consumerPeer, producerPeer, producer }) {
    // Optimization:
    // - Create the server-side Consumer in paused mode.
    // - Tell its Peer about it and wait for its response.
    // - Upon receipt of the response, resume the server-side Consumer.
    // - If video, this will mean a single key frame requested by the
    //   server-side Consumer (when resuming it).
    // - If audio (or video), it will avoid that RTP packets are received by the
    //   remote endpoint *before* the Consumer is locally created in the endpoint
    //   (and before the local SDP O/A procedure ends). If that happens (RTP
    //   packets are received before the SDP O/A is done) the PeerConnection may
    //   fail to associate the RTP stream.

    // NOTE: Don't create the Consumer if the remote Peer cannot consume it.
    if (
      !consumerPeer.data.rtpCapabilities ||
      !this._mediasoupRouter.canConsume({
        producerId: producer.id,
        rtpCapabilities: consumerPeer.data.rtpCapabilities,
      })
    ) {
      return;
    }

    // Must take the Transport the remote Peer is using for consuming.
    const transport: any = Array.from(
      consumerPeer.data.transports.values(),
    ).find((t: any) => t?.appData?.consuming);

    // This should not happen.
    if (!transport) {
      console.warn('_createConsumer() | Transport for consuming not found');

      return;
    }

    const promises = [];

    const consumerCount = 1 + this._consumerReplicas;

    for (let i = 0; i < consumerCount; i++) {
      promises.push(
        (async () => {
          // Create the Consumer in paused mode.
          let consumer;

          try {
            if (transport) {
              consumer = await transport.consume({
                producerId: producer.id,
                rtpCapabilities: consumerPeer.data.rtpCapabilities,
                // Enable NACK for OPUS.
                enableRtx: true,
                paused: true,
              });
            }
          } catch (error) {
            console.warn('_createConsumer() | transport.consume():%o', error);

            return;
          }

          // Store the Consumer into the protoo consumerPeer data Object.
          consumerPeer.data.consumers.set(consumer.id, consumer);

          // Set Consumer events.
          consumer.on('transportclose', () => {
            // Remove from its map.
            consumerPeer.data.consumers.delete(consumer.id);
          });

          consumer.on('producerclose', () => {
            // Remove from its map.
            consumerPeer.data.consumers.delete(consumer.id);

            consumerPeer
              .notify('consumerClosed', { consumerId: consumer.id })
              .catch(() => {});
          });

          consumer.on('producerpause', () => {
            consumerPeer
              .notify('consumerPaused', { consumerId: consumer.id })
              .catch(() => {});
          });

          consumer.on('producerresume', () => {
            consumerPeer
              .notify('consumerResumed', { consumerId: consumer.id })
              .catch(() => {});
          });

          consumer.on('score', (score) => {
            //console.log(
            //	 'consumer "score" event [consumerId:%s, score:%o]',
            //	 consumer.id, score);

            consumerPeer
              .notify('consumerScore', { consumerId: consumer.id, score })
              .catch(() => {});
          });

          consumer.on('layerschange', (layers) => {
            consumerPeer
              .notify('consumerLayersChanged', {
                consumerId: consumer.id,
                spatialLayer: layers ? layers.spatialLayer : null,
                temporalLayer: layers ? layers.temporalLayer : null,
              })
              .catch(() => {});
          });

          // NOTE: For testing.
          // await consumer.enableTraceEvent([ 'rtp', 'keyframe', 'nack', 'pli', 'fir' ]);
          // await consumer.enableTraceEvent([ 'pli', 'fir' ]);
          // await consumer.enableTraceEvent([ 'keyframe' ]);

          consumer.on('trace', (trace) => {
            console.log(
              'consumer "trace" event [producerId:%s, trace.type:%s, trace:%o]',
              consumer.id,
              trace.type,
              trace,
            );
          });

          // Send a protoo request to the remote Peer with Consumer parameters.
          try {
            await consumerPeer.request('newConsumer', {
              peerId: producerPeer.id,
              producerId: producer.id,
              id: consumer.id,
              kind: consumer.kind,
              rtpParameters: consumer.rtpParameters,
              type: consumer.type,
              appData: producer.appData,
              producerPaused: consumer.producerPaused,
            });

            // Now that we got the positive response from the remote endpoint, resume
            // the Consumer so the remote endpoint will receive the a first RTP packet
            // of this new stream once its PeerConnection is already ready to process
            // and associate it.
            await consumer.resume();

            consumerPeer
              .notify('consumerScore', {
                consumerId: consumer.id,
                score: consumer.score,
              })
              .catch(() => {});
          } catch (error) {
            console.warn('_createConsumer() | failed:%o', error);
          }
        })(),
      );
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.warn('_createConsumer() | failed:%o', error);
    }
  }

  /**
   * Creates a mediasoup DataConsumer for the given mediasoup DataProducer.
   *
   * @async
   */
  async _createDataConsumer({
    dataConsumerPeer,
    dataProducerPeer = null, // This is null for the bot DataProducer.
    dataProducer,
  }) {
    // NOTE: Don't create the DataConsumer if the remote Peer cannot consume it.
    if (!dataConsumerPeer.data.sctpCapabilities) return;

    // Must take the Transport the remote Peer is using for consuming.
    const transport: any = Array.from(
      dataConsumerPeer.data.transports.values(),
    ).find((t: any) => t.appData.consuming);

    // This should not happen.
    if (!transport) {
      console.warn('_createDataConsumer() | Transport for consuming not found');

      return;
    }

    // Create the DataConsumer.
    let dataConsumer;

    try {
      if (transport) {
        dataConsumer = await transport.consumeData({
          dataProducerId: dataProducer.id,
        });
      }
    } catch (error) {
      console.warn('_createDataConsumer() | transport.consumeData():%o', error);

      return;
    }

    // Store the DataConsumer into the protoo dataConsumerPeer data Object.
    dataConsumerPeer.data.dataConsumers.set(dataConsumer.id, dataConsumer);

    // Set DataConsumer events.
    dataConsumer.on('transportclose', () => {
      // Remove from its map.
      dataConsumerPeer.data.dataConsumers.delete(dataConsumer.id);
    });

    dataConsumer.on('dataproducerclose', () => {
      // Remove from its map.
      dataConsumerPeer.data.dataConsumers.delete(dataConsumer.id);

      dataConsumerPeer
        .notify('dataConsumerClosed', { dataConsumerId: dataConsumer.id })
        .catch(() => {});
    });

    // Send a protoo request to the remote Peer with Consumer parameters.
    try {
      await dataConsumerPeer.request('newDataConsumer', {
        // This is null for bot DataProducer.
        peerId: dataProducerPeer ? dataProducerPeer.id : null,
        dataProducerId: dataProducer.id,
        id: dataConsumer.id,
        sctpStreamParameters: dataConsumer.sctpStreamParameters,
        label: dataConsumer.label,
        protocol: dataConsumer.protocol,
        appData: dataProducer.appData,
      });
    } catch (error) {
      console.warn('_createDataConsumer() | failed:%o', error);
    }
  }
}
