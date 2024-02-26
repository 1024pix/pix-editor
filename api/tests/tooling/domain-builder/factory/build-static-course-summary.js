import { StaticCourseSummary } from '../../../../lib/domain/readmodels/index.js';

export function buildStaticCourseSummary({
  id = 'courseABC123',
  name = 'static course name',
  challengeCount = 4,
  isActive = true,
  createdAt = new Date(),
  tags = [],
} = {}) {
  return new StaticCourseSummary({
    id,
    name,
    challengeCount,
    isActive,
    createdAt,
    tags,
  });
}
