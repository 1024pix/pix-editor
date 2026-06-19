import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { Module, ModuleForConsultation } from '../../domain/models/index.js';
import { ModuleForReplication } from '../../domain/models/replication/index.js';
import { NotFoundError } from '../errors.js';

export async function count() {
  const knexConn = DomainTransaction.getConnection();
  const { count } = await knexConn('modules').count().first();
  return count;
}

export async function save({ details, sections, glossary, ...module }) {
  const knexConn = DomainTransaction.getConnection();
  const moduleDTO = {
    ...module,
    ...details,
    sections: JSON.stringify(sections),
    glossary: JSON.stringify(glossary),
  };

  const [savedModule] = await knexConn.insert(moduleDTO).into('modules').onConflict('id').merge({ ...moduleDTO, updatedAt: knexConn.fn.now() }).returning('*');

  return toDomain(savedModule);
}

export async function list({ page, sort = [['internalTitle', 'asc']] } = {}) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn.select().from('modules');
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
  const modules = await query;
  return modules.map(toDomain);
}

export async function listForReplication() {
  const knexConn = DomainTransaction.getConnection();
  const modules = await knexConn.select(
    'id',
    'shortId',
    'slug',
    'title',
    'isBeta',
    'visibility',
    'level',
    'duration',
    'objectives',
  ).from('modules').orderBy('slug', 'asc');
  return modules.map(toDomainForReplication);
}

export async function getById({ id }) {
  const knexConn = DomainTransaction.getConnection();

  const module = await knexConn('modules').select('modules.*', 'draft-modules.id as draftModuleId')
    .leftOuterJoin('draft-modules', 'draft-modules.moduleId', 'modules.id')
    .where('modules.id', id)
    .first();

  if (!module) {
    throw new NotFoundError('Module not found');
  }

  return toDomainForConsultation(module);
}

function toDomain({ image, description, duration, level, objectives, tabletSupport, ...module }) {
  return new Module({ ...module, details: { image, description, duration, level, objectives, tabletSupport } });
}

function toDomainForConsultation({ image, description, duration, level, objectives, tabletSupport, ...module }) {
  return new ModuleForConsultation({ ...module, details: { image, description, duration, level, objectives, tabletSupport } });
}

function toDomainForReplication(module) {
  return new ModuleForReplication(module);
}
