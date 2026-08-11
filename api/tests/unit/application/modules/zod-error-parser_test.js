import { expect, describe, describe as context, it } from 'vitest';
import { zodErrorParser } from '../../../../lib/application/modules/zod-error-parser.js';

describe('Unit | Infrastructure | Datasources | Learning Content | Module Datasource | zod error parser', function() {
  it('should parse schema errors', async function() {
    const data = {
      id: 'f7b3a2-1a3d8f7e9f5d',
      grains: [
        {
          components: [
            {
              element: {
                id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
                type: 'videox',
                title: 'Le format des adresses mail',
                url: 'https://videos.pix.fr/modulix/chat_animation_2.mp4',
                subtitles: 'https://videos.pix.fr/modulix/chat_animation_2.vtt',
                transcription: '<p>Coucou</p>',
              },
            },
          ],
        },
        undefined,
        undefined,
        undefined,
        undefined,
        { id: 'b7ea7630-824' },
      ],
    };

    const error = {
      issues: [
        {
          message: '"id" doit être un GUID valide',
          path: ['id'],
          code: 'invalid_format',
        },
        {
          message: '"grains[0].components[0].element" ne correspond à aucun type autorisé',
          path: [
            'grains',
            0,
            'components',
            0,
            'element',
          ],
          code: 'invalid_union',
        },
        {
          message: '"grains[5].id" doit être un GUID valide',
          path: [
            'grains',
            5,
            'id',
          ],
          code: 'invalid_format',
        },
      ],
    };

    const expectedLog = `
============================================================

Erreur: "id" doit être un GUID valide.
Valeur concernée à rechercher : "f7b3a2-1a3d8f7e9f5d"

────────────────────────────────────────────────────────────

Erreur: "grains[0].components[0].element" ne correspond à aucun type autorisé.
Valeur concernée à rechercher : {"id":"3a9f2269-99ba-4631-b6fd-6802c88d5c26","type":"videox","title":"Le format des adresses mail","url":"https://videos.pix.fr/modulix/chat_animation_2.mp4","subtitles":"https://videos.pix.fr/modulix/chat_animation_2.vtt","transcription":"<p>Coucou</p>"}

────────────────────────────────────────────────────────────

Erreur: "grains[5].id" doit être un GUID valide.
Valeur concernée à rechercher : "b7ea7630-824"

============================================================
`;

    expect(zodErrorParser.format({ error, data })).to.equal(expectedLog);
  });

  context('when separators in parameters are empty string', function() {
    it('should parse schema errors without adding separators', async function() {
      const data = { id: 'f7b3a2-1a3d8f7e9f5d' };
      const error = {
        issues: [
          {
            message: '"id" doit être un GUID valide',
            path: ['id'],
            code: 'invalid_format',
          },
        ],
      };

      const expectedLog = `\nErreur: "id" doit être un GUID valide.
Valeur concernée à rechercher : "f7b3a2-1a3d8f7e9f5d"\n`;
      expect(zodErrorParser.format({ error, data, objectErrorSeparator: '', visualSeparator: '' })).to.equal(expectedLog);
    });
  });

  it('should parse html errors', async function() {
    const error = {
      issues: [
        {
          message: 'htmlvalidationerror',
          path: [
            'grains',
            2,
            'components',
            0,
            'element',
            'feedbacks',
            'invalid',
          ],
          code: 'custom',
          params: {
            value: {
              valid: false,
              results: [
                {
                  filePath: 'inline',
                  messages: [
                    {
                      ruleId: 'attr-quotes',
                      severity: 2,
                      message: 'Attribute "aria-hidden" used \' instead of expected "',
                      offset: 58,
                      line: 1,
                      column: 59,
                      size: 18,
                      selector: 'p > span',
                      ruleUrl: 'https://html-validate.org/rules/attr-quotes.html',
                      context: {
                        error: 'style',
                        attr: 'aria-hidden',
                        actual: '\'',
                        expected: '"',
                      },
                    },
                  ],
                  errorCount: 1,
                  warningCount: 0,
                  source: "<p>Incorrect. Remonter la page pour relire la leçon <span aria-hidden='true'>⬆</span></p>",
                },
              ],
              errorCount: 1,
              warningCount: 0,
            },
          },
        },
      ],
    };

    const expectedLog = `
============================================================


Chemin : grains.2.components.0.element.feedbacks.invalid

Error(attr-quotes): Attribute "aria-hidden" used ' instead of expected "
https://html-validate.org/rules/attr-quotes.html

Valeur concernée à rechercher :
<p>Incorrect. Remonter la page pour relire la leçon <span aria-hidden='true'>⬆</span></p>

============================================================
`;

    expect(zodErrorParser.format({ error })).to.equal(expectedLog);
  });
});
