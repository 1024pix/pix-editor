import { beforeEach, describe, expect, it, vi } from 'vitest';
import { airtableBuilder, databaseBuilder, knex } from '../test-helper';
import {
  ResetLearningContentInIntegrationEnvironment
} from '../../scripts/reset-learning-content-in-integration-environment.js';
import nock from 'nock';

describe('Script | ResetLearningContentInIntegrationEnvironment', function() {
  let readCompetenceScope, readThematicScope, readTubeScope, readSkillScope, readChallengeScope, readAttachmentScope;
  let deleteThematicScope, deleteTubeScope, deleteSkillScope, deleteChallengeScope, deleteAttachmentScope;
  beforeEach(async function() {
    const pixCompetences = [
      airtableBuilder.factory.buildCompetence({ id: 'pixCompetenceId1', thematicAirtableIds: ['pixThematicAirtableId1'] }),
      airtableBuilder.factory.buildCompetence({ id: 'pixCompetenceId2', thematicAirtableIds: ['pixThematicAirtableId2'] }),
    ];
    databaseBuilder.factory.buildTranslation({
      key: 'competence.pixCompetenceId1.someField',
      locale: 'fr',
      value: 'competence.pixCompetenceId1.someField FR value',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'competence.pixCompetenceId2.someField',
      locale: 'fr',
      value: 'competence.pixCompetenceId2.someField FR value',
    });
    readCompetenceScope = nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Competences')
      .query({
        filterByFormula: '{Origine} = "Pix"',
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: pixCompetences });

    const pixThematics = [
      airtableBuilder.factory.buildThematic({ id: 'pixThematicId1', airtableId: 'pixThematicAirtableId1' }),
      airtableBuilder.factory.buildThematic({ id: 'pixThematicId2', airtableId: 'pixThematicAirtableId2' }),
    ];
    pixThematics[0].fields['Tubes'] = ['pixTubeAirtableId1'];
    pixThematics[1].fields['Tubes'] = ['pixTubeAirtableId2'];
    databaseBuilder.factory.buildTranslation({
      key: 'thematic.pixThematicId1.someField',
      locale: 'fr',
      value: 'thematic.pixThematicId1.someField FR value',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'thematic.pixThematicId2.someField',
      locale: 'fr',
      value: 'thematic.pixThematicId2.someField FR value',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'thematic.otherThematicId.someField',
      locale: 'fr',
      value: 'thematic.otherThematicId.someField FR value',
    });

    readThematicScope = nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Thematiques')
      .query({
        filterByFormula: 'OR({Record Id} = "pixThematicAirtableId1",{Record Id} = "pixThematicAirtableId2")',
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: pixThematics });

    const pixTubes = [
      airtableBuilder.factory.buildTube({ airtableId: 'pixTubeAirtableId1', id: 'pixTubeId1', skillAirtableIds: ['pixSkillAirtableId1'] }),
      airtableBuilder.factory.buildTube({ airtableId: 'pixTubeAirtableId2', id: 'pixTubeId2', skillAirtableIds: ['pixSkillAirtableId2'] }),
    ];
    pixTubes[0].fields['Acquis'] = ['pixSkillAirtableId1'];
    pixTubes[1].fields['Acquis'] = ['pixSkillAirtableId2'];
    databaseBuilder.factory.buildTranslation({
      key: 'tube.pixTubeId1.someField',
      locale: 'fr',
      value: 'tube.pixTubeId1.someField FR value',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'tube.pixTubeId2.someField',
      locale: 'fr',
      value: 'tube.pixTubeId2.someField FR value',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'tube.otherTubeId.someField',
      locale: 'fr',
      value: 'tube.otherTubeId.someField FR value',
    });

    readTubeScope = nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Tubes')
      .query({
        filterByFormula: 'OR({Record Id} = "pixTubeAirtableId1",{Record Id} = "pixTubeAirtableId2")',
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: pixTubes });

    const pixSkills = [
      airtableBuilder.factory.buildSkill({ airtableId: 'pixSkillAirtableId1', id: 'pixSkillId1' }),
      airtableBuilder.factory.buildSkill({ airtableId: 'pixSkillAirtableId2', id: 'pixSkillId2' }),
    ];
    pixSkills[0].fields['Epreuves'] = ['pixChallengeAirtableId1'];
    pixSkills[1].fields['Epreuves'] = ['pixChallengeAirtableId2'];
    databaseBuilder.factory.buildTranslation({
      key: 'skill.pixSkillId1.someField',
      locale: 'fr',
      value: 'skill.pixSkillId1.someField FR value',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'skill.pixSkillId2.someField',
      locale: 'fr',
      value: 'skill.pixSkillId2.someField FR value',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'skill.otherSkillId.someField',
      locale: 'fr',
      value: 'skill.otherSkillId.someField FR value',
    });

    readSkillScope = nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Acquis')
      .query({
        filterByFormula: 'OR({Record Id} = "pixSkillAirtableId1",{Record Id} = "pixSkillAirtableId2")',
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: pixSkills });

    const pixChallenges = [
      airtableBuilder.factory.buildChallenge({ airtableId: 'pixChallengeAirtableId1', id: 'pixChallengeId1', files: [{ fileId: 'pixAttachmentAirtableId1' }] }),
      airtableBuilder.factory.buildChallenge({ airtableId: 'pixChallengeAirtableId2', id: 'pixChallengeId2', files: [{ fileId: 'pixAttachmentAirtableId2' }] }),
    ];
    const otherChallenges = [
      airtableBuilder.factory.buildChallenge({ airtableId: 'otherChallengeAirtableId', id: 'otherChallengeId', files: [{ fileId: 'otherAttachmentAirtableId' }] }),
    ];

    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'pixChallengeId1',
      challengeId: 'pixChallengeId1',
      locale: 'fr',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'pixChallengeId1:nl',
      challengeId: 'pixChallengeId1',
      locale: 'nl',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.pixChallengeId1.someField',
      locale: 'fr',
      value: 'challenge.pixChallengeId1.someField FR value',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.pixChallengeId1.someField',
      locale: 'nl',
      value: 'challenge.pixChallengeId1.someField NL value',
    });

    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'pixChallengeId2',
      challengeId: 'pixChallengeId2',
      locale: 'fr',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.pixChallengeId2.someField',
      locale: 'fr',
      value: 'challenge.pixChallengeId2.someField FR value',
    });

    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'otherChallengeId',
      challengeId: 'otherChallengeId',
      locale: 'fr',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.otherChallengeId.someField',
      locale: 'fr',
      value: 'challenge.otherChallengeId.someField FR value',
    });

    readChallengeScope = nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Epreuves')
      .query({})
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: [...pixChallenges, ...otherChallenges] });

    const pixAttachments = [
      airtableBuilder.factory.buildAttachment({ id: 'pixAttachmentAirtableId1' }),
      airtableBuilder.factory.buildAttachment({ id: 'pixAttachmentAirtableId2' }),
    ];
    pixAttachments[0].fields['challengeId'] = 'pixChallengeAirtableId1';
    pixAttachments[1].fields['challengeId'] = 'pixChallengeAirtableId2';
    const otherAttachments = [
      airtableBuilder.factory.buildAttachment({ id: 'otherAttachmentAirtableId' }),
    ];
    otherAttachments[0].fields['challengeId'] = 'otherChallengeAirtableId';
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      attachmentId: 'pixAttachmentAirtableId1',
      localizedChallengeId: 'pixChallengeId1',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.pixChallengeId1.someAttachmentField',
      locale: 'fr',
      value: 'challenge.pixChallengeId1.someAttachmentField FR value',
    });

    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      attachmentId: 'pixAttachmentAirtableId2',
      localizedChallengeId: 'pixChallengeId2',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.pixChallengeId2.someAttachmentField',
      locale: 'fr',
      value: 'challenge.pixChallengeId2.someAttachmentField FR value',
    });

    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      attachmentId: 'otherAttachmentAirtableId',
      localizedChallengeId: 'otherChallengeId',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.otherChallengeId.someAttachmentField',
      locale: 'fr',
      value: 'challenge.otherChallengeId.someAttachmentField FR value',
    });

    readAttachmentScope = nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Attachments')
      .query({})
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: [...pixAttachments, otherAttachments] });

    deleteThematicScope = nock('https://api.airtable.com')
      .delete('/v0/airtableBaseValue/Thematiques')
      .query({
        records: {
          '': ['pixThematicAirtableId1', 'pixThematicAirtableId2'],
        }
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, {
        records: []
      });

    deleteTubeScope = nock('https://api.airtable.com')
      .delete('/v0/airtableBaseValue/Tubes')
      .query({
        records: {
          '': ['pixTubeAirtableId1', 'pixTubeAirtableId2'],
        }
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, {
        records: []
      });

    deleteSkillScope = nock('https://api.airtable.com')
      .delete('/v0/airtableBaseValue/Acquis')
      .query({
        records: {
          '': ['pixSkillAirtableId1', 'pixSkillAirtableId2'],
        }
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, {
        records: []
      });

    deleteChallengeScope = nock('https://api.airtable.com')
      .delete('/v0/airtableBaseValue/Epreuves')
      .query({
        records: {
          '': ['pixChallengeAirtableId1', 'pixChallengeAirtableId2'],
        }
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, {
        records: []
      });

    deleteAttachmentScope = nock('https://api.airtable.com')
      .delete('/v0/airtableBaseValue/Attachments')
      .query({
        records: {
          '': ['pixAttachmentAirtableId1', 'pixAttachmentAirtableId2'],
        }
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, {
        records: []
      });
    await databaseBuilder.commit();
  });

  it('should delete all thematics, tubes, skills, challenges and attachments in PIX framework', async function() {
    // given
    const script = new ResetLearningContentInIntegrationEnvironment();

    // when
    await script.handle({
      options: { dryRun: false, sleepMs: 0 },
      logger: { info: vi.fn() },
    });

    // then
    readCompetenceScope.done();
    readThematicScope.done();
    readTubeScope.done();
    readSkillScope.done();
    readChallengeScope.done();
    readAttachmentScope.done();
    deleteThematicScope.done();
    deleteTubeScope.done();
    deleteSkillScope.done();
    deleteChallengeScope.done();
    deleteAttachmentScope.done();
    const translationsWithPix = await knex('translations').select('*').whereILike('key', '%pix%');
    const translationsWithOther = await knex('translations').select('*').whereILike('key', '%other%');
    const pixLocalizedChallenges = await knex('localized_challenges').select('*').whereILike('challengeId', '%pix%');
    const otherLocalizedChallenges = await knex('localized_challenges').select('*').whereILike('challengeId', '%other%');
    const pixLocalizedChallengeAttachments = await knex('localized_challenges-attachments').select('*').whereILike('attachmentId', '%pix%');
    const otherLocalizedChallengeAttachments = await knex('localized_challenges-attachments').select('*').whereILike('attachmentId', '%other%');
    expect(translationsWithPix.length).to.equal(2); // competence translations left
    expect(translationsWithOther.length).to.equal(5); // noise translations left
    expect(pixLocalizedChallenges.length).to.equal(0);
    expect(otherLocalizedChallenges.length).to.equal(1); // noise localized left
    expect(pixLocalizedChallengeAttachments.length).to.equal(0);
    expect(otherLocalizedChallengeAttachments.length).to.equal(1); // noise localized left
  });

  it('should do no deletion at all when dry run is enabled', async function() {
    // given
    const script = new ResetLearningContentInIntegrationEnvironment();

    // when
    await script.handle({
      options: { dryRun: true, sleepMs: 0 },
      logger: { info: vi.fn() },
    });

    // then
    readCompetenceScope.done();
    readThematicScope.done();
    readTubeScope.done();
    readSkillScope.done();
    readChallengeScope.done();
    readAttachmentScope.done();
    expect(deleteThematicScope.isDone()).to.be.false;
    expect(deleteTubeScope.isDone()).to.be.false;
    expect(deleteSkillScope.isDone()).to.be.false;
    expect(deleteChallengeScope.isDone()).to.be.false;
    expect(deleteAttachmentScope.isDone()).to.be.false;
    const translationsWithPix = await knex('translations').select('*').whereILike('key', '%pix%');
    const translationsWithOther = await knex('translations').select('*').whereILike('key', '%other%');
    const pixLocalizedChallenges = await knex('localized_challenges').select('*').whereILike('challengeId', '%pix%');
    const otherLocalizedChallenges = await knex('localized_challenges').select('*').whereILike('challengeId', '%other%');
    const pixLocalizedChallengeAttachments = await knex('localized_challenges-attachments').select('*').whereILike('attachmentId', '%pix%');
    const otherLocalizedChallengeAttachments = await knex('localized_challenges-attachments').select('*').whereILike('attachmentId', '%other%');
    expect(translationsWithPix.length).to.equal(13);
    expect(translationsWithOther.length).to.equal(5);
    expect(pixLocalizedChallenges.length).to.equal(3);
    expect(otherLocalizedChallenges.length).to.equal(1);
    expect(pixLocalizedChallengeAttachments.length).to.equal(2);
    expect(otherLocalizedChallengeAttachments.length).to.equal(1);
  });
});
