import { Translation } from '../../../domain/models/index.js';

export function deserialize(payload) {
  return new Translation({ key: payload.translation.key.name, locale: payload.translation.locale.code, value: payload.translation.content });
}
