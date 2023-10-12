import { afterEach, beforeEach, describe, describe as context, expect, it } from 'vitest';
import { databaseBuilder, knex, domainBuilder, airtableBuilder } from '../../../test-helper.js';
import {
  create,
  getLatestRelease,
  getRelease,
  getCurrentContent
} from '../../../../lib/infrastructure/repositories/release-repository.js';

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
      const { competences, challenges } = _mockRichAirtableContent();

      for (const competence of competences) {
        if (competence.name_i18n?.fr) {
          databaseBuilder.factory.buildTranslation({
            key: `competence.${competence.id}.name`,
            locale: 'fr',
            value: competence.name_i18n.fr,
          });
        }
        if (competence.name_i18n?.en) {
          databaseBuilder.factory.buildTranslation({
            key: `competence.${competence.id}.name`,
            locale: 'en',
            value: competence.name_i18n.en,
          });
        }
        if (competence.description_i18n?.fr) {
          databaseBuilder.factory.buildTranslation({
            key: `competence.${competence.id}.description`,
            locale: 'fr',
            value: competence.description_i18n.fr,
          });
        }
        if (competence.description_i18n?.en) {
          databaseBuilder.factory.buildTranslation({
            key: `competence.${competence.id}.description`,
            locale: 'en',
            value: competence.description_i18n.en,
          });
        }
      }

      for (const challenge of challenges) {
        const locales = Object.keys(challenge.translations);
        for (const locale of locales) {
          databaseBuilder.factory.buildTranslation({
            key: `challenge.${challenge.id}.instruction`,
            locale,
            value: challenge.translations[locale].instruction,
          });
          databaseBuilder.factory.buildTranslation({
            key: `challenge.${challenge.id}.alternativeInstruction`,
            locale,
            value: challenge.translations[locale].alternativeInstruction,
          });
          databaseBuilder.factory.buildTranslation({
            key: `challenge.${challenge.id}.proposals`,
            locale,
            value: challenge.translations[locale].proposals,
          });
          databaseBuilder.factory.buildTranslation({
            key: `challenge.${challenge.id}.solution`,
            locale,
            value: challenge.translations[locale].solution,
          });
          databaseBuilder.factory.buildTranslation({
            key: `challenge.${challenge.id}.solutionToDisplay`,
            locale,
            value: challenge.translations[locale].solutionToDisplay,
          });
        }
      }

      databaseBuilder.factory.buildStaticCourse({
        id: 'course1PG',
        name: 'course1PG name',
        description: 'course1PG description',
        isActive: false,
        challengeIds: 'challenge121212,challenge211113',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
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

function _mockRichAirtableContent() {
  const airtableFrameworkA = airtableBuilder.factory.buildFramework({
    id: 'frameworkA',
    name: 'FrameworkA',
  });
  const airtableArea1 = airtableBuilder.factory.buildArea({
    id: 'area1',
    competenceIds: ['competence11', 'competence12'],
    competenceAirtableIds: ['competence11', 'competence12'],
    title_i18n: {
      fr: 'area1 titleFrFr',
      en: 'area1 titleEnUs',
    },
    code: 'area1 code',
    name: 'area1 name',
    color: 'area1 color',
    frameworkId: 'frameworkA',
  });
  const airtableArea2 = airtableBuilder.factory.buildArea({
    id: 'area2',
    competenceIds: ['competence21'],
    competenceAirtableIds: ['competence21'],
    title_i18n: {
      fr: 'area2 titleFrFr',
      en: 'area2 titleEnUs',
    },
    code: 'area2 code',
    name: 'area2 name',
    color: 'area2 color',
    frameworkId: 'frameworkA',
  });
  const competence11 = {
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
    origin: 'FrameworkA',
  };
  const airtableCompetence11 = airtableBuilder.factory.buildCompetence(competence11);
  const competence12 = {
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
    origin: 'FrameworkA',
  };
  const airtableCompetence12 = airtableBuilder.factory.buildCompetence(competence12);
  const competence21 = {
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
    origin: 'FrameworkA',
  };
  const airtableCompetence21 = airtableBuilder.factory.buildCompetence(competence21);
  const airtableThematic111 = airtableBuilder.factory.buildThematic({
    id: 'thematic111',
    name_i18n: {
      fr: 'thematic111 name',
      en: 'thematic111 nameEnUs',
    },
    competenceId: 'competence11',
    tubeIds: ['tube1111'],
    index: 'thematic111 index',
  });
  const airtableThematic112 = airtableBuilder.factory.buildThematic({
    id: 'thematic112',
    name_i18n: {
      fr: 'thematic112 name',
      en: 'thematic112 nameEnUs',
    },
    competenceId: 'competence11',
    tubeIds: ['tube1121'],
    index: 'thematic112 index',
  });
  const airtableThematic121 = airtableBuilder.factory.buildThematic({
    id: 'thematic121',
    name_i18n: {
      fr: 'thematic121 name',
      en: 'thematic121 nameEnUs',
    },
    competenceId: 'competence12',
    tubeIds: ['tube1211', 'tube1212'],
    index: 'thematic121 index',
  });
  const airtableThematic211 = airtableBuilder.factory.buildThematic({
    id: 'thematic211',
    name_i18n: {
      fr: 'thematic211 name',
      en: 'thematic211 nameEnUs',
    },
    competenceId: 'competence21',
    tubeIds: ['tube2111'],
    index: 'thematic211 index',
  });
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
  const airtableSkill11111 = airtableBuilder.factory.buildSkill({
    id: 'skill11111',
    name: 'skill11111 name',
    hint_i18n: {
      fr: 'skill11111 hintFrFr',
      en: 'skill11111 hintEnUs',
    },
    hintStatus: 'skill11111 hintStatus',
    tutorialIds: ['tutorial2'],
    learningMoreTutorialIds: ['tutorial1'],
    pixValue: 1,
    competenceId: 'competence11',
    status: 'skill11111 status',
    tubeId: 'tube1111',
    description: 'skill11111 description',
    level: 4,
    internationalisation: 'skill11111 internationalisation',
    version: 'skill11111 version',
  });
  const airtableSkill11112 = airtableBuilder.factory.buildSkill({
    id: 'skill11112',
    name: 'skill11112 name',
    hint_i18n: {
      fr: 'skill11112 hintFrFr',
      en: 'skill11112 hintEnUs',
    },
    hintStatus: 'skill11112 hintStatus',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    pixValue: 2,
    competenceId: 'competence11',
    status: 'skill11112 status',
    tubeId: 'tube1111',
    description: 'skill11112 description',
    level: 3,
    internationalisation: 'skill11112 internationalisation',
    version: 'skill11112 version',
  });
  const airtableSkill12121 = airtableBuilder.factory.buildSkill({
    id: 'skill12121',
    name: 'skill12121 name',
    hint_i18n: {
      fr: 'skill12121 hintFrFr',
      en: 'skill12121 hintEnUs',
    },
    hintStatus: 'skill12121 hintStatus',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    pixValue: 3,
    competenceId: 'competence12',
    status: 'skill12121 status',
    tubeId: 'tube1212',
    description: 'skill12121 description',
    level: 2,
    internationalisation: 'skill12121 internationalisation',
    version: 'skill12121 version',
  });
  const airtableSkill21111 = airtableBuilder.factory.buildSkill({
    id: 'skill21111',
    name: 'skill21111 name',
    hint_i18n: {
      fr: 'skill21111 hintFrFr',
      en: 'skill21111 hintEnUs',
    },
    hintStatus: 'skill21111 hintStatus',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    pixValue: 4,
    competenceId: 'competence21',
    status: 'skill21111 status',
    tubeId: 'tube2111',
    description: 'skill21111 description',
    level: 1,
    internationalisation: 'skill21111 internationalisation',
    version: 'skill21111 version',
  });
  const challenge121211 = {
    id: 'challenge121211',
    translations: {
      'fr-fr': {
        instruction: 'challenge121211 instruction',
        proposals: 'challenge121211 proposals',
        solution: 'challenge121211 solution',
        solutionToDisplay: 'challenge121211 solutionToDisplay',
        alternativeInstruction: 'challenge121211 alternativeInstruction',
      },
    },
    instruction: 'challenge121211 instruction',
    proposals: 'challenge121211 proposals',
    type: 'challenge121211 type',
    solution: 'challenge121211 solution',
    solutionToDisplay: 'challenge121211 solutionToDisplay',
    t1Status: 'challenge121211 t1Status',
    t2Status: 'challenge121211 t2Status',
    t3Status: 'challenge121211 t3Status',
    status: 'validé',
    skillId: 'skill12121',
    embedUrl: 'challenge121211 embedUrl',
    embedTitle: 'challenge121211 embedTitle',
    embedHeight: 'challenge121211 embedHeight',
    timer: 1,
    competenceId: 'competence12',
    format: 'challenge121211 format',
    files: 'challenge121211 files',
    autoReply: 'challenge121211 autoReply',
    locales: ['fr-fr'],
    alternativeInstruction: 'challenge121211 alternativeInstruction',
    airtableId: 'challenge121211',
    skills: 'challenge121211 skills',
    genealogy: 'Prototype 1',
    pedagogy: 'challenge121211 pedagogy',
    author: 'challenge121211 author',
    declinable: 'challenge121211 declinable',
    preview: 'challenge121211 preview',
    version: 'challenge121211 version',
    alternativeVersion: 'challenge121211 alternativeVersion',
    accessibility1: 'challenge121211 accessibility1',
    accessibility2: 'challenge121211 accessibility2',
    spoil: 'challenge121211 spoil',
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
    translations: {
      en: {
        instruction: 'challenge121212 instruction',
        proposals: 'challenge121212 proposals',
        solution: 'challenge121212 solution',
        solutionToDisplay: 'challenge121212 solutionToDisplay',
        alternativeInstruction: 'challenge121212 alternativeInstruction',
      },
    },
    instruction: 'challenge121212 instruction',
    proposals: 'challenge121212 proposals',
    type: 'challenge121212 type',
    solution: 'challenge121212 solution',
    solutionToDisplay: 'challenge121212 solutionToDisplay',
    t1Status: 'challenge121212 t1Status',
    t2Status: 'challenge121212 t2Status',
    t3Status: 'challenge121212 t3Status',
    status: 'validé',
    skillId: 'skill12121',
    embedUrl: 'challenge121212 embedUrl',
    embedTitle: 'challenge121212 embedTitle',
    embedHeight: 'challenge121212 embedHeight',
    timer: 10,
    competenceId: 'competence12',
    format: 'challenge121212 format',
    files: 'challenge121212 files',
    autoReply: 'challenge121212 autoReply',
    locales: ['fr-fr', 'en'],
    alternativeInstruction: 'challenge121212 alternativeInstruction',
    airtableId: 'challenge121212',
    skills: 'challenge121212 skills',
    genealogy: 'Prototype 1',
    pedagogy: 'challenge121212 pedagogy',
    author: 'challenge121212 author',
    declinable: 'challenge121212 declinable',
    preview: 'challenge121212 preview',
    version: 'challenge121212 version',
    alternativeVersion: 'challenge121212 alternativeVersion',
    accessibility1: 'challenge121212 accessibility1',
    accessibility2: 'challenge121212 accessibility2',
    spoil: 'challenge121212 spoil',
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
    translations: {
      fr: {
        instruction: 'challenge211111 instruction',
        proposals: 'challenge211111 proposals',
        solution: 'challenge211111 solution',
        solutionToDisplay: 'challenge211111 solutionToDisplay',
        alternativeInstruction: 'challenge211111 alternativeInstruction',
      },
    },
    instruction: 'challenge211111 instruction',
    proposals: 'challenge211111 proposals',
    type: 'challenge211111 type',
    solution: 'challenge211111 solution',
    solutionToDisplay: 'challenge211111 solutionToDisplay',
    t1Status: 'challenge211111 t1Status',
    t2Status: 'challenge211111 t2Status',
    t3Status: 'challenge211111 t3Status',
    status: 'validé',
    skillId: 'skill21111',
    embedUrl: 'challenge211111 embedUrl',
    embedTitle: 'challenge211111 embedTitle',
    embedHeight: 'challenge211111 embedHeight',
    timer: 60,
    competenceId: 'competence21',
    format: 'challenge211111 format',
    files: 'challenge211111 files',
    autoReply: 'challenge211111 autoReply',
    locales: ['fr'],
    alternativeInstruction: 'challenge211111 alternativeInstruction',
    airtableId: 'challenge211111',
    skills: 'challenge211111 skills',
    genealogy: 'Prototype 1',
    pedagogy: 'challenge211111 pedagogy',
    author: 'challenge211111 author',
    declinable: 'challenge211111 declinable',
    preview: 'challenge211111 preview',
    version: 'challenge211111 version',
    alternativeVersion: 'challenge211111 alternativeVersion',
    accessibility1: 'challenge211111 accessibility1',
    accessibility2: 'challenge211111 accessibility2',
    spoil: 'challenge211111 spoil',
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
    translations: {
      fr: {
        instruction: 'challenge211112 instruction',
        proposals: 'challenge211112 proposals',
        solution: 'challenge211112 solution',
        solutionToDisplay: 'challenge211112 solutionToDisplay',
        alternativeInstruction: 'challenge211112 alternativeInstruction',
      },
    },
    instruction: 'challenge211112 instruction',
    proposals: 'challenge211112 proposals',
    type: 'challenge211112 type',
    solution: 'challenge211112 solution',
    solutionToDisplay: 'challenge211112 solutionToDisplay',
    t1Status: 'challenge211112 t1Status',
    t2Status: 'challenge211112 t2Status',
    t3Status: 'challenge211112 t3Status',
    status: 'NOT_validé',
    skillId: 'skill21111',
    embedUrl: 'challenge211112 embedUrl',
    embedTitle: 'challenge211112 embedTitle',
    embedHeight: 'challenge211112 embedHeight',
    timer: 60,
    competenceId: 'competence21',
    format: 'challenge211112 format',
    files: 'challenge211112 files',
    autoReply: 'challenge211112 autoReply',
    locales: ['fr'],
    alternativeInstruction: 'challenge211112 alternativeInstruction',
    airtableId: 'challenge211112',
    skills: 'challenge211112 skills',
    genealogy: 'Prototype 1',
    pedagogy: 'challenge211112 pedagogy',
    author: 'challenge211112 author',
    declinable: 'challenge211112 declinable',
    preview: 'challenge211112 preview',
    version: 'challenge211112 version',
    alternativeVersion: 'challenge211112 alternativeVersion',
    accessibility1: 'challenge211112 accessibility1',
    accessibility2: 'challenge211112 accessibility2',
    spoil: 'challenge211112 spoil',
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
    translations: {
      'fr': {
        instruction: 'challenge211113 instruction',
        proposals: 'challenge211113 proposals',
        solution: 'challenge211113 solution',
        solutionToDisplay: 'challenge211113 solutionToDisplay',
        alternativeInstruction: 'challenge211113 alternativeInstruction',
      },
    },
    instruction: 'challenge211113 instruction',
    proposals: 'challenge211113 proposals',
    type: 'challenge211113 type',
    solution: 'challenge211113 solution',
    solutionToDisplay: 'challenge211113 solutionToDisplay',
    t1Status: 'challenge211113 t1Status',
    t2Status: 'challenge211113 t2Status',
    t3Status: 'challenge211113 t3Status',
    status: 'validé',
    skillId: 'skill21111',
    embedUrl: 'challenge211113 embedUrl',
    embedTitle: 'challenge211113 embedTitle',
    embedHeight: 'challenge211113 embedHeight',
    timer: 60,
    competenceId: 'competence21',
    format: 'challenge211113 format',
    files: 'challenge211113 files',
    autoReply: 'challenge211113 autoReply',
    locales: ['fr'],
    alternativeInstruction: 'challenge211113 alternativeInstruction',
    airtableId: 'challenge211113',
    skills: 'challenge211113 skills',
    genealogy: 'NOT_Prototype 1',
    pedagogy: 'challenge211113 pedagogy',
    author: 'challenge211113 author',
    declinable: 'challenge211113 declinable',
    preview: 'challenge211113 preview',
    version: 'challenge211113 version',
    alternativeVersion: 'challenge211113 alternativeVersion',
    accessibility1: 'challenge211113 accessibility1',
    accessibility2: 'challenge211113 accessibility2',
    spoil: 'challenge211113 spoil',
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
    alt: 'attachment1 alt',
    type: 'attachment1 type',
    url: 'attachment1 url',
    challengeId: 'challenge121211',
  });
  const airtableAttachment2 = airtableBuilder.factory.buildAttachment({
    id: 'attachment2',
    alt: 'attachment2 alt',
    type: 'attachment2 type',
    url: 'attachment2 url',
    challengeId: 'challenge121211',
  });
  const airtableAttachment3 = airtableBuilder.factory.buildAttachment({
    id: 'attachment3',
    alt: 'attachment3 alt',
    type: 'attachment3 type',
    url: 'attachment3 url',
    challengeId: 'challenge211111',
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
    attachments: [airtableAttachment1, airtableAttachment2, airtableAttachment3],
  });

  return {
    competences: [competence11, competence12, competence21],
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
    code: 'area1 code',
    name: 'area1 name',
    color: 'area1 color',
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
    code: 'area2 code',
    name: 'area2 name',
    color: 'area2 color',
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
        fr: 'thematic111 name',
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
        fr: 'thematic112 name',
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
        fr: 'thematic121 name',
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
        fr: 'thematic211 name',
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
      isMobileCompliant: false,
      isTabletCompliant: false,
      thematicId: 'thematic111',
      skillIds: ['skill11111', 'skill11112'],
    },
    {
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
      isMobileCompliant: false,
      isTabletCompliant: false,
      thematicId: 'thematic112',
      skillIds: [],
    },
    {
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
      isMobileCompliant: false,
      isTabletCompliant: false,
      thematicId: 'thematic121',
      skillIds: [],
    },
    {
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
      isMobileCompliant: true,
      isTabletCompliant: false,
      thematicId: 'thematic121',
      skillIds: ['skill12121'],
    },
    {
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
      hintStatus: 'skill11111 hintStatus',
      tutorialIds: ['tutorial2'],
      learningMoreTutorialIds: ['tutorial1'],
      pixValue: 1,
      competenceId: 'competence11',
      status: 'skill11111 status',
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
      hintStatus: 'skill11112 hintStatus',
      learningMoreTutorialIds: [],
      tutorialIds: [],
      pixValue: 2,
      competenceId: 'competence11',
      tubeId: 'tube1111',
      status: 'skill11112 status',
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
      hintStatus: 'skill12121 hintStatus',
      tutorialIds: [],
      learningMoreTutorialIds: [],
      pixValue: 3,
      competenceId: 'competence12',
      tubeId: 'tube1212',
      status: 'skill12121 status',
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
      hintStatus: 'skill21111 hintStatus',
      tutorialIds: [],
      learningMoreTutorialIds: [],
      pixValue: 4,
      competenceId: 'competence21',
      tubeId: 'tube2111',
      status: 'skill21111 status',
      level: 1,
      version: 'skill21111 version',
    },
  ];
  const expectedChallengeDTOs = [
    {
      id: 'challenge121211',
      translations: {
        'fr-fr': {
          instruction: 'challenge121211 instruction',
          proposals: 'challenge121211 proposals',
          solution: 'challenge121211 solution',
          solutionToDisplay: 'challenge121211 solutionToDisplay',
          alternativeInstruction: 'challenge121211 alternativeInstruction',
        },
      },
      instruction: 'challenge121211 instruction',
      proposals: 'challenge121211 proposals',
      type: 'challenge121211 type',
      solution: 'challenge121211 solution',
      solutionToDisplay: 'challenge121211 solutionToDisplay',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: 'validé',
      skillId: 'skill12121',
      embedUrl: 'challenge121211 embedUrl',
      embedTitle: 'challenge121211 embedTitle',
      embedHeight: 'challenge121211 embedHeight',
      timer: 1,
      competenceId: 'competence12',
      format: 'challenge121211 format',
      autoReply: true,
      locales: ['fr-fr'],
      alternativeInstruction: 'challenge121211 alternativeInstruction',
      genealogy: 'Prototype 1',
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
      id: 'challenge121212',
      translations: {
        en: {
          instruction: 'challenge121212 instruction',
          proposals: 'challenge121212 proposals',
          solution: 'challenge121212 solution',
          solutionToDisplay: 'challenge121212 solutionToDisplay',
          alternativeInstruction: 'challenge121212 alternativeInstruction',
        },
      },
      instruction: 'challenge121212 instruction',
      proposals: 'challenge121212 proposals',
      type: 'challenge121212 type',
      solution: 'challenge121212 solution',
      solutionToDisplay: 'challenge121212 solutionToDisplay',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: 'validé',
      skillId: 'skill12121',
      embedUrl: 'challenge121212 embedUrl',
      embedTitle: 'challenge121212 embedTitle',
      embedHeight: 'challenge121212 embedHeight',
      timer: 10,
      competenceId: 'competence12',
      format: 'challenge121212 format',
      autoReply: true,
      locales: ['fr-fr', 'en'],
      alternativeInstruction: 'challenge121212 alternativeInstruction',
      genealogy: 'Prototype 1',
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
      translations: {
        'fr': {
          instruction: 'challenge211111 instruction',
          proposals: 'challenge211111 proposals',
          solution: 'challenge211111 solution',
          solutionToDisplay: 'challenge211111 solutionToDisplay',
          alternativeInstruction: 'challenge211111 alternativeInstruction',
        },
      },
      instruction: 'challenge211111 instruction',
      proposals: 'challenge211111 proposals',
      type: 'challenge211111 type',
      solution: 'challenge211111 solution',
      solutionToDisplay: 'challenge211111 solutionToDisplay',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: 'validé',
      skillId: 'skill21111',
      embedUrl: 'challenge211111 embedUrl',
      embedTitle: 'challenge211111 embedTitle',
      embedHeight: 'challenge211111 embedHeight',
      timer: 60,
      competenceId: 'competence21',
      format: 'challenge211111 format',
      autoReply: true,
      locales: ['fr'],
      alternativeInstruction: 'challenge211111 alternativeInstruction',
      genealogy: 'Prototype 1',
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
      translations: {
        'fr': {
          instruction: 'challenge211112 instruction',
          proposals: 'challenge211112 proposals',
          solution: 'challenge211112 solution',
          solutionToDisplay: 'challenge211112 solutionToDisplay',
          alternativeInstruction: 'challenge211112 alternativeInstruction',
        },
      },
      instruction: 'challenge211112 instruction',
      proposals: 'challenge211112 proposals',
      type: 'challenge211112 type',
      solution: 'challenge211112 solution',
      solutionToDisplay: 'challenge211112 solutionToDisplay',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: 'NOT_validé',
      skillId: 'skill21111',
      embedUrl: 'challenge211112 embedUrl',
      embedTitle: 'challenge211112 embedTitle',
      embedHeight: 'challenge211112 embedHeight',
      timer: 60,
      competenceId: 'competence21',
      format: 'challenge211112 format',
      autoReply: true,
      locales: ['fr'],
      alternativeInstruction: 'challenge211112 alternativeInstruction',
      genealogy: 'Prototype 1',
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
      translations: {
        'fr': {
          instruction: 'challenge211113 instruction',
          proposals: 'challenge211113 proposals',
          solution: 'challenge211113 solution',
          solutionToDisplay: 'challenge211113 solutionToDisplay',
          alternativeInstruction: 'challenge211113 alternativeInstruction',
        },
      },
      instruction: 'challenge211113 instruction',
      proposals: 'challenge211113 proposals',
      type: 'challenge211113 type',
      solution: 'challenge211113 solution',
      solutionToDisplay: 'challenge211113 solutionToDisplay',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: 'validé',
      skillId: 'skill21111',
      embedUrl: 'challenge211113 embedUrl',
      embedTitle: 'challenge211113 embedTitle',
      embedHeight: 'challenge211113 embedHeight',
      timer: 60,
      competenceId: 'competence21',
      format: 'challenge211113 format',
      autoReply: true,
      locales: ['fr'],
      alternativeInstruction: 'challenge211113 alternativeInstruction',
      genealogy: 'NOT_Prototype 1',
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
      competences: ['competence12', 'competence21'],
      challenges: ['challenge121212', 'challenge211113'],
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
  };
}
