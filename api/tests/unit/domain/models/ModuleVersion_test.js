import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { ModuleVersion } from '../../../../lib/domain/models/ModuleVersion.js';

describe('Unit | Domain | ModuleVersion', () => {
  describe('fromModule', () => {
    it('creates a ModuleVersion from a Module', () => {
      // given
      const module = domainBuilder.buildModule();
      const expectedModuleVersion = new ModuleVersion({
        moduleId: module.id,
        shortId: module.shortId,
        internalTitle: module.internalTitle,
        slug: module.slug,
        title: module.title,
        isBeta: module.isBeta,
        visibility: module.visibility,
        details: module.details,
        sections: module.sections,
        glossary: module.glossary,
        version: module.version,
      });

      // when
      const moduleVersion = ModuleVersion.fromModule(module);

      // then
      expect(moduleVersion).toStrictEqual(expectedModuleVersion);
    });
  });
});
