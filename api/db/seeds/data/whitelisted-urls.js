import { WhitelistedUrl } from '../../../lib/domain/models/index.js';

// todo put real skill names
export function whitelistedUrlsBuilder(databaseBuilder, adminId) {
  databaseBuilder.factory.buildWhitelistedUrl({
    createdBy: adminId,
    latestUpdatedBy: adminId,
    deletedBy: null,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2022-02-02'),
    deletedAt: null,
    url: 'https://www.google.com',
    relatedSkillNames: '@noix2,@coque8',
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
    relatedSkillNames: null,
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
    relatedSkillNames: '@chameau4',
    comment: null,
    checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
  });
}
