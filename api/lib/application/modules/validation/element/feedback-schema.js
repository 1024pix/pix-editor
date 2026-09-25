import { z } from 'zod';

import { htmlSchema, isPlainObject } from '../utils.js';

const isPresent = (value) => value !== undefined && value !== '';

export const feedbackSchema = z.strictObject({
  state: htmlSchema({ allowEmpty: true }),
  diagnosis: htmlSchema({ allowEmpty: true }),
}).superRefine((feedback, ctx) => {
  if (!isPresent(feedback.state) && !isPresent(feedback.diagnosis)) {
    ctx.addIssue({ code: 'custom', params: { joiType: 'object.missing', peers: ['state', 'diagnosis'] }, input: feedback });
  }
}, { when: ({ value }) => isPlainObject(value) });
