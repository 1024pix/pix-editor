import { knex } from '../../../db/knex-database-connection.js';
import { Module } from '../../domain/models/index.js';
import { ModuleForReplication } from '../../domain/models/replication/index.js';

export async function save({ details, sections, glossary, ...module }, transaction = knex) {
  const moduleDTO = {
    ...module,
    ...details,
    sections: JSON.stringify(sections),
    glossary: JSON.stringify(glossary),
  };

  await transaction.insert(moduleDTO).into('modules').onConflict('id').merge({ ...moduleDTO, updatedAt: transaction.fn.now() });
}

export async function list() {
  const modules = await knex.select().from('modules').orderBy('slug', 'asc');
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
