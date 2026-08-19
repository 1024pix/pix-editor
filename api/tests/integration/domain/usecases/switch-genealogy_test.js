import { describe, expect, it } from 'vitest';
import { switchGenealogy } from '../../../../lib/domain/usecases/index.js';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';

describe('Integration | Usecases | Switch Genealogy', function() {
  it('should switch challenge genealogy given alternative challenge id', async () => {
    // Given
    const { challenge: challengePrototype } = databaseBuilder.factory.buildChallengeInGroup({
      challenge: {
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        version: 10,
        alternativeVersion: null,
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        status: Challenge.STATUSES.VALIDE,
        spoil: Challenge.SPOILS.NONE,
        responsive: Challenge.RESPONSIVES.NONE,
        translationMaintenanceTags: [Challenge.TRANSLATION_MAINTENANCE_TAGS.EMBED_NAME],
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.AMBIGUOUS_ANSWERS],
        locales: ['fr-FR'],
      },
      localizedChallenge: {
        locale: 'fr-FR',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      },
    });

    const alternativeChallenge = databaseBuilder.factory.buildChallenge({
      id: 'challengeIdDécli',
      skillId: challengePrototype.skillId,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      status: Challenge.STATUSES.VALIDE,
      alternativeVersion: 56,
      accessibility1: Challenge.ACCESSIBILITY1.OK,
      accessibility2: Challenge.ACCESSIBILITY2.OK,
      spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
      responsive: Challenge.RESPONSIVES.SMARTPHONE,
      translationMaintenanceTags: [Challenge.TRANSLATION_MAINTENANCE_TAGS.EMBED_TO_REDO],
      assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.EXTERNAL_LINKS],
      locales: ['fr-FR'],
      version: challengePrototype.version,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: alternativeChallenge.id,
      challengeId: alternativeChallenge.id,
      locale: 'fr-FR',
      requireGafamWebsiteAccess: true,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
      isAwarenessChallenge: true,
      toRephrase: true,
      hasEmbedInternalValidation: true,
      noValidationNeeded: true,
    });

    await databaseBuilder.commit();
    // when
    await switchGenealogy({ alternativeChallengeId: alternativeChallenge.id });
    const updatedPrototypeChallengeToBeAlternative = await knex('challenges')
      .select('version', 'genealogy', 'alternativeVersion')
      .where('id', challengePrototype.id)
      .first();
    const updatedAlternativeChallengeToBePrototype = await knex('challenges')
      .select('version', 'genealogy', 'alternativeVersion', 'accessibility1', 'accessibility2', 'spoil', 'responsive', 'translationMaintenanceTags', 'assessmentMaintenanceTags')
      .where('id', alternativeChallenge.id)
      .first();
    const updatedLocalizedChallenge = await knex('localized_challenges')
      .select('requireGafamWebsiteAccess', 'isIncompatibleIpadCertif', 'deafAndHardOfHearing', 'isAwarenessChallenge', 'toRephrase', 'hasEmbedInternalValidation', 'noValidationNeeded')
      .where('challengeId', alternativeChallenge.id)
      .first();

    // then
    expect(updatedPrototypeChallengeToBeAlternative).toStrictEqual({
      version: challengePrototype.version,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      alternativeVersion: 56,
    });

    expect(updatedAlternativeChallengeToBePrototype).toStrictEqual({
      version: challengePrototype.version,
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      alternativeVersion: null,
      accessibility1: Challenge.ACCESSIBILITY1.KO,
      accessibility2: Challenge.ACCESSIBILITY2.KO,
      spoil: Challenge.SPOILS.NONE,
      responsive: Challenge.RESPONSIVES.NONE,
      translationMaintenanceTags: [Challenge.TRANSLATION_MAINTENANCE_TAGS.EMBED_NAME],
      assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.AMBIGUOUS_ANSWERS],
    });

    expect(updatedLocalizedChallenge).toStrictEqual({
      requireGafamWebsiteAccess: false,
      isIncompatibleIpadCertif: false,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
      isAwarenessChallenge: false,
      toRephrase: false,
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
    });
  });

  it('should switch genealogy when challenge version is null', async () => {
    // Given
    const { challenge } = databaseBuilder.factory.buildChallengeInGroup({
      challenge: {
        id: 'challengeId',
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        status: Challenge.STATUSES.VALIDE,
        version: null,
        alternativeVersion: null,
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        locales: ['fr-FR'],
      },
      localizedChallenge: {
        locale: 'fr-FR',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      },
    });

    const alternativeChallenge = databaseBuilder.factory.buildChallenge({
      id: 'challengeIdDécli2',
      skillId: challenge.skillId,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      status: Challenge.STATUSES.VALIDE,
      alternativeVersion: 56,
      accessibility1: Challenge.ACCESSIBILITY1.OK,
      accessibility2: Challenge.ACCESSIBILITY2.OK,
      locales: ['fr-FR'],
      version: challenge.version,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: alternativeChallenge.id,
      challengeId: alternativeChallenge.id,
      locale: 'fr-FR',
      requireGafamWebsiteAccess: true,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
      isAwarenessChallenge: true,
      toRephrase: true,
      hasEmbedInternalValidation: true,
      noValidationNeeded: true,
    });
    await databaseBuilder.commit();

    // When
    await switchGenealogy({ alternativeChallengeId: alternativeChallenge.id });

    // Then
    const updatedPrototypeChallengeToBeAlternative = await knex('challenges')
      .select('version', 'genealogy', 'alternativeVersion')
      .where('id', challenge.id)
      .first();
    const updatedAlternativeChallengeToBePrototype = await knex('challenges')
      .select('version', 'genealogy', 'alternativeVersion', 'accessibility1', 'accessibility2')
      .where('id', alternativeChallenge.id)
      .first();
    const updatedLocalizedChallenge = await knex('localized_challenges')
      .select('requireGafamWebsiteAccess', 'isIncompatibleIpadCertif', 'deafAndHardOfHearing', 'isAwarenessChallenge', 'toRephrase', 'hasEmbedInternalValidation', 'noValidationNeeded')
      .where('challengeId', alternativeChallenge.id)
      .first();

    expect(updatedPrototypeChallengeToBeAlternative).toStrictEqual({
      version: challenge.version,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      alternativeVersion: 56,
    });

    expect(updatedAlternativeChallengeToBePrototype).toStrictEqual({
      version: challenge.version,
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      alternativeVersion: null,
      accessibility1: Challenge.ACCESSIBILITY1.KO,
      accessibility2: Challenge.ACCESSIBILITY2.KO,
    });

    expect(updatedLocalizedChallenge).toStrictEqual({
      requireGafamWebsiteAccess: false,
      isIncompatibleIpadCertif: false,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
      isAwarenessChallenge: false,
      toRephrase: false,
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
    });
  });
});
