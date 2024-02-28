import { databaseBuffer } from '../database-buffer.js';

export function buildStaticCourseTag({
  id = databaseBuffer.nextId++,
  label,
} = {}) {

  const values = { id, label };

  return databaseBuffer.pushInsertable({
    tableName: 'static_course_tags',
    values,
  });
}

export function linkTagTo({
  staticCourseTagId,
  staticCourseId,
} = {}) {
  databaseBuffer.pushInsertable({
    tableName: 'static_courses_tags_link',
    values: { id: databaseBuffer.nextId++, staticCourseTagId, staticCourseId },
  });
}
