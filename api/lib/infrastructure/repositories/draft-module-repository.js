import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { DraftModule } from '../../domain/models/index.js';
import { NotFoundError } from '../errors.js';

export async function save({ details, sections, glossary, ...module }) {
  const knexConn = DomainTransaction.getConnection();
  const draftModuleDTO = {
    ...module,
    ...details,
    sections: JSON.stringify(sections),
    glossary: JSON.stringify(glossary),
  };

  const [savedDraftModule] = await knexConn.insert(draftModuleDTO).into('draft-modules').onConflict('id').merge({ ...draftModuleDTO, updatedAt: knexConn.fn.now() }).returning('*');

  return toDomain(savedDraftModule);
}

export async function list({ page, sort = [['internalTitle', 'asc']] } = {}) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn.select().from('draft-modules');
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
  const knexConn = DomainTransaction.getConnection();
  const { count } = await knexConn('draft-modules').count().first();
  return count;
}

export async function getById({ id, forUpdate = false }) {
  const knexConn = DomainTransaction.getConnection();

  let query = knexConn.select('*').from('draft-modules').where({ id }).first();
  if (forUpdate) query = query.forUpdate();

  const draftModule = await query;

  if (!draftModule) {
    throw new NotFoundError('Draft module not found');
  }

  return toDomain(draftModule);
}

export async function remove({ id }) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn.delete().from('draft-modules').where('id', id);
}

function toDomain({ image, description, duration, level, objectives, tabletSupport, ...draftModule }) {
  return new DraftModule({ ...draftModule, details: { image, description, duration, level, objectives, tabletSupport } });
}
