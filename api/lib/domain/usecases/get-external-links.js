import { urlRepository } from '../../infrastructure/repositories/index.js';

export function getExternalLinks() {
  return urlRepository.get();
}
