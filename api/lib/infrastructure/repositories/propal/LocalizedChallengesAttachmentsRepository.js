import { KnexRepository } from './KnexRepository.js';

export class LocalizedChallengesAttachmentsRepository extends KnexRepository {
  async save({ attachmentId, localizedChallengeId }) {
    await this.dbConn('localized_challenges-attachments')
      .insert({ attachmentId, localizedChallengeId });
  }

  async deleteByAttachmentId(attachmentId) {
    await this.dbConn('localized_challenges-attachments').delete().where({ attachmentId });
  }
}
