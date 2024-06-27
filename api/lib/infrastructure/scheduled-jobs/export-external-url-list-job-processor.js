import './job-process.js';
import { exportExternalUrlsFromRelease } from '../../domain/usecases/index.js';
import { localizedChallengeRepository, releaseRepository, urlRepository } from '../repositories/index.js';
import * as UrlUtils from '../utils/url-utils.js';

export default function exportExternalUrlsJobProcessor() {
  return exportExternalUrlsFromRelease({ releaseRepository, urlRepository, localizedChallengeRepository, UrlUtils });
}
