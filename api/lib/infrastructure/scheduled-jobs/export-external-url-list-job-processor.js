import './job-process.js';
import { exportExternalUrlsFromRelease } from '../../domain/usecases/index.js';
import {
  localizedChallengeRepository,
  releaseRepository,
  urlRepository,
  whitelistedUrlRepository,
} from '../repositories/index.js';
import * as UrlUtils from '../utils/url-utils.js';
import { pgBoss } from '../../config.js';
import { logger } from '../logger.js';

export default function exportExternalUrlsJobProcessor() {
  if (pgBoss.exportExternalUrlListJobEnabled) {
    logger.info('Export external url list job has been migrated to pgboss, skipping bull processor');
    return;
  }
  return exportExternalUrlsFromRelease({
    releaseRepository,
    urlRepository,
    localizedChallengeRepository,
    whitelistedUrlRepository,
    UrlUtils,
  });
}
