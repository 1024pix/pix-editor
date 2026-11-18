import { describe, expect, it } from 'vitest';
import { deserialize } from '../../../../../lib/infrastructure/serializers/phrase/translation-serializer.js';
import { Translation } from '../../../../../lib/domain/models/index.js';

describe('Unit | Serializer | translation-deserializer', () => {
  describe('#deserialize', () => {
    it('deserializes a translation', () => {
      // given
      const payload = {
        translation: {
          key: { name: 'challenge.challengeId.proposals' },
          locale: { name: 'fr' },
          content: '\'-proposition 1 \n -proposition 2',
        },
      };

      // when
      const deserializedTranslation = deserialize(payload);

      // then
      expect(deserializedTranslation).toStrictEqual(
        new Translation(
          {
            key: 'challenge.challengeId.proposals',
            locale: 'fr',
            value: '-proposition 1 \n -proposition 2',
          },
        ),
      );
    });
  });
});
