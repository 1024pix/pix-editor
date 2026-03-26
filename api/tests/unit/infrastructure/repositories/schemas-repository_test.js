import { describe, expect, it } from 'vitest';
import { list } from '../../../../lib/infrastructure/repositories/admin-schema-repository.js';

describe('Unit | Infrastructure | Repositories | Admin-schemas', () => {
  describe('#list', () => {
    it('should return all entity schemas', () => {
      const schemas = list();

      const userSchema = schemas.find((schema) => schema.entityName === 'users');
      const releaseSchema = schemas.find((schema) => schema.entityName === 'releases');
      const translationSchema = schemas.find((schema) => schema.entityName === 'translations');
      const localizedChallengeSchema = schemas.find((schema) => schema.entityName === 'localized_challenges');
      const translationsConfigSchema = schemas.find((schema) => schema.entityName === 'translations_config');

      expect(schemas.length).toStrictEqual(5);

      expect(userSchema.deletable).toStrictEqual(true);
      expect(releaseSchema.deletable).toStrictEqual(false);
      expect(translationSchema.deletable).toStrictEqual(false);
      expect(localizedChallengeSchema.deletable).toStrictEqual(false);
      expect(translationsConfigSchema.deletable).toStrictEqual(true);
    });
  });
});
