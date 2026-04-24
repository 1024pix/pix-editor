import { knex } from '../../../db/knex-database-connection.js';
import { Module } from '../../domain/models/index.js';

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

function toDomain({ image, description, duration, level, objectives, tabletSupport, ...module }) {
  return new Module({ ...module, details: { image, description, duration, level, objectives, tabletSupport } });
}
