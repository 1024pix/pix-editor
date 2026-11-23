import { DomainTransaction } from '../../domain/DomainTransaction.js';

/**
 * @param {import('../../domain/models/index.js').ModuleVersion} moduleVersion
 */
export async function create(moduleVersion) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn.insert(toDto(moduleVersion)).into('module-versions');
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
