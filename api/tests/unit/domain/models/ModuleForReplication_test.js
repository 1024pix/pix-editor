import { describe, it, expect } from 'vitest';
import { ModuleForReplication } from '../../../../lib/domain/models/replication/index.js';

describe('Unit | Domain | ModuleForReplication', () => {
  describe('#constructor()', () => {
    it('should create a new Modules instance', function() {
      // given
      const data = _buildModuleForReplication();

      // when
      const result = new ModuleForReplication({ ...data });

      // then
      expect(result).to.be.an.instanceOf(ModuleForReplication);
      expect(result).to.deep.equal(data);
    });
  });
},
);

function _buildModuleForReplication() {
  return {
    id: '6282925d-4775-4bca-b513-4c3009ec5886',
    shortId: '6a68bf32',
    slug: 'bac-a-sable',
    title: 'Bac à sable',
    internalTitle: 'bac-a-sable_TECH_NOV',
    isBeta: true,
    visibility: 'private',
    level: 'novice',
    duration: 5,
    objectives: 'Tester des composants de la coquille Modulix',
    version: '1.0.2',
  };
}
