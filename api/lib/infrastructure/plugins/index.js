import Blipp from 'blipp';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';

import * as config from '../../config.js';
import * as Adminjs from './adminjs/index.js';
import { Metrics } from './metrics.js';
import * as Pino from './pino.js';
import * as Sentry from './sentry.js';

export const plugins = [
  Metrics,
  Inert,
  Vision,
  Blipp,
  Adminjs,
  Pino,
  ...(config.sentry.enabled ? [Sentry] : []),
];
