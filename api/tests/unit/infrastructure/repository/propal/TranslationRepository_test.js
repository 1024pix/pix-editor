import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { translationDatasource } from '../../../../../lib/infrastructure/datasources/airtable/index.js';
import { TranslationRepository } from '../../../../../lib/infrastructure/repositories/propal/index.js';

describe('Unit | Repository | TranslationRepository', () => {
  let translationRepository;
  beforeEach(function() {
    translationRepository = new TranslationRepository();
  });
  describe('#save', () => {
    context('when the duplication to airtable is allowed', function() {
      it('should call the method', async function() {

        vi.spyOn(translationDatasource, 'exists').mockImplementation(()=> true);
        vi.spyOn(translationDatasource, 'upsert').mockImplementation(()=> []);

        await translationRepository.save({
          translations: [{ key: 'entity.recordid.key',
            locale: 'fr',
            value: 'translationValue'
          }]
        });

        expect(translationDatasource.exists).toHaveBeenCalledOnce();

      });
    });

    context('when the duplication to airtable is not allowed', function() {
      it('should not call the method', async function() {

        const shouldDuplicateToAirtable = false;
        vi.spyOn(translationDatasource, 'exists');
        vi.spyOn(translationDatasource, 'upsert');

        await translationRepository.save({
          translations: [{ key: 'entity.recordid.key',
            locale: 'fr',
            value: 'translationValue'
          }],
          shouldDuplicateToAirtable
        });

        expect(translationDatasource.exists).not.toHaveBeenCalled();
        expect(translationDatasource.upsert).not.toHaveBeenCalled();
      });
    });

  });
});
