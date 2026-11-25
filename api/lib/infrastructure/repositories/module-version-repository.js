import { DomainTransaction } from '../../domain/DomainTransaction.js';

/**
 * @param {import('../../domain/models/index.js').ModuleVersion} moduleVersion
 */
export async function create(moduleVersion) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn.insert(toDto(moduleVersion)).into('module-versions');
}

/**
 * @param {{ moduleId: string, version: string }}
 * @returns {Promise<number | null>} the id of the user who published this version of the module
 */
export async function getPublishedBy({ moduleId, version }) {
  const knexConn = DomainTransaction.getConnection();

  const moduleVersion = await knexConn.select('publishedBy').from('module-versions').where({ moduleId, version }).first();

  return moduleVersion?.publishedBy ?? null;
}

/**
 * @param {import('../../domain/models/index.js').ModuleVersion} moduleVersion
 */
function toDto({ details, sections, glossary, publishedBy, updatedAt: _, ...moduleVersion }) {
  return {
    ...moduleVersion,
    publishedBy,
    ...details,
    sections: JSON.stringify(sections),
    glossary: JSON.stringify(glossary),
  };
}
