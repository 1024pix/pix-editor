import { describe, expect, it } from 'vitest';
import { serialize } from '../../../../../lib/infrastructure/serializers/html/external-urls-serializer.js';

describe('Unit | Serializer | HTML | external-urls-serializer', () => {
  describe('#serialize', () => {
    it('serializes external urls', () => {
      // given
      const externalUrls = {
        challengeExternalUrls: [
          {
            id: expect.any(Number),
            framework_name: 'Pix',
            competence_name: 'Nom de competence',
            skill_name: '@patateDouce',
            challenge_id: 'challenge1',
            challenge_status: 'validé',
            locale: 'nl',
            url: 'https://ui.pix.org',
          },
          {
            id: expect.any(Number),
            framework_name: 'Pix',
            competence_name: 'Nom de competence',
            skill_name: '@patateDouce',
            challenge_id: 'challenge2',
            challenge_status: 'validé',
            locale: 'fr',
            url: 'https://ui.pix.fr',
          },
        ],
        tutorialExternalUrls: [
          {
            id: expect.any(Number),
            competence_name: 'Nom de competence',
            skill_name: '@patateDouce',
            tutorial_id: 'tutorial1',
            url: 'http://commant-pix-ui-fonctionne.org',
          },
        ],
      };

      const expectedHtml = '<!DOCTYPE html><html><body><ul><li><a href="https://ui.pix.org">Épreuve | Acquis: @patateDouce, ChallengeId: challenge1</a></li><li><a href="https://ui.pix.fr">Épreuve | Acquis: @patateDouce, ChallengeId: challenge2</a></li><li><a href="http://commant-pix-ui-fonctionne.org">Tutoriel | Acquis: @patateDouce, TutorialId: tutorial1</a></li></ul></body></html>';

      // when
      const serializedExternalUrls = serialize(externalUrls);

      // then
      expect(serializedExternalUrls).toStrictEqual(expectedHtml);
    });
  });
});
