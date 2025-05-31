import * as Sentry from '@sentry/node';
import {
  areaTransformer,
  competenceTransformer,
  frameworkTransformer,
  thematicTransformer
} from '../../infrastructure/transformers/index.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import { logger } from '../../infrastructure/logger.js';
import * as areaRepository from '../../infrastructure/repositories/area-repository.js';

export async function updateFramework({ framework, shouldRefreshRelationships: _ }) {
  try {
    if (pixApiClient.isPixApiCachePatchingEnabled()) {
      const frameworkForRelease = frameworkTransformer.transformForRelease(framework);
      return updatedRecordNotifier.notify({
        updatedRecord: frameworkForRelease,
        model: 'frameworks',
        pixApiClient
      });
    }
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}

export async function updateArea({ area, shouldRefreshRelationships: _ }) {
  try {
    if (pixApiClient.isPixApiCachePatchingEnabled()) {
      const areaForRelease = areaTransformer.transformForRelease(area);
      return updatedRecordNotifier.notify({
        updatedRecord: areaForRelease,
        model: 'areas',
        pixApiClient
      });
    }
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}

export async function updateCompetence({ competence, shouldRefreshRelationships }) {
  try {
    if (pixApiClient.isPixApiCachePatchingEnabled()) {
      let promise;
      const competenceForRelease = competenceTransformer.transformForRelease(competence);
      promise = updatedRecordNotifier.notify({
        updatedRecord: competenceForRelease,
        model: 'competences',
        pixApiClient
      });
      if (shouldRefreshRelationships) {
        console.log('la');
        const area = await areaRepository.getByAirtableId(competence.areaAirtableId);
        console.log('ici');
        return updateArea({ area });
      } else {
        return promise;
      }
    }
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}

export async function updateThematic({ thematic }) {
  return updateEntity(thematic, 'thematics');
}

async function updateEntity(entity, entityName) {
  let transformer;
  switch (entityName) {
    case 'frameworks':
      transformer = frameworkTransformer;
      break;
    case 'areas':
      transformer = areaTransformer;
      break;
    case 'competences':
      transformer = competenceTransformer;
      break;
    case 'thematics':
      transformer = thematicTransformer;
      break;
    default: throw new Error('cannot patch this entity in Pix Api');
  }
  try {
    if (pixApiClient.isPixApiCachePatchingEnabled()) {
      const entityForRelease = transformer.transformForRelease(entity);
      return updatedRecordNotifier.notify({
        updatedRecord: entityForRelease,
        model: entityName,
        pixApiClient
      });
    }
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}
