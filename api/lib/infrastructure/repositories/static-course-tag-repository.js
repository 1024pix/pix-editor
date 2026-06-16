import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { StaticCourseTag } from '../../domain/readmodels/index.js';

export async function listIds() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('static_course_tags').pluck('id').orderBy('id', 'ASC');
}

export async function list() {
  const knexConn = DomainTransaction.getConnection();
  const tags = await knexConn('static_course_tags').select('id', 'label').orderBy('id', 'ASC');
  return tags.map((tag) => new StaticCourseTag({ id: tag.id, label: tag.label }));
}
