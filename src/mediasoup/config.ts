import {
  WorkerLogTag,
  RtpCodecCapability,
  TransportListenIp,
} from 'mediasoup/node/lib/types';
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
      ] as RtpCodecCapability[],
    },

    // rtp listenIps are the most important thing, below. you'll need
    // to set these appropriately for your network for the demo to
    // run anywhere but on localhost
    webRtcTransport: {
      listenIps: [
        {
          ip: process.env.WEBRTC_LISTEN_IP || '0.0.0.0',
          announcedIp: process.env.A_IP || '127.0.0.1',
        },
      ],
      initialAvailableOutgoingBitrate: 800000,
    },
  },
} as const;
