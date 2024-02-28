import { StaticCourse } from '../../../../lib/domain/models/index.js';

export function buildStaticCourse({
  id = 'courseABC123',
  name = 'static course name',
  description = 'static course description',
  challengeIds = ['challengeid-1', 'challengeid-2'],
  isActive = true,
  deactivationReason = '',
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  return new StaticCourse({
    id,
    name,
    description,
    challengeIds,
    isActive,
    deactivationReason,
    createdAt,
    updatedAt,
  });
}
