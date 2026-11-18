import { Translation } from '../../../domain/models/index.js';
import { logger } from '../../logger.js';

export function deserialize(payload) {
  const newTranslation = new Translation(
    {
      key: payload.translation.key.name,
      locale: payload.translation.locale.name,
      value: payload.translation.content,
    },
  );
  return exorciseDevilApostrophe(newTranslation);
}

/**
 * @param {Translation} translation
 * @returns {Translation}
 */
export function exorciseDevilApostrophe(translation) {
  if (translation.key.endsWith('proposals')) {
    logger.info(`The key and value of translation about to be exorcised: ${translation.key}, ${translation.value}`);
    translation.value = translation.value.replace(/^\'/, '');
  }
  return translation;
}
