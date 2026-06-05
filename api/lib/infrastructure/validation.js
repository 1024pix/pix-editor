import { logger } from './logger.js';

export function handleFailAction(request, h, err) {
  logger.error({ err }, 'Request payload validation error');
  return h.response({
    error: 'Bad Request',
    message: 'Invalid request payload input',
    statusCode: 400,
  }).code(400).takeover();
}
