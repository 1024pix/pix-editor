import { knex } from '../../../db/knex-database-connection.js';
import { DraftModule } from '../../domain/models/index.js';

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

function toDomain({ image, description, duration, level, objectives, tabletSupport, ...draftModule }) {
  return new DraftModule({ ...draftModule, details: { image, description, duration, level, objectives, tabletSupport } });
}
