import {
  WorkerLogTag,
  RtpCodecCapability,
  TransportListenIp,
} from 'mediasoup/lib/types';

export const config = {
  // http server ip, port, and peer timeout constant
  httpIp: '0.0.0.0',
  httpPort: 3001,
  httpPeerStale: 360000,

  mediasoup: {
    worker: {
      rtcMinPort: 13001,
      rtcMaxPort: 14000,
      logLevel: 'debug',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'] as WorkerLogTag[],
    },
    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'level-asymmetry-allowed': 1,
          },
        },
      ] as RtpCodecCapability[],
    },
    webRtcTransportOptions: {
      // listenIps is not needed since webRtcServer is used.
      // However passing MEDIASOUP_USE_WEBRTC_SERVER=false will change it.
      listenIps: [
        {
          ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP,
        },
      ],
      initialAvailableOutgoingBitrate: 1000000,
      minimumAvailableOutgoingBitrate: 600000,
      maxSctpMessageSize: 262144,
      // Additional options that are not part of WebRtcTransportOptions.
      maxIncomingBitrate: 1500000,
    },

    webRtcServerOptions: {
      listenInfos: [
        {
          protocol: 'udp',
          ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP,
          port: 44444,
        },
        {
          protocol: 'tcp',
          ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP,
          port: 44444,
        },
      ],
    },

    // rtp listenIps are the most important thing, below. you'll need
    // to set these appropriately for your network for the demo to
    // run anywhere but on localhost
    webRtcTransport: {
      listenIps: [
        {
          ip: process.env.WEBRTC_LISTEN_IP || '0.0.0.0',
          // announcedIp: null,
        },
      ],
      initialAvailableOutgoingBitrate: 800000,
    },
  },

  plainTransportOptions: {
    listenIp: {
      ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
      // announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP,
    },
    maxSctpMessageSize: 262144,
  },
} as const;
