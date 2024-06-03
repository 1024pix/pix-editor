import { attachmentDatasource, challengeDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as localizedChallengeRepository from './localized-challenge-repository.js';
import _ from 'lodash';
import { Attachment } from '../../domain/models/index.js';
import { cloneFile } from '../utils/storage.js';

export async function list() {
  const datasourceAttachments = await attachmentDatasource.list();
  const translations = await translationRepository.listByPattern('challenge.%.illustrationAlt');
  const localizedChallenges = await localizedChallengeRepository.list();

  return toDomainList(datasourceAttachments, translations, localizedChallenges);
}

export async function listByChallengeIds(challengeIds) {
  const datasourceAttachments = await attachmentDatasource.filterByChallengeIds(challengeIds);
  if (!datasourceAttachments) return [];
  const translations = await translationRepository.listByPattern('challenge.%.illustrationAlt');
  const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds });

  return toDomainList(datasourceAttachments, translations, localizedChallenges);
}

export async function createBatch(attachments) {
  if (!attachments || attachments.length === 0) return [];
  const necessaryChallengeIds = _.uniq(attachments.map((attachment) => attachment.challengeId));
  const airtableChallengeIdsByIds = await challengeDatasource.getAirtableIdsByIds(necessaryChallengeIds);
  const attachmentToSaveDTOs = [];
  for (const attachment of attachments) {
    const isPrimaryLocaleAttachment = attachment.challengeId === attachment.localizedChallengeId;
    if (!isPrimaryLocaleAttachment) continue;
    const newUrl = await cloneFile({
      url: attachment.url,
      millisecondsTimestamp: Date.now(),
    });
    attachmentToSaveDTOs.push({
      url: newUrl,
      size: attachment.size,
      type: attachment.type,
      mimeType: attachment.mimeType,
      challengeId: airtableChallengeIdsByIds[attachment.challengeId],
      localizedChallengeId: attachment.localizedChallengeId,
    });
  }
  const createdAttachmentsDtos = await attachmentDatasource.createBatch(attachmentToSaveDTOs);
  const translations = await translationRepository.listByPattern('challenge.%.illustrationAlt');
  const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds: attachments.map((attachment) => attachment.challengeId) });
  return toDomainList(createdAttachmentsDtos, translations, localizedChallenges);
}

function toDomainList(datasourceAttachments, translations, localizedChallenges) {
  const translationsByChallengeId = _.groupBy(translations, 'entityId');
  const localizedChallengesById = _.groupBy(localizedChallenges, 'id');

  return datasourceAttachments.map((attachment) => {
    if (attachment.type !== 'illustration') {
      return toDomain(attachment);
    }
    const challengeTranslations = translationsByChallengeId[attachment.challengeId];
    const locale = localizedChallengesById[attachment.localizedChallengeId][0].locale;
    const translation = challengeTranslations?.find((translation) => locale === translation.locale);

    return toDomain(attachment, translation);
  });
}

export function toDomain(attachment, translation) {
  return new Attachment({
    ...attachment,
    alt: translation?.value ?? null,
  });
}
