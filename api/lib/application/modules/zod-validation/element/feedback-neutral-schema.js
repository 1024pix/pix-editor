import { z } from 'zod';

import { htmlSchema } from '../utils.js';

export const feedbackNeutralSchema = z.object({ diagnosis: htmlSchema });
