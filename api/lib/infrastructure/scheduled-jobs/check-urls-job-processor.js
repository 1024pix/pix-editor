import './job-process.js';
import { validateUrlsFromRelease } from '../../domain/usecases/index.js';
import {
  localizedChallengeRepository,
  releaseRepository,
  urlRepository,
  whitelistedUrlRepository
} from '../repositories/index.js';
import * as UrlUtils from '../utils/url-utils.js';

export default function checkUrlsJobProcessor() {
  return validateUrlsFromRelease({ releaseRepository, urlRepository, localizedChallengeRepository, whitelistedUrlRepository, UrlUtils });
}
