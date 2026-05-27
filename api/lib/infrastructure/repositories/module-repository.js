import { knex } from '../../../db/knex-database-connection.js';
import { Module } from '../../domain/models/index.js';
import { ModuleForReplication } from '../../domain/models/replication/index.js';

export async function count() {
  const { count } = await knex('modules').count().first();
  return count;
}

export async function save({ details, sections, glossary, ...module }, transaction = knex) {
  const moduleDTO = {
    ...module,
    ...details,
    sections: JSON.stringify(sections),
    glossary: JSON.stringify(glossary),
  };

  const [savedModule] = await transaction.insert(moduleDTO).into('modules').onConflict('id').merge({ ...moduleDTO, updatedAt: transaction.fn.now() }).returning('*');

  return toDomain(savedModule);
}

export async function list({ page, sort = [['internalTitle', 'asc']] } = {}) {
  const query = knex.select().from('modules');
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
  const modules = await knex.select(
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

function toDomain({ image, description, duration, level, objectives, tabletSupport, ...module }) {
  return new Module({ ...module, details: { image, description, duration, level, objectives, tabletSupport } });
}

function toDomainForReplication(module) {
  return new ModuleForReplication(module);
}
