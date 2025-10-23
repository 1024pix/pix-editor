import Blipp from 'blipp';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';

import * as Adminjs from './adminjs/index.js';
import * as Pino from './pino.js';

export const plugins = [Inert, Vision, Blipp, Adminjs, Pino];
