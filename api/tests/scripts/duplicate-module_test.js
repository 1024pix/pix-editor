import fs from 'node:fs';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { DuplicateModule } from '../../scripts/duplicate-module.js';
import { logger } from '../../lib/infrastructure/logger.js';

describe('Script | DuplicateModule', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#handle', () => {
    it('reads the source module from an arbitrary path and writes the result in the same directory', async () => {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        shortId: '6a68bf32',
      };
      const sourcePath = path.resolve('/some/other/place/bac-a-sable.json');
      vi.spyOn(fs, 'existsSync').mockImplementation((filePath) => filePath === sourcePath);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(moduleData));
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      const script = new DuplicateModule();

      // when
      await script.handle({ options: { source: sourcePath }, logger });

      // then
      expect(fs.readFileSync).toHaveBeenCalledWith(sourcePath, 'utf-8');
      const [writtenPath, writtenContent] = fs.writeFileSync.mock.calls[0];
      expect(writtenPath).toBe(path.resolve('/some/other/place/bac-a-sable_copie.json'));
      const writtenModuleData = JSON.parse(writtenContent);
      expect(writtenModuleData.slug).toBe('bac-a-sable-copie');
      expect(writtenModuleData.title).toBe('Bac à sable (copie)');
      expect(writtenModuleData.id).not.toBe(moduleData.id);
    });

    it('resolves a relative source path against the current working directory', async () => {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        shortId: '6a68bf32',
      };
      const expectedSourcePath = path.resolve('bac-a-sable.json');
      vi.spyOn(fs, 'existsSync').mockImplementation((filePath) => filePath === expectedSourcePath);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(moduleData));
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      const script = new DuplicateModule();

      // when
      await script.handle({ options: { source: 'bac-a-sable.json' }, logger });

      // then
      expect(fs.readFileSync).toHaveBeenCalledWith(expectedSourcePath, 'utf-8');
    });

    it('logs the created file path', async () => {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        shortId: '6a68bf32',
      };
      const sourcePath = path.resolve('bac-a-sable.json');
      vi.spyOn(fs, 'existsSync').mockImplementation((filePath) => filePath === sourcePath);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(moduleData));
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      const infoLogger = { info: vi.fn() };
      const script = new DuplicateModule();

      // when
      await script.handle({ options: { source: 'bac-a-sable.json' }, logger: infoLogger });

      // then
      expect(infoLogger.info).toHaveBeenCalledExactlyOnceWith(
        `Module dupliqué : ${path.resolve('bac-a-sable_copie.json')}`,
      );
    });

    it('throws when the source file does not exist', async () => {
      // given
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      const script = new DuplicateModule();

      // when
      const err = await script.handle({ options: { source: 'missing.json' }, logger }).catch((e) => e);

      // then
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatch(/n'existe pas\.$/);
    });

    it('throws when the target file already exists', async () => {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        shortId: '6a68bf32',
      };
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(moduleData));
      const script = new DuplicateModule();

      // when
      const err = await script.handle({ options: { source: 'bac-a-sable.json' }, logger }).catch((e) => e);

      // then
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatch(/existe déjà\.$/);
    });
  });
});
