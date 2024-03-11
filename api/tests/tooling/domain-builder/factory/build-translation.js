import { Translation } from '../../../../lib/domain/models/index.js';

export function buildTranslation({
  key,
  locale,
  value,
}) {
  return new Translation({
    key,
    locale,
    value,
  });
}
