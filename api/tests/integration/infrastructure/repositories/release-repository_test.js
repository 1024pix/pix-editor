const { expect, databaseBuilder, knex, domainBuilder, airtableBuilder } = require('../../../test-helper');
const releaseRepository = require('../../../../lib/infrastructure/repositories/release-repository');

describe('Integration | Repository | release-repository', function() {
  describe('#create', function() {

    afterEach(function() {
      return knex('releases').delete();
    });

    it('should save current content as a new release', async function() {
      // Given
      const currentContent = { some: 'property' };
      const fakeGetCurrentContent = async function() { return currentContent; };

      // When
      await releaseRepository.create(fakeGetCurrentContent);

      // Then
      const releasesInDb = await knex('releases');
      expect(releasesInDb).to.have.length(1);
      expect(releasesInDb[0].content).to.deep.equal(currentContent);
    });

    it('should return the saved release ID', async function() {
      // Given
      const currentContentDTO = { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] };
      const fakeGetCurrentContent = async function() { return currentContentDTO; };

      // When
      const releaseId = await releaseRepository.create(fakeGetCurrentContent);

      // Then
      const [releasesInDbId] = await knex('releases').pluck('id');
      expect(releaseId).to.equal(releasesInDbId);
    });
  });

  describe('#getLatestRelease', function() {
    it('should return content of newest created release', async function() {
      // Given
      const newestReleaseContentDTO = { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] };
      const oldestReleaseContentDTO = { some: 'old-property' };
      databaseBuilder.factory.buildRelease({ id: 1, createdAt: new Date('2021-02-02'), content: newestReleaseContentDTO });
      databaseBuilder.factory.buildRelease({ id: 2, createdAt: new Date('2020-01-01'), content: oldestReleaseContentDTO });
      await databaseBuilder.commit();

      // When
      const latestRelease = await releaseRepository.getLatestRelease();

      // Then
      const expectedContent = domainBuilder.buildContentForRelease(newestReleaseContentDTO);
      const expectedRelease = domainBuilder.buildDomainRelease({ id: 1, createdAt: new Date('2021-02-02'), content: expectedContent });
      expect(latestRelease).to.deepEqualInstance(expectedRelease);
    });
  });

  describe('#getRelease', function() {
    it('should return content of given release', async function() {
      // Given
      const otherReleaseContentDTO = { some: 'property' };
      const expectedReleaseContentDTO = { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] };

      databaseBuilder.factory.buildRelease({ id: 11, createdAt: new Date('2021-01-01'), content: otherReleaseContentDTO });
      databaseBuilder.factory.buildRelease({ id: 12, createdAt: new Date('2020-01-01'), content: expectedReleaseContentDTO });
      await databaseBuilder.commit();

      // When
      const givenRelease = await releaseRepository.getRelease(12);

      // Then
      const expectedContent = domainBuilder.buildContentForRelease(expectedReleaseContentDTO);
      const expectedRelease = domainBuilder.buildDomainRelease({ id: 12, createdAt: new Date('2020-01-01'), content: expectedContent });
      expect(givenRelease).to.deepEqualInstance(expectedRelease);
    });
  });

  describe('#getCurrentContent', function() {

    beforeEach(function() {
      const airtableFrameworkA = airtableBuilder.factory.buildFramework({
        id: 'frameworkA',
        name: 'FrameworkA',
      });
      const airtableArea1 = airtableBuilder.factory.buildArea({
        id: 'area1',
        competenceIds: ['competence11', 'competence12'],
        competenceAirtableIds: ['competence11', 'competence12'],
        titleFrFr: 'area1 titleFrFr',
        titleEnUs: 'area1 titleEnUs',
        code: 'area1 code',
        name: 'area1 name',
        color: 'area1 color',
        frameworkId: 'frameworkA',
      });
      const airtableArea2 = airtableBuilder.factory.buildArea({
        id: 'area2',
        competenceIds: ['competence21'],
        competenceAirtableIds: ['competence21'],
        titleFrFr: 'area2 titleFrFr',
        titleEnUs: 'area2 titleEnUs',
        code: 'area2 code',
        name: 'area2 name',
        color: 'area2 color',
        frameworkId: 'frameworkA',
      });
      const airtableCompetence11 = airtableBuilder.factory.buildCompetence({
        id: 'competence11',
        index: 'competence11 index',
        name: 'competence11 name',
        nameFrFr: 'competence11 nameFrFr',
        nameEnUs: 'competence11 nameEnUs',
        description: 'competence11 description',
        descriptionFrFr: 'competence11 descriptionFrFr',
        descriptionEnUs: 'competence11 descriptionEnUs',
        areaId: 'area1',
        skillIds: ['skill11111', 'skill11112'],
        thematicIds: ['thematic111', 'thematic112'],
        origin: 'FrameworkA',
        fullName: 'competence11 fullName',
      });
      const airtableCompetence12 = airtableBuilder.factory.buildCompetence({
        id: 'competence12',
        index: 'competence12 index',
        name: 'competence12 name',
        nameFrFr: 'competence12 nameFrFr',
        nameEnUs: 'competence12 nameEnUs',
        description: 'competence12 description',
        descriptionFrFr: 'competence12 descriptionFrFr',
        descriptionEnUs: 'competence12 descriptionEnUs',
        areaId: 'area1',
        skillIds: ['skill12121'],
        thematicIds: ['thematic121'],
        origin: 'FrameworkA',
        fullName: 'competence12 fullName',
      });
      const airtableCompetence21 = airtableBuilder.factory.buildCompetence({
        id: 'competence21',
        index: 'competence21 index',
        name: 'competence21 name',
        nameFrFr: 'competence21 nameFrFr',
        nameEnUs: 'competence21 nameEnUs',
        description: 'competence21 description',
        descriptionFrFr: 'competence21 descriptionFrFr',
        descriptionEnUs: 'competence21 descriptionEnUs',
        areaId: 'area2',
        skillIds: ['skill21111'],
        thematicIds: ['thematic211'],
        origin: 'FrameworkA',
        fullName: 'competence21 fullName',
      });
      const airtableThematic111 = airtableBuilder.factory.buildThematic({
        id: 'thematic111',
        name: 'thematic111 name',
        nameEnUs: 'thematic111 nameEnUs',
        competenceId: 'competence11',
        tubeIds: ['tube1111'],
        index: 'thematic111 index',
      });
      const airtableThematic112 = airtableBuilder.factory.buildThematic({
        id: 'thematic112',
        name: 'thematic112 name',
        nameEnUs: 'thematic112 nameEnUs',
        competenceId: 'competence11',
        tubeIds: ['tube1121'],
        index: 'thematic112 index',
      });
      const airtableThematic121 = airtableBuilder.factory.buildThematic({
        id: 'thematic121',
        name: 'thematic121 name',
        nameEnUs: 'thematic121 nameEnUs',
        competenceId: 'competence12',
        tubeIds: ['tube1211', 'tube1212'],
        index: 'thematic121 index',
      });
      const airtableThematic211 = airtableBuilder.factory.buildThematic({
        id: 'thematic211',
        name: 'thematic211 name',
        nameEnUs: 'thematic211 nameEnUs',
        competenceId: 'competence21',
        tubeIds: ['tube2111'],
        index: 'thematic211 index',
      });
      const airtableTube1111 = airtableBuilder.factory.buildTube({
        id: 'tube1111',
        name: 'tube1111 name',
        title: 'tube1111 title',
        description: 'tube1111 description',
        practicalTitleFrFr: 'tube1111 practicalTitleFrFr',
        practicalTitleEnUs: 'tube1111 practicalTitleEnUs',
        practicalDescriptionFrFr: 'tube1111 practicalDescriptionFrFr',
        practicalDescriptionEnUs: 'tube1111 practicalDescriptionEnUs',
        competenceId: 'competence11',
      });
      const airtableTube1121 = airtableBuilder.factory.buildTube({
        id: 'tube1121',
        name: 'tube1121 name',
        title: 'tube1121 title',
        description: 'tube1121 description',
        practicalTitleFrFr: 'tube1121 practicalTitleFrFr',
        practicalTitleEnUs: 'tube1121 practicalTitleEnUs',
        practicalDescriptionFrFr: 'tube1121 practicalDescriptionFrFr',
        practicalDescriptionEnUs: 'tube1121 practicalDescriptionEnUs',
        competenceId: 'competence11',
      });
      const airtableTube1211 = airtableBuilder.factory.buildTube({
        id: 'tube1211',
        name: 'tube1211 name',
        title: 'tube1211 title',
        description: 'tube1211 description',
        practicalTitleFrFr: 'tube1211 practicalTitleFrFr',
        practicalTitleEnUs: 'tube1211 practicalTitleEnUs',
        practicalDescriptionFrFr: 'tube1211 practicalDescriptionFrFr',
        practicalDescriptionEnUs: 'tube1211 practicalDescriptionEnUs',
        competenceId: 'competence12',
      });
      const airtableTube1212 = airtableBuilder.factory.buildTube({
        id: 'tube1212',
        name: 'tube1212 name',
        title: 'tube1212 title',
        description: 'tube1212 description',
        practicalTitleFrFr: 'tube1212 practicalTitleFrFr',
        practicalTitleEnUs: 'tube1212 practicalTitleEnUs',
        practicalDescriptionFrFr: 'tube1212 practicalDescriptionFrFr',
        practicalDescriptionEnUs: 'tube1212 practicalDescriptionEnUs',
        competenceId: 'competence12',
      });
      const airtableTube2111 = airtableBuilder.factory.buildTube({
        id: 'tube2111',
        name: 'tube2111 name',
        title: 'tube2111 title',
        description: 'tube2111 description',
        practicalTitleFrFr: 'tube2111 practicalTitleFrFr',
        practicalTitleEnUs: 'tube2111 practicalTitleEnUs',
        practicalDescriptionFrFr: 'tube2111 practicalDescriptionFrFr',
        practicalDescriptionEnUs: 'tube2111 practicalDescriptionEnUs',
        competenceId: 'competence21',
      });
      const airtableSkill11111 = airtableBuilder.factory.buildSkill({
        id: 'skill11111',
        name: 'skill11111 name',
        hintFrFr: 'skill11111 hintFrFr',
        hintEnUs: 'skill11111 hintEnUs',
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
        hintFrFr: 'skill11112 hintFrFr',
        hintEnUs: 'skill11112 hintEnUs',
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
        hintFrFr: 'skill12121 hintFrFr',
        hintEnUs: 'skill12121 hintEnUs',
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
        hintFrFr: 'skill21111 hintFrFr',
        hintEnUs: 'skill21111 hintEnUs',
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
      const airtableChallenge121211 = airtableBuilder.factory.buildChallenge({
        id: 'challenge121211',
        instruction: 'challenge121211 instruction',
        proposals: 'challenge121211 proposals',
        type: 'challenge121211 type',
        solution: 'challenge121211 solution',
        solutionToDisplay: 'challenge121211 solutionToDisplay',
        t1Status: 'challenge121211 t1Status',
        t2Status: 'challenge121211 t2Status',
        t3Status: 'challenge121211 t3Status',
        status: 'challenge121211 status',
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
        genealogy: 'challenge121211 genealogy',
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
      });
      const airtableChallenge121212 = airtableBuilder.factory.buildChallenge({
        id: 'challenge121212',
        instruction: 'challenge121212 instruction',
        proposals: 'challenge121212 proposals',
        type: 'challenge121212 type',
        solution: 'challenge121212 solution',
        solutionToDisplay: 'challenge121212 solutionToDisplay',
        t1Status: 'challenge121212 t1Status',
        t2Status: 'challenge121212 t2Status',
        t3Status: 'challenge121212 t3Status',
        status: 'challenge121212 status',
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
        genealogy: 'challenge121212 genealogy',
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
      });
      const airtableChallenge211111 = airtableBuilder.factory.buildChallenge({
        id: 'challenge211111',
        instruction: 'challenge211111 instruction',
        proposals: 'challenge211111 proposals',
        type: 'challenge211111 type',
        solution: 'challenge211111 solution',
        solutionToDisplay: 'challenge211111 solutionToDisplay',
        t1Status: 'challenge211111 t1Status',
        t2Status: 'challenge211111 t2Status',
        t3Status: 'challenge211111 t3Status',
        status: 'challenge211111 status',
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
        genealogy: 'challenge211111 genealogy',
        pedagogy: 'challenge211111 pedagogy',
        author: 'challenge211111 author',
        declinable: 'challenge211111 declinable',
        preview: 'challenge211111 preview',
        version: 'challenge211111 version',
        alternativeVersion: 'challenge211111 alternativeVersion',
        accessibility1: 'challenge211111 accessibility1',
        accessibility2: 'challenge211111 accessibility2',
        spoil: 'challenge211111 spoil',
        responsive: [],
        area: 'challenge211111 area',
        focusable: 'challenge211111 focusable',
        delta: 100,
        alpha: 200,
        updatedAt: 'challenge211111 updatedAt',
      });
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
      const airtableCourse1 = airtableBuilder.factory.buildCourse({
        id: 'course1',
        name: 'course1 name',
        description: 'course1 description',
        competences: ['competence12'],
        challenges: ['challenge121211'],
        imageUrl: 'course1 imageUrl',
        adaptive: 'course1 adaptive',
      });
      const airtableCourse2 = airtableBuilder.factory.buildCourse({
        id: 'course2',
        name: 'course2 name',
        description: 'course2 description',
        competences: ['competence12', 'competence21'],
        challenges: ['challenge121211', 'challenge211111'],
        imageUrl: 'course2 imageUrl',
        adaptive: 'course2 adaptive',
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
        challenges: [airtableChallenge121211, airtableChallenge121212, airtableChallenge211111],
        tutorials: [airtableTutorial1, airtableTutorial2],
        courses: [airtableCourse1, airtableCourse2],
        attachments: [airtableAttachment1, airtableAttachment2, airtableAttachment3],
      });
    });

    it('should return current content as DTO', async function() {
      // When
      const currentContentDTO = await releaseRepository.getCurrentContent();

      // Then
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
        titleFrFr: 'area1 titleFrFr',
        titleEnUs: 'area1 titleEnUs',
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
        titleFrFr: 'area2 titleFrFr',
        titleEnUs: 'area2 titleEnUs',
        code: 'area2 code',
        name: 'area2 name',
        color: 'area2 color',
        frameworkId: 'frameworkA',
      }];
      const expectedCompetenceDTOs = [
        {
          id: 'competence11',
          index: 'competence11 index',
          name: 'competence11 name',
          nameFrFr: 'competence11 nameFrFr',
          nameEnUs: 'competence11 nameEnUs',
          description: 'competence11 description',
          descriptionFrFr: 'competence11 descriptionFrFr',
          descriptionEnUs: 'competence11 descriptionEnUs',
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
          name: 'competence12 name',
          nameFrFr: 'competence12 nameFrFr',
          nameEnUs: 'competence12 nameEnUs',
          description: 'competence12 description',
          descriptionFrFr: 'competence12 descriptionFrFr',
          descriptionEnUs: 'competence12 descriptionEnUs',
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
          name: 'competence21 name',
          nameFrFr: 'competence21 nameFrFr',
          nameEnUs: 'competence21 nameEnUs',
          description: 'competence21 description',
          descriptionFrFr: 'competence21 descriptionFrFr',
          descriptionEnUs: 'competence21 descriptionEnUs',
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
          name: 'thematic111 name',
          nameEnUs: 'thematic111 nameEnUs',
          competenceId: 'competence11',
          tubeIds: [
            'tube1111',
          ],
          index: 'thematic111 index',
        },
        {
          id: 'thematic112',
          name: 'thematic112 name',
          nameEnUs: 'thematic112 nameEnUs',
          competenceId: 'competence11',
          tubeIds: [
            'tube1121',
          ],
          index: 'thematic112 index',
        },
        {
          id: 'thematic121',
          name: 'thematic121 name',
          nameEnUs: 'thematic121 nameEnUs',
          competenceId: 'competence12',
          tubeIds: [
            'tube1211',
            'tube1212',
          ],
          index: 'thematic121 index',
        },
        {
          id: 'thematic211',
          name: 'thematic211 name',
          nameEnUs: 'thematic211 nameEnUs',
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
          practicalTitleFrFr: 'tube1111 practicalTitleFrFr',
          practicalTitleEnUs: 'tube1111 practicalTitleEnUs',
          practicalDescriptionFrFr: 'tube1111 practicalDescriptionFrFr',
          practicalDescriptionEnUs: 'tube1111 practicalDescriptionEnUs',
          competenceId: 'competence11',
        },
        {
          id: 'tube1121',
          name: 'tube1121 name',
          title: 'tube1121 title',
          description: 'tube1121 description',
          practicalTitleFrFr: 'tube1121 practicalTitleFrFr',
          practicalTitleEnUs: 'tube1121 practicalTitleEnUs',
          practicalDescriptionFrFr: 'tube1121 practicalDescriptionFrFr',
          practicalDescriptionEnUs: 'tube1121 practicalDescriptionEnUs',
          competenceId: 'competence11',
        },
        {
          id: 'tube1211',
          name: 'tube1211 name',
          title: 'tube1211 title',
          description: 'tube1211 description',
          practicalTitleFrFr: 'tube1211 practicalTitleFrFr',
          practicalTitleEnUs: 'tube1211 practicalTitleEnUs',
          practicalDescriptionFrFr: 'tube1211 practicalDescriptionFrFr',
          practicalDescriptionEnUs: 'tube1211 practicalDescriptionEnUs',
          competenceId: 'competence12',
        },
        {
          id: 'tube1212',
          name: 'tube1212 name',
          title: 'tube1212 title',
          description: 'tube1212 description',
          practicalTitleFrFr: 'tube1212 practicalTitleFrFr',
          practicalTitleEnUs: 'tube1212 practicalTitleEnUs',
          practicalDescriptionFrFr: 'tube1212 practicalDescriptionFrFr',
          practicalDescriptionEnUs: 'tube1212 practicalDescriptionEnUs',
          competenceId: 'competence12',
        },
        {
          id: 'tube2111',
          name: 'tube2111 name',
          title: 'tube2111 title',
          description: 'tube2111 description',
          practicalTitleFrFr: 'tube2111 practicalTitleFrFr',
          practicalTitleEnUs: 'tube2111 practicalTitleEnUs',
          practicalDescriptionFrFr: 'tube2111 practicalDescriptionFrFr',
          practicalDescriptionEnUs: 'tube2111 practicalDescriptionEnUs',
          competenceId: 'competence21',
        },
      ];
      const expectedSkillDTOs = [
        {
          id: 'skill11111',
          name: 'skill11111 name',
          hintFrFr: 'skill11111 hintFrFr',
          hintEnUs: 'skill11111 hintEnUs',
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
          hintFrFr: 'skill11112 hintFrFr',
          hintEnUs: 'skill11112 hintEnUs',
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
          hintFrFr: 'skill12121 hintFrFr',
          hintEnUs: 'skill12121 hintEnUs',
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
          hintFrFr: 'skill21111 hintFrFr',
          hintEnUs: 'skill21111 hintEnUs',
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
          instruction: 'challenge121211 instruction',
          proposals: 'challenge121211 proposals',
          type: 'challenge121211 type',
          solution: 'challenge121211 solution',
          solutionToDisplay: 'challenge121211 solutionToDisplay',
          t1Status: true,
          t2Status: true,
          t3Status: true,
          status: 'challenge121211 status',
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
          genealogy: 'challenge121211 genealogy',
          responsive: ['Smartphone', 'Tablet'],
          focusable: 'challenge121211 focusable',
          delta: 1.1,
          alpha: 2.2,
          attachments: ['attachment1 url', 'attachment2 url'],
        },
        {
          id: 'challenge121212',
          instruction: 'challenge121212 instruction',
          proposals: 'challenge121212 proposals',
          type: 'challenge121212 type',
          solution: 'challenge121212 solution',
          solutionToDisplay: 'challenge121212 solutionToDisplay',
          t1Status: true,
          t2Status: true,
          t3Status: true,
          status: 'challenge121212 status',
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
          genealogy: 'challenge121212 genealogy',
          responsive: ['Smartphone'],
          focusable: 'challenge121212 focusable',
          delta: 123,
          alpha: 456,
        },
        {
          id: 'challenge211111',
          instruction: 'challenge211111 instruction',
          proposals: 'challenge211111 proposals',
          type: 'challenge211111 type',
          solution: 'challenge211111 solution',
          solutionToDisplay: 'challenge211111 solutionToDisplay',
          t1Status: true,
          t2Status: true,
          t3Status: true,
          status: 'challenge211111 status',
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
          genealogy: 'challenge211111 genealogy',
          responsive: [],
          focusable: 'challenge211111 focusable',
          delta: 100,
          alpha: 200,
          attachments: ['attachment3 url'],
        },
      ];
      const expectedCourseDTOs = [
        {
          id: 'course1',
          name: 'course1 name',
          description: 'course1 description',
          competences: ['competence12'],
          challenges: [ 'challenge121211'],
          imageUrl: 'course1 imageUrl',
        },
        {
          id: 'course2',
          name: 'course2 name',
          description: 'course2 description',
          competences: ['competence12', 'competence21'],
          challenges: ['challenge211111', 'challenge121211'],
          imageUrl: 'course2 imageUrl',
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
      const expectedReleaseContentDTO = {
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
      expect(currentContentDTO).to.deep.equal(expectedReleaseContentDTO);
    });
  });
});

