import { Translation } from '../../../domain/models/index.js';

export function deserialize(payload) {
  return new Translation({ key: payload.context, locale: payload.translation, value: payload.target });
}
