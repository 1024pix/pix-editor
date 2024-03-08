import { beforeEach, describe, expect, it } from 'vitest';
import { airtableBuilder } from '../test-helper.js';
import nock from 'nock';
import Airtable from 'airtable';
import { deleteUnreferencedTranslationsInAirtable } from '../../scripts/delete-unreferenced-translations/index.js';

const {
  buildArea,
  buildChallenge,
  buildCompetence,
  buildFramework,
  buildSkill,
  buildThematic,
  buildTranslation,
  buildTube,
} = airtableBuilder.factory;

describe('Script | delete-unreferenced-translations', () => {
  let airtableClient;

  beforeEach(() => {
    const currentContent = {
      frameworks: [{
        id: 'recFramework0',
        name: 'Nom du referentiel'
      }],
      areas: [
        {
          id: 'recArea0',
          competenceIds: ['recCompetence0'],
          competenceAirtableIds: ['recCompetence123'],
          frameworkId: 'recFramework0',
        },
        {
          id: 'recArea1',
          competenceIds: ['recCompetence1'],
          competenceAirtableIds: ['recCompetence456'],
          frameworkId: 'recFramework0',
        }
      ],
      competences: [
        {
          id: 'recCompetence0',
          areaId: '1',
          skillIds: ['recSkill0'],
          thematicIds: ['recThematic0'],
        },
        {
          id: 'recCompetence1',
          areaId: '1',
          skillIds: ['recSkill1'],
          thematicIds: ['recThematic1'],
        }
      ],
      thematics: [
        {
          id: 'recThematic0',
          competenceId: 'recCompetence0',
          tubeIds: ['recTube0'],
        },
        {
          id: 'recThematic1',
          competenceId: 'recCompetence1',
          tubeIds: ['recTube1'],
        }
      ],
      tubes: [
        {
          id: 'recTube0',
          competenceId: 'recCompetence0',
          thematicId: 'recThematic0',
          skillIds: ['recSkill0'],
        },
        {
          id: 'recTube1',
          competenceId: 'recCompetence1',
          thematicId: 'recThematic1',
          skillIds: ['recSkill1'],
        }
      ],
      skills: [
        {
          id: 'recSkill0',
          tutorialIds: [],
          learningMoreTutorialIds: [],
          competenceId: 'recCompetence0',
          tubeId: 'recTube0',
        },
        {
          id: 'recSkill1',
          tutorialIds: [],
          learningMoreTutorialIds: [],
          competenceId: 'recCompetence1',
          tubeId: 'recTube1',
        }
      ],
      challenges: [
        {
          id: 'recChallenge0',
          skillId: 'recSkill0',
          competenceId: 'recCompetence0',
        },
        {
          id: 'recChallenge1',
          skillId: 'recSkill1',
          competenceId: 'recCompetence1',
        }
      ],
    };
    const translations = [
      {
        id: 'translationArea0',
        key: 'area.recArea0.field',
      },
      {
        id: 'translationArea1',
        key: 'area.recArea1.field',
      },
      {
        id: 'translationArea2',
        key: 'area.recArea2.field',
      },
      {
        id: 'translationCompetence0',
        key: 'competence.recCompetence0.field',
      },
      {
        id: 'translationCompetence1',
        key: 'competence.recCompetence1.field',
      },
      {
        id: 'translationCompetence2',
        key: 'competence.recCompetence2.field',
      },
      {
        id: 'translationChallenge0',
        key: 'challenge.recChallenge0.field',
      },
      {
        id: 'translationChallenge1',
        key: 'challenge.recChallenge1.field',
      },
      {
        id: 'translationChallenge2',
        key: 'challenge.recChallenge2.field',
      },
      {
        id: 'translationSkill0',
        key: 'skill.recSkill0.field',
      },
      {
        id: 'translationSkill1',
        key: 'skill.recSkill1.field',
      },
      {
        id: 'translationSkill2',
        key: 'skill.recSkill2.field',
      },
    ].map(buildTranslation);
    airtableBuilder.mockLists({
      areas: currentContent.areas.map(buildArea),
      attachments: [],
      challenges: currentContent.challenges.map(buildChallenge),
      competences: currentContent.competences.map(buildCompetence),
      frameworks: currentContent.frameworks.map(buildFramework),
      skills: currentContent.skills.map(buildSkill),
      thematics: currentContent.thematics.map(buildThematic),
      tubes: currentContent.tubes.map(buildTube),
      tutorials: [],
      translations,
    });
    airtableClient = new Airtable({
      apiKey: 'airtableApiKeyValue',
    }).base('airtableBaseValue');
  });

  it('should delete translations that are not linked to any entities in Airtable when dryRun disabled', async() => {
    // given
    const deletedIds = ['translationArea2', 'translationCompetence2', 'translationChallenge2', 'translationSkill2'];
    const deleteCommand = nock('https://api.airtable.com')
      .delete('/v0/airtableBaseValue/translations')
      .query({
        records: {
          '': deletedIds,
        } })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .matchHeader('content-type', 'application/json')
      .reply(200, {
        records: deletedIds.map((id) => ({
          deleted: true,
          id,
        }))
      });

    // when
    await deleteUnreferencedTranslationsInAirtable({ dryRun: false, airtableClient });

    // then
    expect(deleteCommand.isDone()).to.be.true;
  });

  it('should not delete anything if dryRun enabled', async() => {
    // given
    const deletedIds = ['translationArea2', 'translationCompetence2', 'translationChallenge2', 'translationSkill2'];
    const deleteCommand = nock('https://api.airtable.com')
      .delete('/v0/airtableBaseValue/translations')
      .query({
        records: {
          '': deletedIds,
        } })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .matchHeader('content-type', 'application/json')
      .reply(200, {
        records: deletedIds.map((id) => ({
          deleted: true,
          id,
        }))
      });

    // when
    await deleteUnreferencedTranslationsInAirtable({ airtableClient });

    // then
    expect(deleteCommand.isDone()).to.be.false;
  });
});
