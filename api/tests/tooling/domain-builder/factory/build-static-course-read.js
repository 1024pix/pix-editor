import { StaticCourse } from '../../../../lib/domain/readmodels/index.js';

export function buildStaticCourseRead({
  id = 'courseABC123',
  name = 'static course name',
  description = 'static course description',
  challengeSummaries = [],
  isActive = true,
  deactivationReason = '',
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  return new StaticCourse({
    id,
    name,
    description,
    challengeSummaries,
    isActive,
    deactivationReason,
    createdAt,
    updatedAt,
  });
}
