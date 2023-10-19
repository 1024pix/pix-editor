import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';
import {
  migrateChallengesTranslationFromAirtable
} from '../../scripts/migrate-challenges-translation-from-airtable/index.js';

describe('Migrate translation from airtable', function() {

  let airtableClient;

  beforeEach(() => {
    nock('https://api.airtable.com')
      .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .optionally()
      .reply(404);

    airtableClient = new Airtable({
      apiKey: 'airtableApiKeyValue',
    }).base('airtableBaseValue');
  });

  afterEach(async () => {
    await knex('translations').truncate();
  });

  it('fills translations table', async function() {
    // given
    const challenge = {
      id: 'airtableChallengeId',
      fields: {
        'id persistant': 'challengeid1',
        Consigne: 'instruction',
        'Consigne alternative': 'alternativeInstruction',
        Propositions: 'proposals',
        'Bonnes réponses': 'solution',
        'Bonnes réponses à afficher': 'solutionToDisplay',
        Langues: ['Franco Français'],
      }
    };

    const challenges = [challenge];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Epreuves')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query({
        fields: {
          '': [
            'id persistant',
            'Consigne',
            'Consigne alternative',
            'Propositions',
            'Bonnes réponses',
            'Bonnes réponses à afficher',
            'Langues',
          ]
        }
      })
      .reply(200, { records: challenges });

    // when
    await migrateChallengesTranslationFromAirtable({ airtableClient });

    // then
    const translations = await knex('translations').select().orderBy([{
      column: 'key',
      order: 'asc'
    }, { column: 'locale', order: 'asc' }]);

    expect(translations).to.have.lengthOf(5);
    expect(translations).to.deep.equal([
      {
        key: 'challenge.challengeid1.alternativeInstruction',
        locale: 'fr-fr',
        value: 'alternativeInstruction'
      },
      {
        key: 'challenge.challengeid1.instruction',
        locale: 'fr-fr',
        value: 'instruction'
      },
      {
        key: 'challenge.challengeid1.proposals',
        locale: 'fr-fr',
        value: 'proposals'
      },
      {
        key: 'challenge.challengeid1.solution',
        locale: 'fr-fr',
        value: 'solution'
      },
      {
        key: 'challenge.challengeid1.solutionToDisplay',
        locale: 'fr-fr',
        value: 'solutionToDisplay'
      }
    ]);
  });
});
