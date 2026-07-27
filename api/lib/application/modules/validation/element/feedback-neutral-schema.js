import Joi from 'joi';

import { htmlSchema } from '../utils.js';

export const feedbackNeutralSchema = Joi.object({ diagnosis: htmlSchema.required() });
