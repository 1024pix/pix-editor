import { beforeEach, describe, describe as context, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import {
  create,
  getCurrentContent,
  getLatestRelease,
  getLatestReleaseDate,
  getRelease,
} from '../../../../lib/infrastructure/repositories/release-repository.js';
import { Area, Attachment, Challenge, LocalizedChallenge, Mission } from '../../../../lib/domain/models/index.js';
import {
  ChallengeForRelease,
  SkillForRelease,
  TutorialForRelease,
} from '../../../../lib/domain/models/release/index.js';

describe('Integration | Repository | release-repository', function() {
  describe('#create', function() {
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
        tutorials: [],
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
        tutorials: [],
      };
      const oldestReleaseContentDTO = { some: 'old-property' };
      databaseBuilder.factory.buildRelease({
        id: 1,
        createdAt: new Date('2021-02-02'),
        content: newestReleaseContentDTO,
      });
      databaseBuilder.factory.buildRelease({
        id: 2,
        createdAt: new Date('2020-01-01'),
        content: oldestReleaseContentDTO,
      });
      await databaseBuilder.commit();

      // When
      const latestRelease = await getLatestRelease();

      // Then
      const expectedContent = domainBuilder.buildContentForRelease(newestReleaseContentDTO);
      const expectedRelease = domainBuilder.buildDomainRelease({
        id: 1,
        createdAt: new Date('2021-02-02'),
        content: expectedContent,
      });
      expect(latestRelease).toEqualInstance(expectedRelease);
    });
  });

  describe('#getLatestReleaseDate', function() {
    it('should return the date of the latest release', async function() {
      // Given
      databaseBuilder.factory.buildRelease({
        createdAt: new Date('2022-01-01'),
        content: '{}',
      });
      const latestReleaseDate = databaseBuilder.factory.buildRelease({
        createdAt: new Date('2023-01-01'),
        content: '{}',
      }).createdAt;
      databaseBuilder.factory.buildRelease({
        createdAt: new Date('2021-01-01'),
        content: '{}',
      });
      await databaseBuilder.commit();

      // When
      const actualLatestReleaseDate = await getLatestReleaseDate();

      // Then
      expect(actualLatestReleaseDate).to.deep.equal(latestReleaseDate);
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
        tutorials: [],
      };

      databaseBuilder.factory.buildRelease({
        id: 11,
        createdAt: new Date('2021-01-01'),
        content: otherReleaseContentDTO,
      });
      databaseBuilder.factory.buildRelease({
        id: 12,
        createdAt: new Date('2020-01-01'),
        content: expectedReleaseContentDTO,
      });
      await databaseBuilder.commit();

      // When
      const givenRelease = await getRelease(12);

      // Then
      const expectedContent = domainBuilder.buildContentForRelease(expectedReleaseContentDTO);
      const expectedRelease = domainBuilder.buildDomainRelease({
        id: 12,
        createdAt: new Date('2020-01-01'),
        content: expectedContent,
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
          content: richCurrentContentDTO,
        });
        await databaseBuilder.commit();

        // When
        const givenRelease = await getRelease(1);

        // Then
        const expectedContent = domainBuilder.buildContentForRelease(richCurrentContentDTO);
        const expectedRelease = domainBuilder.buildDomainRelease({
          id: 1,
          createdAt: new Date('2021-01-01'),
          content: expectedContent,
        });
        expect(givenRelease).toEqualInstance(expectedRelease);
      });
    });
  });

  describe('#getCurrentContent', function() {
    let modules;

    beforeEach(function() {
      const { areas, competences, thematics, tubeIds, skills, challenges } = _mockRichAirtableContent();

      buildAreasTranslations(areas);
      buildCompetencesTranslations(competences);
      buildThematicsTranslations(thematics);
      buildTubesTranslations(tubeIds);
      buildSkillsTranslations(skills);
      buildChallengesTranslations(challenges);

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
        name: 'validated mission PG name',
        competenceId: 'competenceId',
        learningObjectives: 'Que tu sois le meilleur',
        thematicIds: 'thematicIds',
        validatedObjectives: 'Rien',
        status: Mission.status.VALIDATED,
        documentationUrl: 'http://url-example.net',
      });

      databaseBuilder.factory.buildMission({
        id: 987654321,
        name: 'inactive mission PG name',
        competenceId: 'competenceId',
        learningObjectives: 'Que tu sois le meilleur',
        thematicIds: 'thematicIds',
        validatedObjectives: 'Rien',
        status: Mission.status.INACTIVE,
      });

      const firstModule = domainBuilder.buildModule();
      const secondModule = domainBuilder.buildModule({
        shortId: 'secondar',
        internalTitle: 'secondar',
        title: 'Second Module',
      });
      modules = [firstModule, secondModule];

      databaseBuilder.factory.buildModule(firstModule);
      databaseBuilder.factory.buildModule(secondModule);

      return databaseBuilder.commit();
    });

    it('should return current content as DTO', async function() {
      // When
      const currentContentDTO = await getCurrentContent();

      // Then
      const data = { modules };
      const expectedReleaseContentDTO = _getRichCurrentContentDTO(data);
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

function buildChallengesTranslations(challenges) {
  for (const challenge of challenges) {
    buildChallengeTranslations(challenge, challenge.locales[0]);
  }

  buildChallengeTranslations(challenges[0], 'nl-be');
}

function buildChallengeTranslations(challenge, locale) {
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
}

function _mockRichAirtableContent() {
  databaseBuilder.factory.buildFramework({
    id: 'frameworkA',
    name: 'Pix',
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
  databaseBuilder.factory.buildArea(area1);
  const area2 = {
    id: 'area2',
    competenceIds: ['competence21'],
    competenceAirtableIds: ['competence21'],
    code: '2',
    name: 'area2 name',
    color: Area.COLORS.EMERALD,
    frameworkId: 'frameworkA',
  };
  databaseBuilder.factory.buildArea(area2);
  const competence11 = {
    id: 'competence11',
    index: 'competence11 index',
    areaId: 'area1',
    skillIds: ['skill11111', 'skill11112'],
    thematicIds: ['thematic111', 'thematic112'],
    tubeIds: ['tube1111', 'tube1121'],
    origin: 'Pix',
  };
  databaseBuilder.factory.buildCompetence(competence11);
  const competence12 = {
    id: 'competence12',
    index: 'competence12 index',
    areaId: 'area1',
    skillIds: ['skill12121'],
    thematicIds: ['thematic121'],
    tubeIds: ['tube1211', 'tube1212'],
    origin: 'Pix',
  };
  databaseBuilder.factory.buildCompetence(competence12);
  const competence21 = {
    id: 'competence21',
    index: 'competence21 index',
    areaId: 'area2',
    skillIds: ['skill21111'],
    thematicIds: ['thematic211'],
    tubeIds: ['tube2111'],
    origin: 'Pix',
  };
  databaseBuilder.factory.buildCompetence(competence21);
  const thematic111 = {
    id: 'thematic111',
    airtableId: 'recThematic111',
    name_i18n: {
      fr: 'thematic111 name',
      en: 'thematic111 nameEnUs',
    },
    competenceId: 'competence11',
    tubeIds: ['tube1111'],
    index: 111,
  };
  databaseBuilder.factory.buildThematic(thematic111);
  const thematic112 = {
    id: 'thematic112',
    airtableId: 'recThematic112',
    name_i18n: {
      fr: 'thematic112 name',
      en: 'thematic112 nameEnUs',
    },
    competenceId: 'competence11',
    tubeIds: ['tube1121'],
    index: 112,
  };
  databaseBuilder.factory.buildThematic(thematic112);
  const thematic121 = {
    id: 'thematic121',
    airtableId: 'recThematic121',
    name_i18n: {
      fr: 'thematic121 name',
      en: 'thematic121 nameEnUs',
    },
    competenceId: 'competence12',
    tubeIds: ['tube1211', 'tube1212'],
    index: 121,
  };
  databaseBuilder.factory.buildThematic(thematic121);
  const thematic211 = {
    id: 'thematic211',
    airtableId: 'recThematic211',
    name_i18n: {
      fr: 'thematic211 name',
      en: 'thematic211 nameEnUs',
    },
    competenceId: 'competence21',
    tubeIds: ['tube2111'],
    index: 211,
  };
  databaseBuilder.factory.buildThematic(thematic211);
  const tube1111 = {
    id: 'tube1111',
    name: '@tube1111',
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
    skillIds: ['skill11111', 'skill11112'],
    thematicAirtableId: 'recThematic111',
    thematicId: 'thematic111',
  };
  databaseBuilder.factory.buildTube(tube1111);
  const tube1121 = {
    id: 'tube1121',
    name: '@tube1121',
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
    skillIds: [],
    thematicAirtableId: 'recThematic112',
    thematicId: 'thematic112',
  };
  databaseBuilder.factory.buildTube(tube1121);
  const tube1211 = {
    id: 'tube1211',
    name: '@tube1211',
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
    skillIds: [],
    thematicAirtableId: 'recThematic121',
    thematicId: 'thematic121',
  };
  databaseBuilder.factory.buildTube(tube1211);
  const tube1212 = {
    id: 'tube1212',
    name: '@tube1212',
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
    skillIds: ['skill12121'],
    thematicAirtableId: 'recThematic121',
    thematicId: 'thematic121',
  };
  databaseBuilder.factory.buildTube(tube1212);
  const tube2111 = {
    id: 'tube2111',
    name: '@tube2111',
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
    skillIds: ['skill21111'],
    thematicId: 'thematic211',
  };
  databaseBuilder.factory.buildTube(tube2111);
  const tutorial1 = {
    id: 'tutorial1',
    title: 'tutorial1 title',
    format: TutorialForRelease.FORMATS.IMAGE,
    duration: 'tutorial1 duration',
    source: 'tutorial1 source',
    link: 'tutorial1 link',
    locale: 'fr',
  };
  databaseBuilder.factory.buildTutorial(tutorial1);
  const tutorial2 = {
    id: 'tutorial2',
    title: 'tutorial2 title',
    format: TutorialForRelease.FORMATS.VIDEO,
    duration: 'tutorial2 duration',
    source: 'tutorial2 source',
    link: 'tutorial2 link',
    locale: 'fr-fr',
  };
  databaseBuilder.factory.buildTutorial(tutorial2);
  const skill11111 = {
    id: 'skill11111',
    name: '@tube11114',
    hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
    tutorialIds: ['tutorial2'],
    learningMoreTutorialIds: ['tutorial1'],
    pixValue: 4,
    competenceId: 'competence11',
    status: SkillForRelease.STATUSES.ACTIF,
    tubeId: 'tube1111',
    description: 'skill11111 description',
    level: 4,
    internationalisation: SkillForRelease.INTERNATIONALISATIONS.MONDE,
    version: 11111,
  };
  databaseBuilder.factory.buildSkill(skill11111);
  const skill11112 = {
    id: 'skill11112',
    name: '@tube11113',
    hintStatus: SkillForRelease.HINT_STATUSES.VALIDE,
    tutorialIds: [],
    learningMoreTutorialIds: [],
    pixValue: 4,
    competenceId: 'competence11',
    status: SkillForRelease.STATUSES.ACTIF,
    tubeId: 'tube1111',
    description: 'skill11112 description',
    level: 3,
    internationalisation: SkillForRelease.INTERNATIONALISATIONS.FRANCE,
    version: 11112,
  };
  databaseBuilder.factory.buildSkill(skill11112);
  const skill12121 = {
    id: 'skill12121',
    name: '@tube12122',
    hintStatus: SkillForRelease.HINT_STATUSES.PRE_VALIDE,
    tutorialIds: [],
    learningMoreTutorialIds: [],
    pixValue: 4,
    competenceId: 'competence12',
    status: SkillForRelease.STATUSES.ACTIF,
    tubeId: 'tube1212',
    description: 'skill12121 description',
    level: 2,
    internationalisation: SkillForRelease.INTERNATIONALISATIONS.UNION_EUROPEENNE,
    version: 12121,
    challengeIds: ['challenge121211', 'challenge121212'],
  };
  databaseBuilder.factory.buildSkill(skill12121);
  const skill21111 = {
    id: 'skill21111',
    name: '@tube21111',
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
    version: 21111,
    challengeIds: [
      'challenge211111',
      'challenge211112',
      'challenge211113',
    ],
  };
  databaseBuilder.factory.buildSkill(skill21111);
  const challenge121211 = {
    id: 'challenge121211',
    type: ChallengeForRelease.TYPES.QCM,
    t1Status: true,
    t2Status: true,
    t3Status: true,
    status: ChallengeForRelease.STATUSES.VALIDE,
    skillId: 'skill12121',
    embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge121211.html?lang=fr&mode=a#123456',
    embedTitle: 'challenge121211 embedTitle',
    embedHeight: 123,
    timer: 1,
    competenceId: 'competence12',
    format: ChallengeForRelease.FORMATS.MOTS,
    files: [
      { fileId: 'attachment1', localizedChallengeId: 'challenge121211' },
      { fileId: 'attachment2', localizedChallengeId: 'challenge121211' },
      { fileId: 'attachment4', localizedChallengeId: 'challengeNl' },
    ],
    autoReply: false,
    locales: ['fr-fr'],
    airtableId: 'challenge121211',
    skills: 'challenge121211 skills',
    genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
    pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
    author: ['TRI'],
    declinable: Challenge.DECLINABLES.NON,
    preview: 'challenge121211 preview',
    version: 1,
    alternativeVersion: 1,
    accessibility1: Challenge.ACCESSIBILITY1.OK,
    accessibility2: Challenge.ACCESSIBILITY2.RAS,
    spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
    responsive: ChallengeForRelease.RESPONSIVES.TABLETTE_ET_SMARTPHONE,
    area: 'challenge121211 area',
    focusable: false,
    updatedAt: new Date(),
    shuffled: false,
    contextualizedFields: [],
  };
  databaseBuilder.factory.buildChallenge(challenge121211);

  databaseBuilder.factory.buildLocalizedChallenge({
    id: challenge121211.id,
    challengeId: challenge121211.id,
    locale: challenge121211.locales[0],
    embedUrl: challenge121211.embedUrl,
    status: LocalizedChallenge.STATUSES.PLAY,
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
    isAwarenessChallenge: true,
    toRephrase: true,
  });
  databaseBuilder.factory.buildLocalizedChallenge({
    id: 'challengeNl',
    challengeId: challenge121211.id,
    locale: 'nl-be',
    embedUrl: null,
    status: LocalizedChallenge.STATUSES.PLAY,
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
    isAwarenessChallenge: false,
    toRephrase: false,
  });

  const challenge121212 = {
    id: 'challenge121212',
    type: ChallengeForRelease.TYPES.QCU,
    t1Status: true,
    t2Status: true,
    t3Status: true,
    status: ChallengeForRelease.STATUSES.VALIDE,
    skillId: 'skill12121',
    embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge121212.html?lang=fr&mode=a#123456',
    embedTitle: 'challenge121212 embedTitle',
    embedHeight: 123,
    timer: 10,
    competenceId: 'competence12',
    format: ChallengeForRelease.FORMATS.PHRASE,
    autoReply: true,
    locales: ['en'],
    airtableId: 'challenge121212',
    skills: 'challenge121212 skills',
    genealogy: ChallengeForRelease.GENEALOGIES.DECLINAISON,
    pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
    author: ['TRI'],
    declinable: Challenge.DECLINABLES.FACILEMENT,
    preview: 'challenge121212 preview',
    version: 0,
    alternativeVersion: 1,
    accessibility1: Challenge.ACCESSIBILITY1.KO,
    accessibility2: Challenge.ACCESSIBILITY2.OK,
    spoil: Challenge.SPOILS.DIFFICILEMENT_SPOILABLE,
    responsive: ChallengeForRelease.RESPONSIVES.SMARTPHONE,
    area: 'challenge121212 area',
    focusable: false,
    updatedAt: new Date(),
    shuffled: true,
    contextualizedFields: [],
  };
  databaseBuilder.factory.buildChallenge(challenge121212);

  databaseBuilder.factory.buildLocalizedChallenge({
    id: challenge121212.id,
    challengeId: challenge121212.id,
    locale: challenge121212.locales[0],
    embedUrl: challenge121212.embedUrl,
    status: LocalizedChallenge.STATUSES.PLAY,
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
    isAwarenessChallenge: true,
    toRephrase: true,
  });

  const challenge211111 = {
    id: 'challenge211111',
    type: ChallengeForRelease.TYPES.QCM,
    t1Status: true,
    t2Status: true,
    t3Status: true,
    status: ChallengeForRelease.STATUSES.VALIDE,
    skillId: 'skill21111',
    embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge211111.html?lang=fr&mode=a#123456',
    embedTitle: 'challenge211111 embedTitle',
    embedHeight: 123,
    timer: 60,
    competenceId: 'competence21',
    format: ChallengeForRelease.FORMATS.PARAGRAPHE,
    files: [{ fileId: 'attachment3', localizedChallengeId: 'challenge211111' }],
    autoReply: true,
    locales: ['fr', 'fr-fr'],
    airtableId: 'challenge211111',
    skills: 'challenge211111 skills',
    genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
    pedagogy: Challenge.PEDAGOGIES.E_PREUVE,
    author: ['TRI'],
    declinable: Challenge.DECLINABLES.DIFFICILEMENT,
    preview: 'challenge211111 preview',
    version: 0,
    alternativeVersion: 1,
    accessibility1: Challenge.ACCESSIBILITY1.RAS,
    accessibility2: Challenge.ACCESSIBILITY2.KO,
    spoil: Challenge.SPOILS.NON_SPOILABLE,
    responsive: ChallengeForRelease.RESPONSIVES.TABLETTE,
    area: 'challenge211111 area',
    focusable: false,
    updatedAt: new Date(),
    shuffled: false,
    contextualizedFields: [],
  };
  databaseBuilder.factory.buildChallenge(challenge211111);

  databaseBuilder.factory.buildLocalizedChallenge({
    id: challenge211111.id,
    challengeId: challenge211111.id,
    locale: challenge211111.locales[0],
    embedUrl: challenge211111.embedUrl,
    status: LocalizedChallenge.STATUSES.PLAY,
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
    isAwarenessChallenge: true,
    toRephrase: true,
  });

  const challenge211112 = {
    id: 'challenge211112',
    type: ChallengeForRelease.TYPES.QROCM_DEP,
    t1Status: true,
    t2Status: true,
    t3Status: true,
    status: ChallengeForRelease.STATUSES.ARCHIVE,
    skillId: 'skill21111',
    embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge211112.html?lang=fr&mode=a#123456',
    embedTitle: 'challenge211112 embedTitle',
    embedHeight: 123,
    timer: 60,
    competenceId: 'competence21',
    format: ChallengeForRelease.FORMATS.DATE,
    autoReply: false,
    locales: ['fr'],
    airtableId: 'challenge211112',
    skills: 'challenge211112 skills',
    genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
    pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
    author: ['TRI'],
    declinable: Challenge.DECLINABLES.NONE,
    preview: 'challenge211112 preview',
    version: 1,
    alternativeVersion: 1,
    accessibility1: Challenge.ACCESSIBILITY1.RAS,
    accessibility2: Challenge.ACCESSIBILITY2.RAS,
    spoil: Challenge.SPOILS.NONE,
    responsive: ChallengeForRelease.RESPONSIVES.SMARTPHONE,
    area: 'challenge211112 area',
    focusable: false,
    updatedAt: new Date(),
    shuffled: false,
    contextualizedFields: [],
  };
  databaseBuilder.factory.buildChallenge(challenge211112);

  databaseBuilder.factory.buildLocalizedChallenge({
    id: challenge211112.id,
    challengeId: challenge211112.id,
    locale: challenge211112.locales[0],
    embedUrl: challenge211112.embedUrl,
    status: LocalizedChallenge.STATUSES.PLAY,
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
    isAwarenessChallenge: true,
    toRephrase: true,
  });

  const challenge211113 = {
    id: 'challenge211113',
    type: ChallengeForRelease.TYPES.QROCM,
    t1Status: true,
    t2Status: true,
    t3Status: true,
    status: ChallengeForRelease.STATUSES.VALIDE,
    skillId: 'skill21111',
    embedUrl: 'https://epreuves.pix.fr/mon-embed-challenge211113.html?lang=fr&mode=a#123456',
    embedTitle: 'challenge211113 embedTitle',
    embedHeight: 123,
    timer: 60,
    competenceId: 'competence21',
    format: ChallengeForRelease.FORMATS.NOMBRE,
    autoReply: false,
    locales: ['fr'],
    airtableId: 'challenge211113',
    skills: 'challenge211113 skills',
    genealogy: ChallengeForRelease.GENEALOGIES.DECLINAISON,
    pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
    author: ['TRI'],
    declinable: Challenge.DECLINABLES.NON,
    preview: 'challenge211113 preview',
    version: 1,
    alternativeVersion: 1,
    accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
    accessibility2: Challenge.ACCESSIBILITY2.OK,
    spoil: Challenge.SPOILS.NON_SPOILABLE,
    responsive: ChallengeForRelease.RESPONSIVES.SMARTPHONE,
    area: 'challenge211113 area',
    focusable: false,
    updatedAt: new Date(),
    shuffled: false,
    contextualizedFields: [],
  };
  databaseBuilder.factory.buildChallenge(challenge211113);

  databaseBuilder.factory.buildLocalizedChallenge({
    id: challenge211113.id,
    challengeId: challenge211113.id,
    locale: challenge211113.locales[0],
    embedUrl: challenge211113.embedUrl,
    status: LocalizedChallenge.STATUSES.PLAY,
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
    isAwarenessChallenge: true,
    toRephrase: true,
  });

  const attachment1 = domainBuilder.buildAttachmentDatasourceObject({
    id: 'attachment1',
    type: Attachment.TYPES.ATTACHMENT,
    url: 'attachment1 url',
    challengeId: 'challenge121211',
  });
  databaseBuilder.factory.buildAttachment(attachment1);
  const attachment2 = domainBuilder.buildAttachmentDatasourceObject({
    id: 'attachment2',
    type: Attachment.TYPES.ATTACHMENT,
    url: 'attachment2 url',
    challengeId: 'challenge121211',
  });
  databaseBuilder.factory.buildAttachment(attachment2);
  const attachment3 = domainBuilder.buildAttachmentDatasourceObject({
    id: 'attachment3',
    type: Attachment.TYPES.ATTACHMENT,
    url: 'attachment3 url',
    challengeId: 'challenge211111',
  });
  databaseBuilder.factory.buildAttachment(attachment3);
  const attachment4 = domainBuilder.buildAttachmentDatasourceObject({
    id: 'attachment4',
    type: Attachment.TYPES.ATTACHMENT,
    url: 'attachment4 url',
    challengeId: 'challenge121211',
    localizedChallengeId: 'challengeNl',
  });
  databaseBuilder.factory.buildAttachment(attachment4);

  return {
    areas: [area1, area2],
    competences: [
      competence11,
      competence12,
      competence21,
    ],
    thematics: [
      thematic111,
      thematic112,
      thematic121,
      thematic211,
    ],
    tubeIds: [
      tube1111.id,
      tube1121.id,
      tube1211.id,
      tube1212.id,
      tube2111.id,
    ],
    skills: [
      skill11111,
      skill11112,
      skill12121,
      skill21111,
    ],
    challenges: [
      challenge121211,
      challenge121212,
      challenge211111,
      challenge211112,
      challenge211113,
    ],
  };
}

function _getRichCurrentContentDTO({ modules } = { modules: [] }) {
  const expectedFrameworkDTOs = [
    {
      id: 'frameworkA',
      name: 'Pix',
    },
  ];
  const expectedAreaDTOs = [
    {
      id: 'area1',
      competenceIds: ['competence11', 'competence12'],
      title_i18n: {
        fr: 'area1 titleFrFr',
        en: 'area1 titleEnUs',
      },
      code: '1',
      name: '1. area1 titleFrFr',
      color: Area.COLORS.JAFFA,
      frameworkId: 'frameworkA',
    },
    {
      id: 'area2',
      competenceIds: ['competence21'],
      title_i18n: {
        fr: 'area2 titleFrFr',
        en: 'area2 titleEnUs',
      },
      code: '2',
      name: '2. area2 titleFrFr',
      color: Area.COLORS.EMERALD,
      frameworkId: 'frameworkA',
    },
  ];
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
      skillIds: ['skill11111', 'skill11112'],
      thematicIds: ['thematic111', 'thematic112'],
      origin: 'Pix',
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
      skillIds: ['skill12121'],
      thematicIds: ['thematic121'],
      origin: 'Pix',
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
      skillIds: ['skill21111'],
      thematicIds: ['thematic211'],
      origin: 'Pix',
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
      tubeIds: ['tube1111'],
      index: 111,
    },
    {
      id: 'thematic112',
      name_i18n: {
        fr: 'thematic112 nameFrFr',
        en: 'thematic112 nameEnUs',
      },
      competenceId: 'competence11',
      tubeIds: ['tube1121'],
      index: 112,
    },
    {
      id: 'thematic121',
      name_i18n: {
        fr: 'thematic121 nameFrFr',
        en: 'thematic121 nameEnUs',
      },
      competenceId: 'competence12',
      tubeIds: ['tube1211', 'tube1212'],
      index: 121,
    },
    {
      id: 'thematic211',
      name_i18n: {
        fr: 'thematic211 nameFrFr',
        en: 'thematic211 nameEnUs',
      },
      competenceId: 'competence21',
      tubeIds: ['tube2111'],
      index: 211,
    },
  ];
  const expectedTubeDTOs = [
    {
      id: 'tube1111',
      name: '@tube1111',
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
      name: '@tube1121',
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
      name: '@tube1211',
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
      name: '@tube1212',
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
      isTabletCompliant: true,
      thematicId: 'thematic121',
      skillIds: ['skill12121'],
    },
    {
      id: 'tube2111',
      name: '@tube2111',
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
      name: '@tube11114',
      hint_i18n: {
        fr: 'skill11111 hintFrFr',
        en: 'skill11111 hintEnUs',
      },
      hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
      tutorialIds: ['tutorial2'],
      learningMoreTutorialIds: ['tutorial1'],
      pixValue: 4,
      competenceId: 'competence11',
      status: SkillForRelease.STATUSES.ACTIF,
      tubeId: 'tube1111',
      level: 4,
      version: 11111,
    },
    {
      id: 'skill11112',
      name: '@tube11113',
      hint_i18n: {
        fr: 'skill11112 hintFrFr',
        en: 'skill11112 hintEnUs',
      },
      hintStatus: SkillForRelease.HINT_STATUSES.VALIDE,
      learningMoreTutorialIds: [],
      tutorialIds: [],
      pixValue: 4,
      competenceId: 'competence11',
      tubeId: 'tube1111',
      status: SkillForRelease.STATUSES.ACTIF,
      level: 3,
      version: 11112,
    },
    {
      id: 'skill12121',
      name: '@tube12122',
      hint_i18n: {
        fr: 'skill12121 hintFrFr',
        en: 'skill12121 hintEnUs',
      },
      hintStatus: SkillForRelease.HINT_STATUSES.PRE_VALIDE,
      tutorialIds: [],
      learningMoreTutorialIds: [],
      pixValue: 4,
      competenceId: 'competence12',
      tubeId: 'tube1212',
      status: SkillForRelease.STATUSES.ACTIF,
      level: 2,
      version: 12121,
    },
    {
      id: 'skill21111',
      name: '@tube21111',
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
      version: 21111,
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
      embedHeight: 123,
      timer: 1,
      competenceId: 'competence12',
      format: ChallengeForRelease.FORMATS.MOTS,
      autoReply: false,
      locales: ['fr-fr'],
      alternativeInstruction: 'challenge121211 alternativeInstruction fr-fr',
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
      responsive: ChallengeForRelease.RESPONSIVES.TABLETTE_ET_SMARTPHONE,
      focusable: false,
      attachments: ['attachment1 url', 'attachment2 url'],
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: false,
      alternativeVersion: 1,
      accessibility1: ChallengeForRelease.ACCESSIBILITY1.OK,
      accessibility2: ChallengeForRelease.ACCESSIBILITY2.RAS,
      requireGafamWebsiteAccess: true,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
      isAwarenessChallenge: true,
      toRephrase: true,
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
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
      embedHeight: 123,
      timer: 1,
      competenceId: 'competence12',
      format: ChallengeForRelease.FORMATS.MOTS,
      autoReply: false,
      locales: ['nl-be'],
      alternativeInstruction: 'challenge121211 alternativeInstruction nl-be',
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
      responsive: ChallengeForRelease.RESPONSIVES.TABLETTE_ET_SMARTPHONE,
      focusable: false,
      attachments: ['attachment4 url'],
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: false,
      alternativeVersion: 1,
      accessibility1: ChallengeForRelease.ACCESSIBILITY1.OK,
      accessibility2: ChallengeForRelease.ACCESSIBILITY2.RAS,
      requireGafamWebsiteAccess: true,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
      isAwarenessChallenge: true,
      toRephrase: true,
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
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
      embedHeight: 123,
      timer: 10,
      competenceId: 'competence12',
      format: ChallengeForRelease.FORMATS.PHRASE,
      autoReply: true,
      locales: ['en'],
      alternativeInstruction: 'challenge121212 alternativeInstruction en',
      genealogy: ChallengeForRelease.GENEALOGIES.DECLINAISON,
      responsive: ChallengeForRelease.RESPONSIVES.SMARTPHONE,
      focusable: false,
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: true,
      alternativeVersion: 1,
      accessibility1: ChallengeForRelease.ACCESSIBILITY1.KO,
      accessibility2: ChallengeForRelease.ACCESSIBILITY2.OK,
      requireGafamWebsiteAccess: false,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
      isAwarenessChallenge: true,
      toRephrase: true,
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
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
      embedHeight: 123,
      timer: 60,
      competenceId: 'competence21',
      format: ChallengeForRelease.FORMATS.PARAGRAPHE,
      autoReply: true,
      locales: ['fr', 'fr-fr'],
      alternativeInstruction: 'challenge211111 alternativeInstruction fr',
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
      responsive: ChallengeForRelease.RESPONSIVES.TABLETTE,
      focusable: false,
      attachments: ['attachment3 url'],
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: false,
      alternativeVersion: 1,
      accessibility1: ChallengeForRelease.ACCESSIBILITY1.RAS,
      accessibility2: ChallengeForRelease.ACCESSIBILITY2.KO,
      requireGafamWebsiteAccess: true,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
      isAwarenessChallenge: true,
      toRephrase: true,
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
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
      embedHeight: 123,
      timer: 60,
      competenceId: 'competence21',
      format: ChallengeForRelease.FORMATS.DATE,
      autoReply: false,
      locales: ['fr'],
      alternativeInstruction: 'challenge211112 alternativeInstruction fr',
      genealogy: ChallengeForRelease.GENEALOGIES.PROTOTYPE,
      responsive: ChallengeForRelease.RESPONSIVES.SMARTPHONE,
      focusable: false,
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: false,
      alternativeVersion: 1,
      accessibility1: ChallengeForRelease.ACCESSIBILITY1.RAS,
      accessibility2: ChallengeForRelease.ACCESSIBILITY2.RAS,
      requireGafamWebsiteAccess: true,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
      isAwarenessChallenge: true,
      toRephrase: true,
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
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
      embedHeight: 123,
      timer: 60,
      competenceId: 'competence21',
      format: ChallengeForRelease.FORMATS.NOMBRE,
      autoReply: false,
      locales: ['fr'],
      alternativeInstruction: 'challenge211113 alternativeInstruction fr',
      genealogy: ChallengeForRelease.GENEALOGIES.DECLINAISON,
      responsive: ChallengeForRelease.RESPONSIVES.SMARTPHONE,
      focusable: false,
      illustrationUrl: null,
      illustrationAlt: null,
      shuffled: false,
      alternativeVersion: 1,
      accessibility1: ChallengeForRelease.ACCESSIBILITY1.RAS,
      accessibility2: ChallengeForRelease.ACCESSIBILITY2.RAS,
      requireGafamWebsiteAccess: true,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
      isAwarenessChallenge: true,
      toRephrase: true,
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
    },
  ];
  const expectedCourseDTOs = [
    {
      id: 'course1PG',
      name: 'course1PG name',
      description: 'course1PG description',
      isActive: false,
      challenges: [
        'challenge121212',
        'challenge211113',
        'challengeNl',
      ],
    },
  ];
  const expectedTutorialDTOs = [
    {
      id: 'tutorial1',
      title: 'tutorial1 title',
      format: TutorialForRelease.FORMATS.IMAGE,
      duration: 'tutorial1 duration',
      source: 'tutorial1 source',
      link: 'tutorial1 link',
      locale: 'fr',
    },
    {
      id: 'tutorial2',
      title: 'tutorial2 title',
      format: TutorialForRelease.FORMATS.VIDEO,
      duration: 'tutorial2 duration',
      source: 'tutorial2 source',
      link: 'tutorial2 link',
      locale: 'fr-fr',
    },
  ];

  const expectedMissionsDTOs = [
    {
      id: 123456789,
      name_i18n: { fr: 'validated mission PG name' },
      competenceId: 'competenceId',
      thematicIds: 'thematicIds',
      learningObjectives_i18n: { fr: 'Que tu sois le meilleur' },
      validatedObjectives_i18n: { fr: 'Rien' },
      status: Mission.status.VALIDATED,
      createdAt: new Date('2010-01-04'),
      introductionMediaUrl: null,
      introductionMediaType: null,
      introductionMediaAlt_i18n: { fr: 'Message alternatif' },
      documentationUrl: 'http://url-example.net',
      cardImageUrl: null,
      content: {
        dareChallenges: [],
        steps: [],
      },
    },
    {
      id: 987654321,
      name_i18n: { fr: 'inactive mission PG name' },
      competenceId: 'competenceId',
      thematicIds: 'thematicIds',
      learningObjectives_i18n: { fr: 'Que tu sois le meilleur' },
      validatedObjectives_i18n: { fr: 'Rien' },
      status: Mission.status.INACTIVE,
      createdAt: new Date('2010-01-04'),
      introductionMediaUrl: null,
      introductionMediaType: null,
      introductionMediaAlt_i18n: { fr: 'Message alternatif' },
      documentationUrl: null,
      cardImageUrl: null,
      content: {
        dareChallenges: [],
        steps: [],
      },
    },
  ];
  const expectedModulesDTOs = modules;

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
    modules: expectedModulesDTOs,
  };
}
