import { knex } from '../../../db/knex-database-connection.js';
import { StaticCourseTag } from '../../domain/readmodels/index.js';

export async function list() {
  const tags = await knex('static_course_tags').select('id', 'label').orderBy('id', 'ASC');
  return tags.map((tag) => new StaticCourseTag({ id: tag.id, label: tag.label }));
}
