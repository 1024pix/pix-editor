import { WhitelistedUrl } from '../../../lib/domain/models/index.js';

export function whitelistedUrlsBuilder(databaseBuilder, adminId) {
  databaseBuilder.factory.buildWhitelistedUrl({
    createdBy: adminId,
    latestUpdatedBy: adminId,
    deletedBy: null,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2022-02-02'),
    deletedAt: null,
    url: 'https://www.google.com',
    relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
    comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
    checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
  });
  databaseBuilder.factory.buildWhitelistedUrl({
    createdBy: null,
    latestUpdatedBy: null,
    deletedBy: null,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2022-02-02'),
    deletedAt: null,
    url: 'https://www.editor.pix.fr',
    relatedEntityIds: null,
    comment: 'Mon site préféré',
    checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
  });
  databaseBuilder.factory.buildWhitelistedUrl({
    createdBy: adminId,
    latestUpdatedBy: adminId,
    deletedBy: adminId,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2022-02-02'),
    deletedAt: new Date('2023-01-01'),
    url: 'https://www.les-fruits-c-super-bon',
    relatedEntityIds: 'reclbhuUTRGc1jZRL',
    comment: null,
    checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
  });
}
