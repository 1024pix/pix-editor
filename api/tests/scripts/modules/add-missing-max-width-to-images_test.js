import { describe, expect, it } from 'vitest';

import { databaseBuilder, domainBuilder, knex } from '../../test-helper.js';
import { AddMissingMaxWidthToImages } from '../../../scripts/modules/add-missing-max-width-to-images.js';
import { logger } from '../../../lib/infrastructure/logger.js';

describe('Acceptance | Script | AddMissingMaxWidthToImages', () => {
  it('adds a maxWidth set to 0 to images of modules and draft modules', async () => {
    // given
    const module = domainBuilder.buildModule({
      internalTitle: 'module-to-fix',
      version: '1.0',
      sections: buildSectionsWithImage(buildImageElement()),
    });
    const draftOfModule = domainBuilder.buildDraftModule({
      ...module,
      moduleId: module.id,
      version: '1.1',
      sections: buildSectionsWithImage(buildImageElement()),
    });

    databaseBuilder.factory.buildModule(module);
    databaseBuilder.factory.buildDraftModule(draftOfModule);
    await databaseBuilder.commit();

    // when
    await new AddMissingMaxWidthToImages().handle({ options: { dryRun: false }, logger });

    // then
    const imageMaxWidth = knex.raw("sections #> '{0,grains,0,components,0,element,maxWidth}' as \"maxWidth\"");

    const returnedModules = knex('modules').select('version', imageMaxWidth);
    await expect(returnedModules).resolves.toStrictEqual([{ version: '2.0', maxWidth: 0 }]);

    const returnedDraftModules = knex('draft-modules').select('version', imageMaxWidth);
    await expect(returnedDraftModules).resolves.toStrictEqual([{ version: '2.1', maxWidth: 0 }]);
  });
});

function buildSectionsWithImage(image) {
  return [
    {
      id: crypto.randomUUID(),
      type: 'question-yourself',
      grains: [
        {
          id: crypto.randomUUID(),
          type: 'challenge',
          title: 'Grain',
          components: [{ type: 'element', element: image }],
        },
      ],
    },
  ];
}

function buildImageElement() {
  return {
    id: crypto.randomUUID(),
    type: 'image',
    url: 'https://assets.pix.org/modules/image.svg',
    alt: 'Une image',
    alternativeText: '',
    legend: '',
    licence: '',
  };
}
