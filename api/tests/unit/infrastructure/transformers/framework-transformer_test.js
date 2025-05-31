import { beforeEach, describe, expect, it } from 'vitest';
import { FrameworkForRelease } from '../../../../lib/domain/models/release/index.js';
import { Framework } from '../../../../lib/domain/models/index.js';
import * as frameworkTransformer from '../../../../lib/infrastructure/transformers/framework-transformer.js';

describe('Unit | Infrastructure | framework-transformer', function() {
  let framework;

  beforeEach(function() {
    framework = new Framework({
      id: 'frameworkId1',
      name: 'Nom de mon framework',
    });
  });

  describe('transformForRelease', function() {
    it('should transform a Framework model into a FrameworkForRelease model', function() {
      // when
      const frameworkForRelease = frameworkTransformer.transformForRelease(framework);

      // then
      expect(frameworkForRelease).to.be.instanceOf(FrameworkForRelease);
      expect(frameworkForRelease).toStrictEqual(new FrameworkForRelease({
        id: 'frameworkId1',
        name: 'Nom de mon framework',
      }));
    });
  });
  describe('transformForReplication', function() {
    it('should transform a Framework model into a DTO for replication', function() {
      // when
      const frameworkForReplicationDTO = frameworkTransformer.transformForReplication(framework);

      // then
      expect(frameworkForReplicationDTO).toStrictEqual({
        id: 'frameworkId1',
        name: 'Nom de mon framework',
      });
    });
  });
});
