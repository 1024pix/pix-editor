import { describe, expect, it } from 'vitest';
import { Skill } from '../../../../../lib/domain/models/index.js';
import { deserialize, serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/skill-serializer.js';

describe('Unit | Serializer | JSONAPI | skill-serializer', () => {
  describe('#deserialize', () => {
    it('should deserialize a skill', async () => {
      const expectedSkill = new Skill({
        id: 'skillId',
        airtableId: 'skillAirtableId',
        name: '@skill1',
        description: 'description skill1',
        descriptionStatus: Skill.DESCRIPTION_STATUSES.A_RETRAVAILLER,
        hint_i18n: {
          fr: 'ma clé fr',
          en: 'my en key',
        },
        hintStatus: Skill.HINT_STATUSES.A_RETRAVAILLER,
        tutorialIds: undefined,
        tutorialAirtableIds: ['tutoAirtableId1'],
        learningMoreTutorialIds: undefined,
        learningMoreTutorialAirtableIds: ['tutoMoreAirtableId1'],
        pixValue: 2,
        competenceId: 'competenceId',
        internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
        status: Skill.STATUSES.ACTIF,
        tubeId: undefined,
        tubeAirtableId: 'tubeAirtableId1',
        version: 2,
        level: 1,
        challengeIds: ['challId1', 'challId2'],
        createdAt: new Date('2023-10-23T18:06:00Z'),
      });

      const attributes = {
        'pix-id': expectedSkill.id,
        name: expectedSkill.name,
        description: expectedSkill.description,
        'description-status': Skill.DESCRIPTION_STATUSES.A_RETRAVAILLER,
        clue: expectedSkill.hint_i18n.fr,
        'clue-en': expectedSkill.hint_i18n.en,
        'clue-status': Skill.HINT_STATUSES.A_RETRAVAILLER,
        'pix-value': expectedSkill.pixValue,
        'competence-id': expectedSkill.competenceId,
        i18n: Skill.INTERNATIONALISATIONS.FRANCE,
        status: Skill.STATUSES.ACTIF,
        version: expectedSkill.version,
        level: expectedSkill.level,
        'challenge-ids': expectedSkill.challengeIds,
        'created-at': expectedSkill.createdAt,
      };

      const payload = {
        data: {
          type: 'skills',
          id: expectedSkill.airtableId,
          attributes,
          relationships: {
            tube: {
              data: {
                type: 'tubes',
                id: expectedSkill.tubeAirtableId,
              },
            },
            'tuto-more': {
              data: [
                {
                  type: 'tutorials',
                  id: expectedSkill.learningMoreTutorialAirtableIds[0],
                },
              ],
            },
            'tuto-solution': {
              data: [
                {
                  type: 'tutorials',
                  id: expectedSkill.tutorialAirtableIds[0],
                },
              ],
            },
          },
        },
      };

      // when
      const deserializedSkill = await deserialize(payload);

      expect(deserializedSkill).to.deep.equal(expectedSkill);
    });
  });

  describe('#serialize', () => {
    it('should serialize a skill', () => {
      const skill = new Skill({
        id: 'skillId',
        airtableId: 'skillAirtableId',
        name: '@skill1',
        description: 'description skill1',
        descriptionStatus: Skill.DESCRIPTION_STATUSES.A_RETRAVAILLER,
        hint_i18n: {
          fr: 'ma clé fr',
          en: 'my en key',
        },
        hintStatus: Skill.HINT_STATUSES.A_RETRAVAILLER,
        tutorialIds: undefined,
        tutorialAirtableIds: ['tutoAirtableId1'],
        learningMoreTutorialIds: undefined,
        learningMoreTutorialAirtableIds: ['tutoMoreAirtableId1'],
        pixValue: 2,
        competenceId: 'competenceId',
        internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
        status: Skill.STATUSES.ACTIF,
        tubeId: undefined,
        tubeAirtableId: 'tubeAirtableId1',
        version: 2,
        level: 1,
        challengeIds: ['challId1', 'challId2'],
        createdAt: new Date('2023-10-23T18:06:00Z'),
      });

      const attributes = {
        'pix-id': skill.id,
        name: '@skill1',
        description: 'description skill1',
        'description-status': Skill.DESCRIPTION_STATUSES.A_RETRAVAILLER,
        clue: skill.hint_i18n.fr,
        'clue-en': skill.hint_i18n.en,
        'clue-status': Skill.HINT_STATUSES.A_RETRAVAILLER,
        i18n: Skill.INTERNATIONALISATIONS.FRANCE,
        status: Skill.STATUSES.ACTIF,
        version: 2,
        level: 1,
        'created-at': new Date('2023-10-23T18:06:00Z'),
      };

      const payload = {
        data: {
          type: 'skills',
          id: skill.airtableId,
          attributes,
          relationships: {
            tube: {
              data: {
                type: 'tubes',
                id: skill.tubeAirtableId,
              },
            },
            'tuto-more': {
              data: [
                {
                  type: 'tutorials',
                  id: skill.learningMoreTutorialAirtableIds[0],
                },
              ],
            },
            'tuto-solution': {
              data: [
                {
                  type: 'tutorials',
                  id: skill.tutorialAirtableIds[0],
                },
              ],
            },
            challenges: {
              data: [
                {
                  id: skill.challengeIds[0],
                  type: 'challenges',
                },
                {
                  id: skill.challengeIds[1],
                  type: 'challenges',
                },
              ],
            },
            'challenges-production': { links: { related: '/api/skills/skillId/challenges-production' } },
          },
        },
      };

      const serializedSkill = serialize(skill);

      expect(serializedSkill).to.deep.equal(payload);
    });
  });
});
