import Joi from 'joi';

const schema = Joi.object({
  LOG_OPS_METRICS: Joi.string().valid('true', 'false').optional(),
  OPS_EVENT_EACH_SECONDS: Joi.number().integer().min(1).optional()
}).options({ allowUnknown: true });

export function validateEnvironmentVariables() {
  const { error } = schema.validate(process.env);
  if (error) {
    throw new Error('Configuration is invalid: ' + error.message + ', but was: ' + error.details[0].context.value);
  }
}
