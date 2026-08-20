import JsonapiSerializer from 'jsonapi-serializer';

import { logger } from './logger.js';

const { Error: JSONAPIError } = JsonapiSerializer;

export function handleFailAction(request, h, err) {
  logger.error({ err }, 'Request payload validation error');
  return h.response({
    error: 'Bad Request',
    message: 'Invalid request payload input',
    statusCode: 400,
  }).code(400).takeover();
}

export function handleFailActionWithDetails(request, h, err) {
  logger.error({ err: err.details }, 'Request payload validation error');
  const errors = (err.details ?? []).map((detail) => ({
    status: '400',
    title: 'Invalid Request Payload',
    detail: detail.message,
  }));
  return h.response(JSONAPIError(errors)).code(400).takeover();
}
