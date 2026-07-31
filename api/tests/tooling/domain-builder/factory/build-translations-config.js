import { TranslationsConfig } from '../../../../lib/domain/models/index.js';

export function buildTranslationsConfig({ id, phraseProjectId, frameworkId, areaId, weblateComponent, uploadedLocales }) {
  return new TranslationsConfig({ id, phraseProjectId, frameworkId, areaId, weblateComponent, uploadedLocales });
}
