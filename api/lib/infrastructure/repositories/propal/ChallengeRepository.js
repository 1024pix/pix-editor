import _ from 'lodash';
import { Challenge, Translation } from '../../../domain/models/index.js';
import { challengeDatasource, skillDatasource } from '../../datasources/airtable/index.js';
import { extractFromChallenge as extractTranslationsFromChallenge, prefixFor, } from '../../translations/challenge.js';
import { NotFoundError } from '../../../domain/errors.js';
import { KnexRepository } from './KnexRepository.js';
import { TranslationRepository } from './TranslationRepository.js';
import { LocalizedChallengeRepository } from './LocalizedChallengeRepository.js';

export class ChallengeRepository extends KnexRepository {
  static model = 'challenge';

  constructor({ knexTransaction } = {}) {
    super({ knexTransaction });
    this.translationRepository = new TranslationRepository({ knexTransaction: this.dbConn });
    this.localizedChallengeRepository = new LocalizedChallengeRepository({ knexTransaction: this.dbConn });
  }

  async get(id) {
    const [challengeDto, localizedChallenges, translations] = await Promise.all([
      challengeDatasource.filterById(id),
      this.localizedChallengeRepository.listByChallengeIds({ challengeIds: [id] }),
      this.translationRepository.listByEntity(ChallengeRepository.model, id),
    ]);

    if (!challengeDto) throw new NotFoundError('Épreuve introuvable');

    return toDomain(challengeDto, translations, localizedChallenges);
  }

  async list() {
    const [challengeDtos, translations, localizedChallenges] = await Promise.all([
      challengeDatasource.list(),
      this.translationRepository.listByModel(ChallengeRepository.model),
      this.localizedChallengeRepository.list(),
    ]);
    return toDomainList(challengeDtos, translations, localizedChallenges);
  }

  async getMany(ids) {
    const [challengeDTOs, [translations, localizedChallenges]] = await Promise.all([
      challengeDatasource.filter({ filter: { ids } }),
      this.#loadTranslationsAndLocalizedChallengesForChallengeIds(ids),
    ]);
    if (!challengeDTOs) return [];
    return toDomainList(challengeDTOs, translations, localizedChallenges);
  }

  async filter(params = {}) {
    const challengeDtos = await this.#getChallengesFromParams(params);
    const [translations, localizedChallenges] = await this.#loadTranslationsAndLocalizedChallengesForChallenges(challengeDtos);
    return toDomainList(challengeDtos, translations, localizedChallenges);
  }

  async filterByThematicIds(thematicIds) {
    const formula = `OR(${thematicIds.map((thematicId) => `FIND("${thematicId}", {Thematique (Record ID)})`).join(', ')})`;

    return this.filter({ filter: { formula } });
  }

  async create(challenge) {
    const createdChallengeDto = await challengeDatasource.create(challenge);
    const primaryLocalizedChallenge = challenge.localizedChallenges[0];
    await this.localizedChallengeRepository.create({ localizedChallenges: [primaryLocalizedChallenge] });

    const translations = extractTranslationsFromChallenge(challenge);
    await this.translationRepository.save({ translations });
    return toDomain(createdChallengeDto, translations, [primaryLocalizedChallenge]);
  }

  async createBatch(challenges) {
    if (!challenges || challenges.length === 0) return [];
    const necessarySkillIds = _.uniq(challenges.map((challenge) => challenge.skillId));
    const airtableSkillIdsByIds = await skillDatasource.getAirtableIdsByIds(necessarySkillIds);
    for (const challenge of challenges) {
      challenge.skills = [airtableSkillIdsByIds[challenge.skillId]];
      challenge.files = [];
    }
    const createdChallengesDtos = await challengeDatasource.createBatch(challenges);
    const allLocalizedChallenges = challenges.flatMap((challenge) => challenge.localizedChallenges);
    const allTranslations = challenges.flatMap((challenge) => {
      const translationModels = [];
      for (const [locale, translationsForLocale] of Object.entries(challenge.translations)) {
        for (const [field, value] of Object.entries(translationsForLocale)) {
          translationModels.push(new Translation({
            key: `${prefixFor(challenge)}${field}`,
            locale,
            value,
          }));
        }
      }
      return translationModels;
    });
    await this.localizedChallengeRepository.create({ localizedChallenges: allLocalizedChallenges });
    await this.translationRepository.save({ translations: allTranslations });
    return toDomainList(createdChallengesDtos, allTranslations, allLocalizedChallenges);
  }

  async update(challenge) {
    const updatedChallengeDto = await challengeDatasource.update(challenge);
    const localizedChallenges = await this.localizedChallengeRepository.listByChallengeIds({ challengeIds: [challenge.id] });
    const primaryLocalizedChallenge = localizedChallenges.find(({ isPrimary }) => isPrimary);

    const oldPrimaryLocale = primaryLocalizedChallenge.locale;
    if (oldPrimaryLocale !== challenge.primaryLocale) {
      primaryLocalizedChallenge.locale = challenge.primaryLocale;
    }

    primaryLocalizedChallenge.embedUrl = challenge.embedUrl;
    primaryLocalizedChallenge.geography = challenge.geographyCode;
    primaryLocalizedChallenge.urlsToConsult = challenge.urlsToConsult;
    primaryLocalizedChallenge.requireGafamWebsiteAccess = challenge.requireGafamWebsiteAccess;
    primaryLocalizedChallenge.isIncompatibleIpadCertif = challenge.isIncompatibleIpadCertif;
    primaryLocalizedChallenge.deafAndHardOfHearing = challenge.deafAndHardOfHearing;
    primaryLocalizedChallenge.isAwarenessChallenge = challenge.isAwarenessChallenge;
    primaryLocalizedChallenge.toRephrase = challenge.toRephrase;
    primaryLocalizedChallenge.hasEmbedInternalValidation = challenge.hasEmbedInternalValidation;
    primaryLocalizedChallenge.noValidationNeeded = challenge.noValidationNeeded;

    await this.localizedChallengeRepository.update({
      localizedChallenge: primaryLocalizedChallenge,
    });

    const translations = extractTranslationsFromChallenge(challenge);
    await this.translationRepository.deleteByKeyPrefixAndLocales({
      prefix: prefixFor(challenge),
      locales: [oldPrimaryLocale],
    });
    await this.translationRepository.save({ translations });
    return toDomain(updatedChallengeDto, translations, localizedChallenges);
  }

  async listBySkillId(skillId) {
    const challengeDTOs = await challengeDatasource.filterBySkillId(skillId);
    if (!challengeDTOs) return [];
    const [translations, localizedChallenges] = await this.#loadTranslationsAndLocalizedChallengesForChallenges(challengeDTOs);
    return toDomainList(challengeDTOs, translations, localizedChallenges);
  }

  async listActiveOrDraftByCompetenceId(competenceId) {
    const challengeDTOs = await challengeDatasource.listActiveOrDraftByCompetenceId(competenceId);
    if (!challengeDTOs) return [];
    const [translations, localizedChallenges] = await this.#loadTranslationsAndLocalizedChallengesForChallenges(challengeDTOs);
    return toDomainList(challengeDTOs, translations, localizedChallenges);
  }

  async listPrototypesByCompetenceId(competenceId) {
    const challengeDTOs = await challengeDatasource.listPrototypesByCompetenceId(competenceId);
    if (!challengeDTOs) return [];
    const [translations, localizedChallenges] = await this.#loadTranslationsAndLocalizedChallengesForChallenges(challengeDTOs);
    return toDomainList(challengeDTOs, translations, localizedChallenges);
  }

  async #loadTranslationsAndLocalizedChallengesForChallengeIds(challengeIds) {
    if (challengeIds.length === 0) return [[], []];

    return Promise.all([
      this.translationRepository.listByEntities(ChallengeRepository.model, challengeIds),
      this.localizedChallengeRepository.listByChallengeIds({ challengeIds }),
    ]);
  }

  async #loadTranslationsAndLocalizedChallengesForChallenges(challengeDtos) {
    return this.#loadTranslationsAndLocalizedChallengesForChallengeIds(
      challengeDtos.map(({ id }) => id),
    );
  }

  async #getChallengesFromParams(params) {
    if (params.filter && params.filter.ids) {
      return challengeDatasource.filter(params);
    }
    if (params.filter && params.filter.search) {
      params.filter.ids = await this.translationRepository.search({
        entity: ChallengeRepository.model,
        fields: ['instruction', 'proposals'],
        search: params.filter.search,
        limit: params.page?.size,
      });
      return challengeDatasource.search(params);
    }
    if (params?.filter?.formula) {
      return challengeDatasource.filter(params);
    }
    return challengeDatasource.list(params);
  }
}

function toDomainList(challengeDtos, translations, localizedChallenges) {
  const translationsByChallengeId = _.groupBy(translations, 'entityId');
  const localizedChallengesByChallengeId = _.groupBy(localizedChallenges, 'challengeId');

  return challengeDtos.map((challengeDto) => {
    const challengeTranslations = translationsByChallengeId[challengeDto.id] ?? [];
    const localizedChallenges = localizedChallengesByChallengeId[challengeDto.id] ?? [];

    return toDomain(challengeDto, challengeTranslations, localizedChallenges);
  });
}

function toDomain(challengeDto, challengeTranslations, localizedChallenges = []) {
  const translationsByLocale = _.groupBy(challengeTranslations, 'locale');
  const translations = _.mapValues(translationsByLocale, (localeTranslations) => {
    return Object.fromEntries([
      ...localeTranslations.map(({ key, value }) => [key.split('.').at(-1), value]),
    ]);
  });

  return new Challenge({
    ...challengeDto,
    translations,
    localizedChallenges,
  });

}

