import { knex } from '../../../db/knex-database-connection.js';
import { DraftModule } from '../../domain/models/index.js';
import { NotFoundError } from '../errors.js';

export async function save({ details, sections, glossary, ...module }, transaction = knex) {
  const draftModuleDTO = {
    ...module,
    ...details,
    sections: JSON.stringify(sections),
    glossary: JSON.stringify(glossary),
  };

  const [savedDraftModule] = await transaction.insert(draftModuleDTO).into('draft-modules').onConflict('id').merge({ ...draftModuleDTO, updatedAt: transaction.fn.now() }).returning('*');

  return toDomain(savedDraftModule);
}

export async function list({ page, sort = [['internalTitle', 'asc']] } = {}) {
  const query = knex.select().from('draft-modules');
  sort.forEach(([column, order]) => {
    if (['internalTitle', 'title'].includes(column)) {
      query.orderByRaw(`?? collate ?? ${order}`, [column, 'fr-x-icu']);
    } else {
      query.orderBy(column, order);
    }
  });
  if (page) {
    const offset = (page.number - 1) * page.size;
    query.offset(offset).limit(page.size);
  }
  const draftModules = await query;
  return draftModules.map(toDomain);
}

export async function count() {
  const { count } = await knex('draft-modules').count().first();
  return count;
}

export async function getById({ id }) {
  const draftModule = await knex('draft-modules').where({ id }).first();

  if (!draftModule) {
    throw new NotFoundError('Draft module not found');
  }

  return toDomain(draftModule);
}

function toDomain({ image, description, duration, level, objectives, tabletSupport, ...draftModule }) {
  return new DraftModule({ ...draftModule, details: { image, description, duration, level, objectives, tabletSupport } });
}
