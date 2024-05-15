import './job-process.js';
import { validateUrlsFromRelease } from '../../domain/usecases/index.js';
import { localizedChallengeRepository, releaseRepository, urlRepository } from '../repositories/index.js';
import { UrlUtils } from '../utils/url-utils.js';

export default function checkUrlsJobProcessor() {
  return validateUrlsFromRelease({ releaseRepository, urlRepository, localizedChallengeRepository, UrlUtils });
}
