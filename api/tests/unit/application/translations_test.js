import { describe, expect, it, vi } from 'vitest';
import { hFake } from '../../test-helper';
import { importTranslationsHandler } from '../../../lib/application/translations';
import * as exports from '../../../lib/domain/usecases/import-translations';
import fs from 'node:fs';

describe('Unit | Controller | translations controller', function() {
  describe('PATCH /translations.csv', function() {
    it('throws error when importTranslations usecase returns unexpected error', async function() {
      // Given
      vi.spyOn(fs, 'createReadStream').mockResolvedValue();
      const mockRequest = { payload : { file: { path: '/tmp/file-path.csv' } } };
      vi.spyOn(exports, 'importTranslations').mockRejectedValue(new Error('unexpected'));

      // When
      expect(importTranslationsHandler(mockRequest, hFake)).rejects.toThrow();
    });
  });
});

