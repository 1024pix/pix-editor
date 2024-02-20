import { attachmentDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as localizedChallengeRepository from './localized-challenge-repository.js';
import _ from 'lodash';
import { Attachment } from '../../domain/models/index.js';

export async function list() {
  const datasourceAttachments = await attachmentDatasource.list();
  const translations = await translationRepository.listByPattern('challenge.%.illustrationAlt');
  const localizedChallenges = await localizedChallengeRepository.list();

  return toDomainList(datasourceAttachments, translations, localizedChallenges);
}

function toDomainList(datasourceAttachments, translations, localizedChallenges) {
  const translationsByChallengeId = _.groupBy(translations, ({ key }) => key.split('.')[1]);
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
