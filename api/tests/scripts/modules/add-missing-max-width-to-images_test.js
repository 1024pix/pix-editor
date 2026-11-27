import { describe, expect, it } from 'vitest';

import { databaseBuilder, domainBuilder, knex } from '../../test-helper.js';
import { AddMissingMaxWidthToImagesScript } from '../../../scripts/modules/add-missing-max-width-to-images.js';
import { logger } from '../../../lib/infrastructure/logger.js';
import { User } from '../../../lib/domain/models/index.js';

describe('Acceptance | Script | AddMissingMaxWidthToImagesScript', () => {
  it('adds a maxWidth set to 0 to images of modules and draft modules', async () => {
    // given
    const image = {
      id: crypto.randomUUID(),
      type: 'image',
      url: 'https://assets.pix.org/modules/image.svg',
      alt: 'Une image',
      alternativeText: '',
      legend: '',
      licence: '',
    };
    const grain = { id: crypto.randomUUID(), type: 'challenge', title: 'Grain', components: [{ type: 'element', element: image }] };
    const module = domainBuilder.buildModule({
      internalTitle: 'module-to-fix',
      version: '1.0',
      sections: [{ id: crypto.randomUUID(), type: 'question-yourself', grains: [grain] }],
    });
    const draftModule = domainBuilder.buildDraftModule({
      ...module,
      moduleId: module.id,
      version: '1.1',
    });

    const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN, trigram: 'BOT', apiKey: crypto.randomUUID() });

    databaseBuilder.factory.buildUser(user);
    databaseBuilder.factory.buildModule(module);
    databaseBuilder.factory.buildDraftModule(draftModule);
    await databaseBuilder.commit();

    // when
    await new AddMissingMaxWidthToImagesScript().handle({ options: { dryRun: false, userId: user.id }, logger });

    // then
    const imageMaxWidth = knex.raw("sections #> '{0,grains,0,components,0,element,maxWidth}' as \"maxWidth\"");

    const updatedModules = await knex('modules').select('version', imageMaxWidth);
    const expectedModules = [{ version: '2.0', maxWidth: 0 }];
    expect(updatedModules).toStrictEqual(expectedModules);

    const updatedDraftModules = await knex('draft-modules').select('version', imageMaxWidth);
    const expectedDraftModules = [{ version: '2.1', maxWidth: 0 }];
    expect(updatedDraftModules).toStrictEqual(expectedDraftModules);
  });
});
