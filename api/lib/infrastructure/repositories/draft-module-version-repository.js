import { DomainTransaction } from '../../domain/DomainTransaction.js';

/**
 * @param {import('../../domain/models/index.js').DraftModuleVersion} draftModuleVersion
 */
export async function create({ draftModuleId, version, structuredDiff }) {
  const knexConn = DomainTransaction.getConnection();

  const dto = { draftModuleId, version, structuredDiff };

  await knexConn.insert(dto).into('draft-module-versions');
}
