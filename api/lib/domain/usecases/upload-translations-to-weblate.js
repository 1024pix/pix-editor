import { PassThrough } from 'node:stream';

import { child } from '../../infrastructure/logger.js';
import { releaseRepository, translationsConfigRepository } from '../../infrastructure/repositories/index.js';
import { exportTranslationsForWeblate } from './export-translations-for-weblate.js';
import * as config from '../../config.js';
import { streamToPromise } from '../../infrastructure/utils/stream-to-promise.js';

const logger = child('uc:uploadTranslationToWeblate', { event: 'uploadTranslationToWeblate' });

export async function uploadTranslationsToWeblate(dependencies = { exportTranslationsForWeblate, releaseRepository, translationsConfigRepository, fetch }) {
  if (!config.weblate.apiToken) {
    logger.warn('No Weblate API Token defined, skipping translations upload');
    return;
  }

  const configs = await dependencies.translationsConfigRepository.listWithWeblateComponent();

  if (!configs.length) {
    logger.warn('No translations config defined, skipping upload translations');
    return;
  }

  const release = await dependencies.releaseRepository.getLatestRelease();

  for (const { frameworkId, areaId, uploadedLocales, weblateComponent } of configs) {
    for (const locale of uploadedLocales) {
      const stream = new PassThrough();
      await dependencies.exportTranslationsForWeblate(
        { stream, frameworkId, areaId, locale, release },
      );
      const csvFile = new File([await streamToPromise(stream)], 'translations.csv');
      const formData = new FormData();
      formData.set('file', csvFile);
      formData.set('method', 'replace');
      formData.set('conflicts', 'replace-translated');
      await dependencies.fetch(new URL(`/api/${config.weblate.project}/${weblateComponent}/${locale}/files/`, config.weblate.apiBaseUrl), {
        method: 'POST',
        headers: { Authorization: `token ${config.weblate.apiToken}` },
        body: formData,
      });
    }
  }
}
