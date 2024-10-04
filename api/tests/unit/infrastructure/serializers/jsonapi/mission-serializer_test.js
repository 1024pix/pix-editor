import { describe, expect, it } from 'vitest';
import { Mission } from '../../../../../lib/domain/models/Mission.js';
import { deserializeMission } from '../../../../../lib/infrastructure/serializers/jsonapi/mission-serializer.js';

describe('Unit | Serializer | JSONAPI | mission-serializer', () => {
  describe('#deserialize', () => {
    it('should deserialize a Mission', () => {

      const expectedMission = new Mission({
        id: 12,
        learningObjectives_i18n: { fr: 'learning objectives-value', },
        name_i18n: { fr: 'Mission Name', },
        cardImageUrl: 'card-image-url',
        validatedObjectives_i18n: { fr: 'validated-objectives-value', },
        competenceId: 'rec12E12EFZF',
        thematicIds: 'someThematicIds',
        learningObjectives: 'learning objectives-value',
        validatedObjectives: 'validated-objectives-value',
        introductionMediaUrl: 'introduction-media-url-value',
        introductionMediaType: 'introduction-media-type-value',
        introductionMediaAlt_i18n: { fr: 'introduction-media-alt-value' },
        documentationUrl: 'www.test.com',
        status: 'EXPERIMENTAL',
      });

      const attributes = {
        id: expectedMission.id,
        name: expectedMission.name_i18n.fr,
        'card-image-url': expectedMission.cardImageUrl,
        'competence-id': expectedMission.competenceId,
        'thematic-ids': expectedMission.thematicIds,
        'learning-objectives': expectedMission.learningObjectives_i18n.fr,
        'validated-objectives': expectedMission.validatedObjectives_i18n.fr,
        'introduction-media-url': expectedMission.introductionMediaUrl,
        'introduction-media-type': expectedMission.introductionMediaType,
        'introduction-media-alt':  expectedMission.introductionMediaAlt_i18n.fr,
        'documentation-url': expectedMission.documentationUrl,
        status: expectedMission.status
      };
      const deserializedMission = deserializeMission(attributes);

      expect(deserializedMission).to.deep.equal(expectedMission);
    });

    it('should deserialize empty string into null value', () => {

      const expectedMission = new Mission({ id: 12 });

      const attributes = {
        id: expectedMission.id,
        'card-image-url': '',
        'introduction-media-url': '',
        'introduction-media-type': '',
        'documentation-url': '',
      };
      const deserializedMission = deserializeMission(attributes);

      expect(deserializedMission.cardImageUrl).to.be.null;
      expect(deserializedMission.introductionMediaUrl).to.be.null;
      expect(deserializedMission.introductionMediaType).to.be.null;
      expect(deserializedMission.documentationUrl).to.be.null;
    });
  });
});

