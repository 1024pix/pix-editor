import * as Sentry from '@sentry/node';
import { logger } from '../../infrastructure/logger.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { areaTransformer } from '../../infrastructure/transformers/index.js';
import { areaRepository } from '../../infrastructure/repositories/index.js';

export async function createArea(area) {
  const areas = await areaRepository.listByFrameworkId(area.frameworkId);

  area.code = `${(areas?.length ?? 0) + 1}`;

  const createdArea = await areaRepository.create(area);

  try {
    await updatedRecordNotifier.notify({
      pixApiClient,
      model: 'areas',
      updatedRecord: areaTransformer.filterAreaFields(createdArea),
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return createdArea;
}
