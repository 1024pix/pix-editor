import { databaseBuffer } from '../database-buffer.js';

export function buildStaticCourse({
  id = 'staticCourseABC123',
  name = 'Mon super test statique',
  description = 'Ma super description de test statique',
  challengeIds = 'challengeABC, challengeDEF',
  isActive = true,
  deactivationReason = '',
  createdAt = new Date('2010-01-04'),
  updatedAt = new Date('2010-01-11'),
} = {}) {

  const values = { id, name, description, deactivationReason, challengeIds, createdAt, updatedAt, isActive };

  return databaseBuffer.pushInsertable({
    tableName: 'static_courses',
    values,
  });
}
