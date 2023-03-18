import * as os from 'os';
import * as mediasoup from 'mediasoup';
import { Router, Worker } from 'mediasoup/lib/types';
import { config } from './config';

export const mediasoupWorkers: any = new Map();

export async function startMediaSoup() {
  const workers: Array<{
    worker: Worker;
    // router: Router;
  }> = [];

  for (let i = 0; i < Object.keys(os.cpus()).length; i++) {
    try {
      const worker = await mediasoup.createWorker({
        logLevel: 'debug',
        logTags: config.mediasoup.worker.logTags,
        rtcMinPort: config.mediasoup.worker.rtcMinPort,
        rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
      });

      worker.on('died', () => {
        console.error('mediasoup worker died (this should never happen)');
        process.exit(1);
      });

      const mediaCodecs = config.mediasoup.router.mediaCodecs;
      // const router = await worker.createRouter({ mediaCodecs });

      workers.push({ worker });

      mediasoupWorkers.set(worker.pid, { worker });
    } catch (e) {
      console.log(e);
    }
  }

  return workers;
}
