import { StaticCourseTag } from '../../../../lib/domain/readmodels/index.js';

export function buildStaticCourseTag({
  id = 123,
  label = 'Label de tag',
} = {}) {
  return new StaticCourseTag({
    id,
    label,
  });
}
