import { afterEach, beforeEach, describe, describe as context, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import {
  create,
  getCurrentContent,
  getLatestRelease,
  getRelease
} from '../../../../lib/infrastructure/repositories/release-repository.js';
import { Area, Challenge, LocalizedChallenge, Mission } from '../../../../lib/domain/models/index.js';
import { ChallengeForRelease, SkillForRelease } from '../../../../lib/domain/models/release/index.js';

describe('Integration | Repository | release-repository', function() {
  describe('#create', function() {

    afterEach(function() {
      return knex('releases').delete();
    });

    it('should save current content as a new release', async function() {
      // Given
      const currentContent = { some: 'property' };
      const fakeGetCurrentContent = async function() {
        return currentContent;
      };

      // When
      await create(fakeGetCurrentContent);

      // Then
      const releasesInDb = await knex('releases');
      expect(releasesInDb).to.have.length(1);
      expect(releasesInDb[0].content).to.deep.equal(currentContent);
    });

    it('should return the saved release ID', async function() {
      // Given
      const currentContentDTO = {
        areas: [],
        challenges: [],
        competences: [],
        courses: [],
        frameworks: [],
        skills: [],
        thematics: [],
        tubes: [],
        tutorials: []
      };
      const fakeGetCurrentContent = async function() {
        return currentContentDTO;
      };

      // When
      const releaseId = await create(fakeGetCurrentContent);

      // Then
      const [releasesInDbId] = await knex('releases').pluck('id');
      expect(releaseId).to.equal(releasesInDbId);
    });
  });

  describe('#getLatestRelease', function() {
    it('should return content of newest created release', async function() {
      // Given
      const newestReleaseContentDTO = {
        areas: [],
        challenges: [],
        competences: [],
        courses: [],
        frameworks: [],
        skills: [],
        thematics: [],
        tubes: [],
        tutorials: []
      };
      const oldestReleaseContentDTO = { some: 'old-property' };
      databaseBuilder.factory.buildRelease({
        id: 1,
        createdAt: new Date('2021-02-02'),
        content: newestReleaseContentDTO
      });
      databaseBuilder.factory.buildRelease({
        id: 2,
        createdAt: new Date('2020-01-01'),
        content: oldestReleaseContentDTO
      });
      await databaseBuilder.commit();

      // When
      const latestRelease = await getLatestRelease();

      // Then
      const expectedContent = domainBuilder.buildContentForRelease(newestReleaseContentDTO);
      const expectedRelease = domainBuilder.buildDomainRelease({
        id: 1,
        createdAt: new Date('2021-02-02'),
        content: expectedContent
      });
      expect(latestRelease).toEqualInstance(expectedRelease);
    });
  });

  describe('#getRelease', function() {
    it('should return content of given release', async function() {
      // Given
      const otherReleaseContentDTO = { some: 'property' };
      const expectedReleaseContentDTO = {
        areas: [],
        challenges: [],
        competences: [],
        courses: [],
        frameworks: [],
        missions: [],
        skills: [],
        thematics: [],
        tubes: [],
        tutorials: []
      };

      databaseBuilder.factory.buildRelease({
        id: 11,
        createdAt: new Date('2021-01-01'),
        content: otherReleaseContentDTO
      });
      databaseBuilder.factory.buildRelease({
        id: 12,
        createdAt: new Date('2020-01-01'),
        content: expectedReleaseContentDTO
      });
      await databaseBuilder.commit();

      // When
      const givenRelease = await getRelease(12);

      // Then
      const expectedContent = domainBuilder.buildContentForRelease(expectedReleaseContentDTO);
      const expectedRelease = domainBuilder.buildDomainRelease({
        id: 12,
        createdAt: new Date('2020-01-01'),
        content: expectedContent
      });
      expect(givenRelease).toEqualInstance(expectedRelease);
    });

    context('with a rich and realistic content', function() {
      it('should return a well formed release', async function() {
        // Given
        _mockRichAirtableContent();
        const richCurrentContentDTO = _getRichCurrentContentDTO();
        databaseBuilder.factory.buildRelease({
          id: 1,
          createdAt: new Date('2021-01-01'),
          content: richCurrentContentDTO
        });
        await databaseBuilder.commit();

        // When
        const givenRelease = await getRelease(1);

        // Then
        const expectedContent = domainBuilder.buildContentForRelease(richCurrentContentDTO);
        const expectedRelease = domainBuilder.buildDomainRelease({
          id: 1,
          createdAt: new Date('2021-01-01'),
          content: expectedContent
        });
        expect(givenRelease).toEqualInstance(expectedRelease);
      });
    });
  });

  describe('#getCurrentContent', function() {

    beforeEach(function() {
      const { areas, competences, thematics, tubeIds, skills, challenges } = _mockRichAirtableContent();

      buildAreasTranslations(areas);
      buildCompetencesTranslations(competences);
      buildThematicsTranslations(thematics);
      buildTubesTranslations(tubeIds);
      buildSkillsTranslations(skills);
      buildChallengesTranslationsAndLocalizedChallenges(challenges);

      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        attachmentId: 'attachment4',
        localizedChallengeId: 'challengeNl',
      });

      databaseBuilder.factory.buildStaticCourse({
        id: 'course1PG',
        name: 'course1PG name',
        description: 'course1PG description',
        isActive: false,
        challengeIds: 'challenge121212,challenge211113,challengeNl',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
      });

      databaseBuilder.factory.buildMission({
        id: 123456789,
        name: 'mission PG name',
        competenceId: 'competenceId',
        learningObjectives: 'Que tu sois le meilleur',
        thematicIds: 'thematicIds',
        validatedObjectives: 'Rien',
        status: Mission.status.INACTIVE,
      });

      return databaseBuilder.commit();
    });

    it('should return current content as DTO', async function() {
      // When
      const currentContentDTO = await getCurrentContent();
      // Then

      const expectedReleaseContentDTO = _getRichCurrentContentDTO();
      expect(currentContentDTO).to.deep.equal(expectedReleaseContentDTO);
    });
  });
});

function buildAreasTranslations(areas) {
  for (const area of areas) {
    databaseBuilder.factory.buildTranslation({
      key: `area.${area.id}.title`,
      locale: 'fr',
      value: `${area.id} titleFrFr`,
    });
    databaseBuilder.factory.buildTranslation({
      key: `area.${area.id}.title`,
      locale: 'en',
      value: `${area.id} titleEnUs`,
    });
  }
}

function buildCompetencesTranslations(competences) {
  for (const competence of competences) {
    databaseBuilder.factory.buildTranslation({
      key: `competence.${competence.id}.name`,
      locale: 'fr',
      value: `${competence.id} nameFrFr`,
    });
    databaseBuilder.factory.buildTranslation({
      key: `competence.${competence.id}.name`,
      locale: 'en',
      value: `${competence.id} nameEnUs`,
    });
    databaseBuilder.factory.buildTranslation({
      key: `competence.${competence.id}.description`,
      locale: 'fr',
      value: `${competence.id} descriptionFrFr`,
    });
    databaseBuilder.factory.buildTranslation({
      key: `competence.${competence.id}.description`,
      locale: 'en',
      value: `${competence.id} descriptionEnUs`,
    });
  }
}

function buildThematicsTranslations(thematics) {
  for (const thematic of thematics) {
    databaseBuilder.factory.buildTranslation({
      key: `thematic.${thematic.id}.name`,
      locale: 'fr',
      value: `${thematic.id} nameFrFr`,
    });
    databaseBuilder.factory.buildTranslation({
      key: `thematic.${thematic.id}.name`,
      locale: 'en',
      value: `${thematic.id} nameEnUs`,
    });
  }
}

function buildSkillsTranslations(skills) {
  for (const skill of skills) {
    databaseBuilder.factory.buildTranslation({
      key: `skill.${skill.id}.hint`,
      locale: 'fr',
      value: `${skill.id} hintFrFr`,
    });
    databaseBuilder.factory.buildTranslation({
      key: `skill.${skill.id}.hint`,
      locale: 'en',
      value: `${skill.id} hintEnUs`,
    });
  }
}

function buildTubesTranslations(tubeIds) {
  for (const id of tubeIds) {
    databaseBuilder.factory.buildTranslation({
      key: `tube.${id}.practicalDescription`,
      locale: 'fr',
      value: `${id} practicalDescriptionFrFr from PG`,
    });
    databaseBuilder.factory.buildTranslation({
      key: `tube.${id}.practicalDescription`,
      locale: 'en',
      value: `${id} practicalDescriptionEnUs from PG`,
    });
    databaseBuilder.factory.buildTranslation({
      key: `tube.${id}.practicalTitle`,
      locale: 'fr',
      value: `${id} practicalTitleFrFr from PG`,
    });
    databaseBuilder.factory.buildTranslation({
      key: `tube.${id}.practicalTitle`,
      locale: 'en',
      value: `${id} practicalTitleEnUs from PG`,
    });
  }
}

function buildChallengesTranslationsAndLocalizedChallenges(challenges) {
  for (const challenge of challenges) {
    buildChallengeTranslationsAndLocalizedChallenge(challenge, challenge.locales[0]);
  }

  buildChallengeTranslationsAndLocalizedChallenge(challenges[0], 'nl-be', 'challengeNl');
}

function buildChallengeTranslationsAndLocalizedChallenge(challenge, locale, localizedChallengeId = challenge.id) {
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${challenge.id}.instruction`,
    locale,
    value: `${challenge.id} instruction ${locale}`,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${challenge.id}.alternativeInstruction`,
    locale,
    value: `${challenge.id} alternativeInstruction ${locale}`,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${challenge.id}.proposals`,
    locale,
    value: `${challenge.id} proposals ${locale}`,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${challenge.id}.solution`,
    locale,
    value: `${challenge.id} solution ${locale}`,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${challenge.id}.solutionToDisplay`,
    locale,
    value: `${challenge.id} solutionToDisplay ${locale}`,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${challenge.id}.embedTitle`,
    locale,
    value: `${challenge.id} embedTitle ${locale}`,
  });

  databaseBuilder.factory.buildLocalizedChallenge({
    id: localizedChallengeId,
    challengeId: challenge.id,
    locale,
    embedUrl: localizedChallengeId === challenge.id ? challenge.embedUrl : undefined,
    status: LocalizedChallenge.STATUSES.PLAY,
  });
}

function _mockRichAirtableContent() {
  const airtableFrameworkA = airtableBuilder.factory.buildFramework({
    id: 'frameworkA',
    name: 'FrameworkA',
  });
  const area1 = {
    id: 'area1',
    competenceIds: ['competence11', 'competence12'],
    competenceAirtableIds: ['competence11', 'competence12'],
    code: '1',
    name: 'area1 name',
    color: Area.COLORS.JAFFA,
    frameworkId: 'frameworkA',
  };
  const airtableArea1 = airtableBuilder.factory.buildArea(area1);
  const area2 = {
    id: 'area2',
    competenceIds: ['competence21'],
    competenceAirtableIds: ['competence21'],
    code: '2',
    name: 'area2 name',
    color: Area.COLORS.EMERALD,
    frameworkId: 'frameworkA',
  };
  const airtableArea2 = airtableBuilder.factory.buildArea(area2);
  const competence11 = {
    id: 'competence11',
    index: 'competence11 index',
    areaId: 'area1',
    skillIds: ['skill11111', 'skill11112'],
    thematicIds: ['thematic111', 'thematic112'],
    origin: 'FrameworkA',
  };
  const airtableCompetence11 = airtableBuilder.factory.buildCompetence(competence11);
  const competence12 = {
    id: 'competence12',
    index: 'competence12 index',
    areaId: 'area1',
    skillIds: ['skill12121'],
    thematicIds: ['thematic121'],
    origin: 'FrameworkA',
  };
  const airtableCompetence12 = airtableBuilder.factory.buildCompetence(competence12);
  const competence21 = {
    id: 'competence21',
    index: 'competence21 index',
    areaId: 'area2',
    skillIds: ['skill21111'],
    thematicIds: ['thematic211'],
    origin: 'FrameworkA',
  };
  const airtableCompetence21 = airtableBuilder.factory.buildCompetence(competence21);
  const thematic111 = {
    id: 'thematic111',
    name_i18n: {
      fr: 'thematic111 name',
      en: 'thematic111 nameEnUs',
    },
    competenceId: 'competence11',
    tubeIds: ['tube1111'],
    index: 'thematic111 index',
  };
  const airtableThematic111 = airtableBuilder.factory.buildThematic(thematic111);
  const thematic112 = {
    id: 'thematic112',
    name_i18n: {
      fr: 'thematic112 name',
      en: 'thematic112 nameEnUs',
    },
    competenceId: 'competence11',
    tubeIds: ['tube1121'],
    index: 'thematic112 index',
  };
  const airtableThematic112 = airtableBuilder.factory.buildThematic(thematic112);
  const thematic121 = {
    id: 'thematic121',
    name_i18n: {
      fr: 'thematic121 name',
      en: 'thematic121 nameEnUs',
    },
    competenceId: 'competence12',
    tubeIds: ['tube1211', 'tube1212'],
    index: 'thematic121 index',
  };
  const airtableThematic121 = airtableBuilder.factory.buildThematic(thematic121);
  const thematic211 = {
    id: 'thematic211',
    name_i18n: {
      fr: 'thematic211 name',
      en: 'thematic211 nameEnUs',
    },
    competenceId: 'competence21',
    tubeIds: ['tube2111'],
    index: 'thematic211 index',
  };
  const airtableThematic211 = airtableBuilder.factory.buildThematic(thematic211);
  const airtableTube1111 = airtableBuilder.factory.buildTube({
    id: 'tube1111',
    name: 'tube1111 name',
    title: 'tube1111 title',
    description: 'tube1111 description',
    practicalTitle_i18n: {
      fr: 'tube1111 practicalTitleFrFr',
      en: 'tube1111 practicalTitleEnUs',
    },
    practicalDescription_i18n: {
      fr: 'tube1111 practicalDescriptionFrFr',
      en: 'tube1111 practicalDescriptionEnUs',
    },
    competenceId: 'competence11',
  });
  const airtableTube1121 = airtableBuilder.factory.buildTube({
    id: 'tube1121',
    name: 'tube1121 name',
    title: 'tube1121 title',
    description: 'tube1121 description',
    practicalTitle_i18n: {
      fr: 'tube1121 practicalTitleFrFr',
      en: 'tube1121 practicalTitleEnUs',
    },
    practicalDescription_i18n: {
      fr: 'tube1121 practicalDescriptionFrFr',
      en: 'tube1121 practicalDescriptionEnUs',
    },
    competenceId: 'competence11',
  });
  const airtableTube1211 = airtableBuilder.factory.buildTube({
    id: 'tube1211',
    name: 'tube1211 name',
    title: 'tube1211 title',
    description: 'tube1211 description',
    practicalTitle_i18n: {
      fr: 'tube1211 practicalTitleFrFr',
      en: 'tube1211 practicalTitleEnUs',
    },
    practicalDescription_i18n: {
      fr: 'tube1211 practicalDescriptionFrFr',
      en: 'tube1211 practicalDescriptionEnUs',
    },
    competenceId: 'competence12',
  });
  const airtableTube1212 = airtableBuilder.factory.buildTube({
    id: 'tube1212',
    name: 'tube1212 name',
    title: 'tube1212 title',
    description: 'tube1212 description',
    practicalTitle_i18n: {
      fr: 'tube1212 practicalTitleFrFr',
      en: 'tube1212 practicalTitleEnUs',
    },
    practicalDescription_i18n: {
      fr: 'tube1212 practicalDescriptionFrFr',
      en: 'tube1212 practicalDescriptionEnUs',
    },
    competenceId: 'competence12',
  });
  const airtableTube2111 = airtableBuilder.factory.buildTube({
    id: 'tube2111',
    name: 'tube2111 name',
    title: 'tube2111 title',
    description: 'tube2111 description',
    practicalTitle_i18n: {
      fr: 'tube2111 practicalTitleFrFr',
      en: 'tube2111 practicalTitleEnUs',
    },
    practicalDescription_i18n: {
      fr: 'tube2111 practicalDescriptionFrFr',
      en: 'tube2111 practicalDescriptionEnUs',
    },
    competenceId: 'competence21',
  });
  const skill11111 = {
    id: 'skill11111',
    name: 'skill11111 name',
    hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
    tutorialIds: ['tutorial2'],
    learningMoreTutorialIds: ['tutorial1'],
    pixValue: 1,
    competenceId: 'competence11',
    status: SkillForRelease.STATUSES.ACTIF,
    tubeId: 'tube1111',
    description: 'skill11111 description',
    level: 4,
    internationalisation: SkillForRelease.INTERNATIONALISATIONS.MONDE,
    version: 'skill11111 version',
  };
  const airtableSkill11111 = airtableBuilder.factory.buildSkill(skill11111);
  const skill11112 = {
    id: 'skill11112',
    name: 'skill11112 name',
    hintStatus: SkillForRelease.HINT_STATUSES.VALIDE,
    tutorialIds: [],
    learningMoreTutorialIds: [],
    pixValue: 2,
    competenceId: 'competence11',
    status: SkillForRelease.STATUSES.ACTIF,
    tubeId: 'tube1111',
    description: 'skill11112 description',
    level: 3,
    internationalisation: SkillForRelease.INTERNATIONALISATIONS.FRANCE,
    version: 'skill11112 version',
  };
  const airtableSkill11112 = airtableBuilder.factory.buildSkill(skill11112);
  const skill12121 = {
    id: 'skill12121',
    name: 'skill12121 name',
    hintStatus: SkillForRelease.HINT_STATUSES.PRE_VALIDE,
    tutorialIds: [],
    learningMoreTutorialIds: [],
    pixValue: 3,
    competenceId: 'competence12',
    status: SkillForRelease.STATUSES.ACTIF,
    tubeId: 'tube1212',
    description: 'skill12121 description',
    level: 2,
    internationalisation: SkillForRelease.INTERNATIONALISATIONS.UNION_EUROPEENNE,
    version: 'skill12121 version',
  };
  const airtableSkill12121 = airtableBuilder.factory.buildSkill(skill12121);
  const skill21111 = {
    id: 'skill21111',
    name: 'skill21111 name',
    hintStatus: SkillForRelease.HINT_STATUSES.A_SOUMETTRE,
    tutorialIds: [],
    learningMoreTutorialIds: [],
    pixValue: 4,
    competenceId: 'competence21',
    status: SkillForRelease.STATUSES.ACTIF,
    tubeId: 'tube2111',
    description: 'skill21111 description',
    level: 1,
    internationalisation: SkillForRelease.INTERNATIONALISATIONS.MONDE,
    version: 'skill21111 version',
  };
  const airtableSkill21111 = airtableBuilder.factory.buildSkill(skill21111);
  const challenge121211 = {
    id: 'challenge121211',
    type: ChallengeForRelease.TYPES.QCM,
    t1Status: 'challenge121211 t1Status',
    t2Status: 'challenge121211 t2Status',
    t3Status: 'challenge121211 t3Status',
    status: ChallengeForRelease.STATUSES.VALIDE,
    skillId: 'skill12121',
    embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge121211.html?lang=fr&mode=a#123456',
    embedTitle: 'challenge121211 embedTitle',
    embedHeight: 'challenge121211 embedHeight',
    timer: 1,
    competenceId: 'competence12',
    format: 'challenge121211 format',
    files: [
      { fileId: 'attachment1', localizedChallengeId: 'challenge121211' },
      { fileId: 'attachment2', localizedChallengeId: 'challenge121211' },
    ],
    autoReply: 'challenge121211 autoReply',
    locales: ['fr-fr'],
    airtableId: 'challenge121211',
    skills: 'challenge121211 skills',
    genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
    pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
    author: 'challenge121211 author',
    declinable: Challenge.DECLINABLES.NON,
    preview: 'challenge121211 preview',
    version: 'challenge121211 version',
    alternativeVersion: 'challenge121211 alternativeVersion',
    accessibility1: Challenge.ACCESSIBILITY1.OK,
    accessibility2: Challenge.ACCESSIBILITY2.RAS,
    spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
    responsive: ['Smartphone', 'Tablet'],
    area: 'challenge121211 area',
    focusable: 'challenge121211 focusable',
    delta: 1.1,
    alpha: 2.2,
    updatedAt: 'challenge121211 updatedAt',
    shuffled: false,
  };
  const airtableChallenge121211 = airtableBuilder.factory.buildChallenge(challenge121211);
  const challenge121212 = {
    id: 'challenge121212',
    type: ChallengeForRelease.TYPES.QCU,
    t1Status: 'challenge121212 t1Status',
    t2Status: 'challenge121212 t2Status',
    t3Status: 'challenge121212 t3Status',
    status: ChallengeForRelease.STATUSES.VALIDE,
    skillId: 'skill12121',
    embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge121212.html?lang=fr&mode=a#123456',
    embedTitle: 'challenge121212 embedTitle',
    embedHeight: 'challenge121212 embedHeight',
    timer: 10,
    competenceId: 'competence12',
    format: 'challenge121212 format',
    autoReply: 'challenge121212 autoReply',
    locales: ['en'],
    airtableId: 'challenge121212',
    skills: 'challenge121212 skills',
    genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
    pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
    author: 'challenge121212 author',
    declinable: Challenge.DECLINABLES.FACILEMENT,
    preview: 'challenge121212 preview',
    version: 'challenge121212 version',
    alternativeVersion: 'challenge121212 alternativeVersion',
    accessibility1: Challenge.ACCESSIBILITY1.KO,
    accessibility2: Challenge.ACCESSIBILITY2.OK,
    spoil: Challenge.SPOILS.DIFFICILEMENT_SPOILABLE,
    responsive: ['Smartphone'],
    area: 'challenge121212 area',
    focusable: 'challenge121212 focusable',
    delta: 123,
    alpha: 456,
    updatedAt: 'challenge121212 updatedAt',
    shuffled: true,
  };
  const airtableChallenge121212 = airtableBuilder.factory.buildChallenge(challenge121212);
  const challenge211111 = {
    id: 'challenge211111',
    type: ChallengeForRelease.TYPES.QCM,
    t1Status: 'challenge211111 t1Status',
    t2Status: 'challenge211111 t2Status',
    t3Status: 'challenge211111 t3Status',
    status: ChallengeForRelease.STATUSES.VALIDE,
    skillId: 'skill21111',
    embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge211111.html?lang=fr&mode=a#123456',
    embedTitle: 'challenge211111 embedTitle',
    embedHeight: 'challenge211111 embedHeight',
    timer: 60,
    competenceId: 'competence21',
    format: 'challenge211111 format',
    files: [{ fileId: 'attachment3', localizedChallengeId: 'challenge211111' }],
    autoReply: 'challenge211111 autoReply',
    locales: ['fr', 'fr-fr'],
    airtableId: 'challenge211111',
    skills: 'challenge211111 skills',
    genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
    pedagogy: Challenge.PEDAGOGIES.E_PREUVE,
    author: 'challenge211111 author',
    declinable: Challenge.DECLINABLES.DIFFICILEMENT,
    preview: 'challenge211111 preview',
    version: 'challenge211111 version',
    alternativeVersion: 'challenge211111 alternativeVersion',
    accessibility1: Challenge.ACCESSIBILITY1.RAS,
    accessibility2: Challenge.ACCESSIBILITY2.KO,
    spoil: Challenge.SPOILS.NON_SPOILABLE,
    responsive: ['Tablet'],
    area: 'challenge211111 area',
    focusable: 'challenge211111 focusable',
    delta: 100,
    alpha: 200,
    updatedAt: 'challenge211111 updatedAt',
    shuffled: false,
  };
  const airtableChallenge211111 = airtableBuilder.factory.buildChallenge(challenge211111);
  const challenge211112 = {
    id: 'challenge211112',
    type: ChallengeForRelease.TYPES.QROCM_DEP,
    t1Status: 'challenge211112 t1Status',
    t2Status: 'challenge211112 t2Status',
    t3Status: 'challenge211112 t3Status',
    status: ChallengeForRelease.STATUSES.ARCHIVE,
    skillId: 'skill21111',
    embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge211112.html?lang=fr&mode=a#123456',
    embedTitle: 'challenge211112 embedTitle',
    embedHeight: 'challenge211112 embedHeight',
    timer: 60,
    competenceId: 'competence21',
    format: 'challenge211112 format',
    autoReply: 'challenge211112 autoReply',
    locales: ['fr'],
    airtableId: 'challenge211112',
    skills: 'challenge211112 skills',
    genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
    pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
    author: 'challenge211112 author',
    declinable: Challenge.DECLINABLES.NONE,
    preview: 'challenge211112 preview',
    version: 'challenge211112 version',
    alternativeVersion: 'challenge211112 alternativeVersion',
    accessibility1: Challenge.ACCESSIBILITY1.RAS,
    accessibility2: Challenge.ACCESSIBILITY2.RAS,
    spoil: Challenge.SPOILS.NONE,
    responsive: ['Smartphone'],
    area: 'challenge211112 area',
    focusable: 'challenge211112 focusable',
    delta: 100,
    alpha: 200,
    updatedAt: 'challenge211112 updatedAt',
    shuffled: false,
  };
  const airtableChallenge211112 = airtableBuilder.factory.buildChallenge(challenge211112);
  const challenge211113 = {
    id: 'challenge211113',
    type: ChallengeForRelease.TYPES.QROCM,
    t1Status: 'challenge211113 t1Status',
    t2Status: 'challenge211113 t2Status',
    t3Status: 'challenge211113 t3Status',
    status: ChallengeForRelease.STATUSES.VALIDE,
    skillId: 'skill21111',
    embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge211113.html?lang=fr&mode=a#123456',
    embedTitle: 'challenge211113 embedTitle',
    embedHeight: 'challenge211113 embedHeight',
    timer: 60,
    competenceId: 'competence21',
    format: 'challenge211113 format',
    autoReply: 'challenge211113 autoReply',
    locales: ['fr'],
    airtableId: 'challenge211113',
    skills: 'challenge211113 skills',
    genealogy: ChallengeForRelease.GENEALOGIES.DECLINAISON,
    pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
    author: 'challenge211113 author',
    declinable: Challenge.DECLINABLES.NON,
    preview: 'challenge211113 preview',
    version: 'challenge211113 version',
    alternativeVersion: 'challenge211113 alternativeVersion',
    accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
    accessibility2: Challenge.ACCESSIBILITY2.OK,
    spoil: Challenge.SPOILS.NON_SPOILABLE,
    responsive: ['Smartphone'],
    area: 'challenge211113 area',
    focusable: 'challenge211113 focusable',
    delta: 100,
    alpha: 200,
    updatedAt: 'challenge211113 updatedAt',
    shuffled: false,
  };
  const airtableChallenge211113 = airtableBuilder.factory.buildChallenge(challenge211113);
  const airtableTutorial1 = airtableBuilder.factory.buildTutorial({
    id: 'tutorial1',
    title: 'tutorial1 title',
    format: 'tutorial1 format',
    duration: 'tutorial1 duration',
    source: 'tutorial1 source',
    link: 'tutorial1 link',
    locale: 'fr',
    tutorialForSkills: 'tutorial1 tutorialForSkills',
    furtherInformation: 'tutorial1 furtherInformation',
  });
  const airtableTutorial2 = airtableBuilder.factory.buildTutorial({
    id: 'tutorial2',
    title: 'tutorial2 title',
    format: 'tutorial2 format',
    duration: 'tutorial2 duration',
    source: 'tutorial2 source',
    link: 'tutorial2 link',
    locale: 'fr-fr',
    tutorialForSkills: 'tutorial2 tutorialForSkills',
    furtherInformation: 'tutorial2 furtherInformation',
  });
  const airtableAttachment1 = airtableBuilder.factory.buildAttachment({
    id: 'attachment1',
    type: 'attachment',
    url: 'attachment1 url',
    challengeId: 'challenge121211',
  });
  const airtableAttachment2 = airtableBuilder.factory.buildAttachment({
    id: 'attachment2',
    type: 'attachment',
    url: 'attachment2 url',
    challengeId: 'challenge121211',
  });
  const airtableAttachment3 = airtableBuilder.factory.buildAttachment({
    id: 'attachment3',
    type: 'attachment',
    url: 'attachment3 url',
    challengeId: 'challenge211111',
  });
  const airtableAttachment4 = airtableBuilder.factory.buildAttachment({
    id: 'attachment4',
    type: 'attachment',
    url: 'attachment4 url',
    challengeId: 'challenge121211',
    localizedChallengeId: 'challengeNl',
  });

  airtableBuilder.mockLists({
    frameworks: [airtableFrameworkA],
    areas: [airtableArea1, airtableArea2],
    competences: [airtableCompetence11, airtableCompetence12, airtableCompetence21],
    thematics: [airtableThematic111, airtableThematic112, airtableThematic121, airtableThematic211],
    tubes: [airtableTube1111, airtableTube1121, airtableTube1211, airtableTube1212, airtableTube2111],
    skills: [airtableSkill11111, airtableSkill11112, airtableSkill12121, airtableSkill21111],
    challenges: [airtableChallenge121211, airtableChallenge121212, airtableChallenge211111, airtableChallenge211112, airtableChallenge211113],
    tutorials: [airtableTutorial1, airtableTutorial2],
    attachments: [airtableAttachment1, airtableAttachment2, airtableAttachment3, airtableAttachment4],
  });

  return {
    areas: [area1, area2],
    competences: [competence11, competence12, competence21],
    thematics: [thematic111, thematic112, thematic121, thematic211],
    tubeIds:  [airtableTube1111.id, airtableTube1121.id, airtableTube1211.id, airtableTube1212.id, airtableTube2111.id],
    skills: [skill11111, skill11112, skill12121, skill21111],
    challenges: [challenge121211, challenge121212, challenge211111, challenge211112, challenge211113],
  };
}

function _getRichCurrentContentDTO() {
  const expectedFrameworkDTOs = [
    {
      id: 'frameworkA',
      name: 'FrameworkA',
    },
  ];
  const expectedAreaDTOs = [{
    id: 'area1',
    competenceIds: [
      'competence11',
      'competence12',
    ],
    competenceAirtableIds: [
      'competence11',
      'competence12',
    ],
    title_i18n: {
      fr: 'area1 titleFrFr',
      en: 'area1 titleEnUs',
    },
    code: '1',
    name: '1. area1 titleFrFr',
    color: Area.COLORS.JAFFA,
    frameworkId: 'frameworkA',
  }, {
    id: 'area2',
    competenceIds: [
      'competence21',
    ],
    competenceAirtableIds: [
      'competence21',
    ],
    title_i18n: {
      fr: 'area2 titleFrFr',
      en: 'area2 titleEnUs',
    },
    code: '2',
    name: '2. area2 titleFrFr',
    color: Area.COLORS.EMERALD,
    frameworkId: 'frameworkA',
  }];
  const expectedCompetenceDTOs = [
    {
      id: 'competence11',
      index: 'competence11 index',
      name_i18n: {
        fr: 'competence11 nameFrFr',
        en: 'competence11 nameEnUs',
      },
      description_i18n: {
        fr: 'competence11 descriptionFrFr',
        en: 'competence11 descriptionEnUs',
      },
      areaId: 'area1',
      skillIds: [
        'skill11111',
        'skill11112',
      ],
      thematicIds: [
        'thematic111',
        'thematic112',
      ],
      origin: 'FrameworkA',
    },
    {
      id: 'competence12',
      index: 'competence12 index',
      name_i18n: {
        fr: 'competence12 nameFrFr',
        en: 'competence12 nameEnUs',
      },
      description_i18n: {
        fr: 'competence12 descriptionFrFr',
        en: 'competence12 descriptionEnUs',
      },
      areaId: 'area1',
      skillIds: [
        'skill12121',
      ],
      thematicIds: [
        'thematic121',
      ],
      origin: 'FrameworkA',
    },
    {
      id: 'competence21',
      index: 'competence21 index',
      name_i18n: {
        fr: 'competence21 nameFrFr',
        en: 'competence21 nameEnUs',
      },
      description_i18n: {
        fr: 'competence21 descriptionFrFr',
        en: 'competence21 descriptionEnUs',
      },
      areaId: 'area2',
      skillIds: [
        'skill21111',
      ],
      thematicIds: [
        'thematic211',
      ],
      origin: 'FrameworkA',
    },
  ];
  const expectedThematicDTOs = [
    {
      id: 'thematic111',
      name_i18n: {
        fr: 'thematic111 nameFrFr',
        en: 'thematic111 nameEnUs',
      },
      competenceId: 'competence11',
      tubeIds: [
        'tube1111',
      ],
      index: 'thematic111 index',
    },
    {
      id: 'thematic112',
      name_i18n: {
        fr: 'thematic112 nameFrFr',
        en: 'thematic112 nameEnUs',
      },
      competenceId: 'competence11',
      tubeIds: [
        'tube1121',
      ],
      index: 'thematic112 index',
    },
    {
      id: 'thematic121',
      name_i18n: {
        fr: 'thematic121 nameFrFr',
        en: 'thematic121 nameEnUs',
      },
      competenceId: 'competence12',
      tubeIds: [
        'tube1211',
        'tube1212',
      ],
      index: 'thematic121 index',
    },
    {
      id: 'thematic211',
      name_i18n: {
        fr: 'thematic211 nameFrFr',
        en: 'thematic211 nameEnUs',
      },
      competenceId: 'competence21',
      tubeIds: [
        'tube2111',
      ],
      index: 'thematic211 index',
    },
  ];
  const expectedTubeDTOs = [
    {
      id: 'tube1111',
      name: 'tube1111 name',
      practicalTitle_i18n: {
        fr: 'tube1111 practicalTitleFrFr from PG',
        en: 'tube1111 practicalTitleEnUs from PG',
      },
      practicalDescription_i18n: {
        fr: 'tube1111 practicalDescriptionFrFr from PG',
        en: 'tube1111 practicalDescriptionEnUs from PG',
      },
      competenceId: 'competence11',
      isMobileCompliant: false,
      isTabletCompliant: false,
      thematicId: 'thematic111',
      skillIds: ['skill11111', 'skill11112'],
    },
    {
      id: 'tube1121',
      name: 'tube1121 name',
      practicalTitle_i18n: {
        fr: 'tube1121 practicalTitleFrFr from PG',
        en: 'tube1121 practicalTitleEnUs from PG',
      },
      practicalDescription_i18n: {
        fr: 'tube1121 practicalDescriptionFrFr from PG',
        en: 'tube1121 practicalDescriptionEnUs from PG',
      },
      competenceId: 'competence11',
      isMobileCompliant: false,
      isTabletCompliant: false,
      thematicId: 'thematic112',
      skillIds: [],
    },
    {
      id: 'tube1211',
      name: 'tube1211 name',
      practicalTitle_i18n: {
        fr: 'tube1211 practicalTitleFrFr from PG',
        en: 'tube1211 practicalTitleEnUs from PG',
      },
      practicalDescription_i18n: {
        fr: 'tube1211 practicalDescriptionFrFr from PG',
        en: 'tube1211 practicalDescriptionEnUs from PG',
      },
      competenceId: 'competence12',
      isMobileCompliant: false,
      isTabletCompliant: false,
      thematicId: 'thematic121',
      skillIds: [],
    },
    {
      id: 'tube1212',
      name: 'tube1212 name',
      practicalTitle_i18n: {
        fr: 'tube1212 practicalTitleFrFr from PG',
        en: 'tube1212 practicalTitleEnUs from PG',
      },
      practicalDescription_i18n: {
        fr: 'tube1212 practicalDescriptionFrFr from PG',
        en: 'tube1212 practicalDescriptionEnUs from PG',
      },
      competenceId: 'competence12',
      isMobileCompliant: true,
      isTabletCompliant: false,
      thematicId: 'thematic121',
      skillIds: ['skill12121'],
    },
    {
      id: 'tube2111',
      name: 'tube2111 name',
      practicalTitle_i18n: {
        fr: 'tube2111 practicalTitleFrFr from PG',
        en: 'tube2111 practicalTitleEnUs from PG',
      },
      practicalDescription_i18n: {
        fr: 'tube2111 practicalDescriptionFrFr from PG',
        en: 'tube2111 practicalDescriptionEnUs from PG',
      },
      competenceId: 'competence21',
      isMobileCompliant: false,
      isTabletCompliant: true,
      thematicId: 'thematic211',
      skillIds: ['skill21111'],
    },
  ];
  const expectedSkillDTOs = [
    {
      id: 'skill11111',
      name: 'skill11111 name',
      hint_i18n: {
        fr: 'skill11111 hintFrFr',
        en: 'skill11111 hintEnUs',
      },
      hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
      tutorialIds: ['tutorial2'],
      learningMoreTutorialIds: ['tutorial1'],
      pixValue: 1,
      competenceId: 'competence11',
      status: SkillForRelease.STATUSES.ACTIF,
      tubeId: 'tube1111',
      level: 4,
      version: 'skill11111 version',
    },
    {
      id: 'skill11112',
      name: 'skill11112 name',
      hint_i18n: {
        fr: 'skill11112 hintFrFr',
        en: 'skill11112 hintEnUs',
      },
      hintStatus: SkillForRelease.HINT_STATUSES.VALIDE,
      learningMoreTutorialIds: [],
      tutorialIds: [],
      pixValue: 2,
      competenceId: 'competence11',
      tubeId: 'tube1111',
      status: SkillForRelease.STATUSES.ACTIF,
      level: 3,
      version: 'skill11112 version',
    },
    {
      id: 'skill12121',
      name: 'skill12121 name',
      hint_i18n: {
        fr: 'skill12121 hintFrFr',
        en: 'skill12121 hintEnUs',
      },
      hintStatus: SkillForRelease.HINT_STATUSES.PRE_VALIDE,
      tutorialIds: [],
      learningMoreTutorialIds: [],
      pixValue: 3,
      competenceId: 'competence12',
      tubeId: 'tube1212',
      status: SkillForRelease.STATUSES.ACTIF,
      level: 2,
      version: 'skill12121 version',
    },
    {
      id: 'skill21111',
      name: 'skill21111 name',
      hint_i18n: {
        fr: 'skill21111 hintFrFr',
        en: 'skill21111 hintEnUs',
      },
      hintStatus: SkillForRelease.HINT_STATUSES.A_SOUMETTRE,
      tutorialIds: [],
      learningMoreTutorialIds: [],
      pixValue: 4,
      competenceId: 'competence21',
      tubeId: 'tube2111',
      status: SkillForRelease.STATUSES.ACTIF,
      level: 1,
      version: 'skill21111 version',
    },
  ];
  const expectedChallengeDTOs = [
    {
      id: 'challenge121211',
      instruction: 'challenge121211 instruction fr-fr',
      proposals: 'challenge121211 proposals fr-fr',
      type: ChallengeForRelease.TYPES.QCM,
      solution: 'challenge121211 solution fr-fr',
      solutionToDisplay: 'challenge121211 solutionToDisplay fr-fr',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: ChallengeForRelease.STATUSES.VALIDE,
      skillId: 'skill12121',
      embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge121211.html?lang=fr&mode=a#123456',
      embedTitle: 'challenge121211 embedTitle fr-fr',
      embedHeight: 'challenge121211 embedHeight',
      timer: 1,
      competenceId: 'competence12',
      format: 'challenge121211 format',
      autoReply: true,
      locales: ['fr-fr'],
      alternativeInstruction: 'challenge121211 alternativeInstruction fr-fr',
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
      responsive: ['Smartphone', 'Tablet'],
      focusable: 'challenge121211 focusable',
      delta: 1.1,
      alpha: 2.2,
      attachments: ['attachment1 url', 'attachment2 url'],
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: false,
      alternativeVersion: 'challenge121211 alternativeVersion',
    },
    {
      id: 'challengeNl',
      instruction: 'challenge121211 instruction nl-be',
      proposals: 'challenge121211 proposals nl-be',
      type: ChallengeForRelease.TYPES.QCM,
      solution: 'challenge121211 solution nl-be',
      solutionToDisplay: 'challenge121211 solutionToDisplay nl-be',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: ChallengeForRelease.STATUSES.VALIDE,
      skillId: 'skill12121',
      embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge121211.html?lang=nl-be&mode=a#123456',
      embedTitle: 'challenge121211 embedTitle nl-be',
      embedHeight: 'challenge121211 embedHeight',
      timer: 1,
      competenceId: 'competence12',
      format: 'challenge121211 format',
      autoReply: true,
      locales: ['nl-be'],
      alternativeInstruction: 'challenge121211 alternativeInstruction nl-be',
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
      responsive: ['Smartphone', 'Tablet'],
      focusable: 'challenge121211 focusable',
      delta: 1.1,
      alpha: 2.2,
      attachments: ['attachment4 url'],
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: false,
      alternativeVersion: 'challenge121211 alternativeVersion',
    },
    {
      id: 'challenge121212',
      instruction: 'challenge121212 instruction en',
      proposals: 'challenge121212 proposals en',
      type: ChallengeForRelease.TYPES.QCU,
      solution: 'challenge121212 solution en',
      solutionToDisplay: 'challenge121212 solutionToDisplay en',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: ChallengeForRelease.STATUSES.VALIDE,
      skillId: 'skill12121',
      embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge121212.html?lang=fr&mode=a#123456',
      embedTitle: 'challenge121212 embedTitle en',
      embedHeight: 'challenge121212 embedHeight',
      timer: 10,
      competenceId: 'competence12',
      format: 'challenge121212 format',
      autoReply: true,
      locales: ['en'],
      alternativeInstruction: 'challenge121212 alternativeInstruction en',
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
      responsive: ['Smartphone'],
      focusable: 'challenge121212 focusable',
      delta: 123,
      alpha: 456,
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: true,
      alternativeVersion: 'challenge121212 alternativeVersion',
    },
    {
      id: 'challenge211111',
      instruction: 'challenge211111 instruction fr',
      proposals: 'challenge211111 proposals fr',
      type: ChallengeForRelease.TYPES.QCM,
      solution: 'challenge211111 solution fr',
      solutionToDisplay: 'challenge211111 solutionToDisplay fr',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: ChallengeForRelease.STATUSES.VALIDE,
      skillId: 'skill21111',
      embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge211111.html?lang=fr&mode=a#123456',
      embedTitle: 'challenge211111 embedTitle fr',
      embedHeight: 'challenge211111 embedHeight',
      timer: 60,
      competenceId: 'competence21',
      format: 'challenge211111 format',
      autoReply: true,
      locales: ['fr', 'fr-fr'],
      alternativeInstruction: 'challenge211111 alternativeInstruction fr',
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
      responsive: ['Tablet'],
      focusable: 'challenge211111 focusable',
      delta: 100,
      alpha: 200,
      attachments: ['attachment3 url'],
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: false,
      alternativeVersion: 'challenge211111 alternativeVersion',
    },
    {
      id: 'challenge211112',
      instruction: 'challenge211112 instruction fr',
      proposals: 'challenge211112 proposals fr',
      type: ChallengeForRelease.TYPES.QROCM_DEP,
      solution: 'challenge211112 solution fr',
      solutionToDisplay: 'challenge211112 solutionToDisplay fr',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: ChallengeForRelease.STATUSES.ARCHIVE,
      skillId: 'skill21111',
      embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge211112.html?lang=fr&mode=a#123456',
      embedTitle: 'challenge211112 embedTitle fr',
      embedHeight: 'challenge211112 embedHeight',
      timer: 60,
      competenceId: 'competence21',
      format: 'challenge211112 format',
      autoReply: true,
      locales: ['fr'],
      alternativeInstruction: 'challenge211112 alternativeInstruction fr',
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
      responsive: ['Smartphone'],
      focusable: 'challenge211112 focusable',
      delta: 100,
      alpha: 200,
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: false,
      alternativeVersion: 'challenge211112 alternativeVersion',
    },
    {
      id: 'challenge211113',
      instruction: 'challenge211113 instruction fr',
      proposals: 'challenge211113 proposals fr',
      type: ChallengeForRelease.TYPES.QROCM,
      solution: 'challenge211113 solution fr',
      solutionToDisplay: 'challenge211113 solutionToDisplay fr',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: ChallengeForRelease.STATUSES.VALIDE,
      skillId: 'skill21111',
      embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge211113.html?lang=fr&mode=a#123456',
      embedTitle: 'challenge211113 embedTitle fr',
      embedHeight: 'challenge211113 embedHeight',
      timer: 60,
      competenceId: 'competence21',
      format: 'challenge211113 format',
      autoReply: true,
      locales: ['fr'],
      alternativeInstruction: 'challenge211113 alternativeInstruction fr',
      genealogy: ChallengeForRelease.GENEALOGIES.DECLINAISON,
      responsive: ['Smartphone'],
      focusable: 'challenge211113 focusable',
      delta: 100,
      alpha: 200,
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: false,
      alternativeVersion: 'challenge211113 alternativeVersion',
    },
  ];
  const expectedCourseDTOs = [
    {
      id: 'course1PG',
      name: 'course1PG name',
      description: 'course1PG description',
      isActive: false,
      challenges: ['challenge121212', 'challenge211113', 'challengeNl'],
    },
  ];
  const expectedTutorialDTOs = [
    {
      id: 'tutorial1',
      title: 'tutorial1 title',
      format: 'tutorial1 format',
      duration: 'tutorial1 duration',
      source: 'tutorial1 source',
      link: 'tutorial1 link',
      locale: 'fr',
    },
    {
      id: 'tutorial2',
      title: 'tutorial2 title',
      format: 'tutorial2 format',
      duration: 'tutorial2 duration',
      source: 'tutorial2 source',
      link: 'tutorial2 link',
      locale: 'fr-fr',
    },
  ];
  const expectedMissionsDTOs = [
    new Mission({
      id: 123456789,
      name_i18n : { fr: 'mission PG name' },
      competenceId: 'competenceId',
      thematicIds: 'thematicIds',
      learningObjectives_i18n: { fr: 'Que tu sois le meilleur' },
      validatedObjectives_i18n: { fr: 'Rien' },
      status: Mission.status.INACTIVE,
      createdAt: new Date('2010-01-04'),
    }),
  ];

  return {
    frameworks: expectedFrameworkDTOs,
    areas: expectedAreaDTOs,
    competences: expectedCompetenceDTOs,
    thematics: expectedThematicDTOs,
    tubes: expectedTubeDTOs,
    skills: expectedSkillDTOs,
    challenges: expectedChallengeDTOs,
    courses: expectedCourseDTOs,
    tutorials: expectedTutorialDTOs,
    missions: expectedMissionsDTOs,
  };
}
