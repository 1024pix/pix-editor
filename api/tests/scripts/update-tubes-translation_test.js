import * as url from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { databaseBuilder, knex } from '../test-helper.js';
import { UpdateTubesTranslationScript, getTubeIdsFromPixFramework } from '../../scripts/update-tubes-translation.js';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

describe('Script | UpdateTubesTranslationScript', () => {
  let script;
  let logger;

  beforeEach(() => {
    script = new UpdateTubesTranslationScript();
    logger = {
      info: vi.fn(),
      error: vi.fn(),
    };
  });

  describe('#getTubeIdsFromPixFramework', () => {
    it('return tubes from Pix Framework', async() => {
      databaseBuilder.factory.buildChallengeInGroup({ framework: { name: 'POUET' } });
      const { thematic, tube } = databaseBuilder.factory.buildChallengeInGroup({});
      databaseBuilder.factory.buildTube({ id: 12, name: '@tube_un', thematicId: thematic.id });
      databaseBuilder.factory.buildTube({ id: 13, name: '@tube_un', thematicId: thematic.id });

      await databaseBuilder.commit();

      const tubes = await getTubeIdsFromPixFramework();
      expect(tubes).lengthOf(3);
      expect(tubes).deep.members([{ id: tube.id, name: tube.name }, { id: '12', name: '@tube_un' }, { id: '13', name: '@tube_un' }]);
    });
  });

  describe('#handle', () => {
    it('update only given tubes translation', async () => {
      // given
      const { thematic } = databaseBuilder.factory.buildChallengeInGroup({});
      const tubeToUpdate = databaseBuilder.factory.buildTube({ id: 1, name: '@tube_un', thematicId: thematic.id });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeToUpdate.id}.practicalTitle`,
        locale: 'fr',
        value: 'mon titre',
      });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeToUpdate.id}.practicalTitle`,
        locale: 'en',
        value: 'my title',
      });

      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeToUpdate.id}.practicalDescription`,
        locale: 'fr',
        value: 'ma description',
      });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeToUpdate.id}.practicalDescription`,
        locale: 'en',
        value: 'my description',
      });

      await databaseBuilder.commit();

      // when
      const testCsvFile = `${currentDirectory}files/update-tubes-translation-ok.csv`;
      const { options: scriptMeta } = script.metaInfo;
      const fileData = await scriptMeta.file.coerce(testCsvFile);

      const options = {
        file: fileData,
        dryRun: false,
      };

      await script.handle({ options, logger });

      // then
      const { value: frTitleTranslation } = await knex('translations').select('value').where({ key: `tube.${tubeToUpdate.id}.practicalTitle`, locale: 'fr' }).first();
      expect(frTitleTranslation).equal('mon_nouveau_titre');

      const { value: frDescriptionTranslation } = await knex('translations').select('value').where({ key: `tube.${tubeToUpdate.id}.practicalDescription`, locale: 'fr' }).first();
      expect(frDescriptionTranslation).equal('ma_nouvelle_description');

      const { value: enTitleTranslation } = await knex('translations').select('value').where({ key: `tube.${tubeToUpdate.id}.practicalTitle`, locale: 'en' }).first();
      expect(enTitleTranslation).equal('my title');

      const { value: enDescriptionTranslation } = await knex('translations').select('value').where({ key: `tube.${tubeToUpdate.id}.practicalDescription`, locale: 'en' }).first();
      expect(enDescriptionTranslation).equal('my description');

      expect(logger.info).toHaveBeenCalledWith('Successfully updated translations for 1 tube(s)');
    });
  });
});
