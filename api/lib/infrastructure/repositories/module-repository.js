import { knex } from '../../../db/knex-database-connection.js';

export async function save({ details, sections, glossary, ...module }, transaction = knex) {
  const moduleDTO = {
    ...module,
    ...details,
    sections: JSON.stringify(sections),
    glossary: JSON.stringify(glossary),
  };

  await transaction.insert(moduleDTO).into('modules').onConflict('id').merge({ ...moduleDTO, updatedAt: transaction.fn.now() });
}
