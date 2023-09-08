import { Release } from '../../../../lib/domain/models/release/Release.js';
import { buildContentForRelease } from './build-content-for-release.js';

export function buildDomainRelease({
  id = 123,
  content = buildContentForRelease(),
  createdAt = new Date('2020-01-01'),
} = {}) {
  return new Release({
    id,
    content,
    createdAt,
  });
}
