import { PassThrough, pipeline } from 'node:stream';

import { ZipArchive } from 'archiver';

import { releaseRepository, translationsConfigRepository } from '../../infrastructure/repositories/index.js';
import { exportTranslationsForWeblate } from './export-translations-for-weblate.js';
import { logger } from '../../infrastructure/logger.js';
import { LocalizedChallenge } from '../models/index.js';

export async function exportAllTranslationsForWeblate({ stream }, dependencies = { exportTranslationsForWeblate, releaseRepository, translationsConfigRepository }) {
  const configs = await dependencies.translationsConfigRepository.listWithWeblateComponent();

  const archive = new ZipArchive();
  pipeline(archive, stream, (error) => {
    if (!error) return;
    logger.error({ error }, 'error while exporting translations for Weblate');
  });

  const release = await dependencies.releaseRepository.getLatestRelease();

  for (const { frameworkId, areaId, weblateComponent } of configs) {
    const componentArchive = new ZipArchive();
    archive.append(componentArchive, { name: `${weblateComponent}.zip` });

    for (const locale of LocalizedChallenge.SUPPORTED_LOCALES) {
      const stream = new PassThrough();
      await dependencies.exportTranslationsForWeblate(
        { stream, frameworkId, areaId, locale, release },
      );

      componentArchive.append(stream, { name: `${locale}.csv` });
    }

    await componentArchive.finalize();
  }

  await archive.finalize();
}
