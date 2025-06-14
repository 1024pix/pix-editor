import { describe, describe as context, expect, it } from 'vitest';
import { forRelease, forReplication } from '../../../../lib/infrastructure/transformers/framework-transformer.js';
import { Framework } from '../../../../lib/domain/models/index.js';
import { FrameworkForRelease } from '../../../../lib/domain/models/release/index.js';
import { FrameworkForReplication } from '../../../../lib/domain/models/replication/index.js';

describe('Unit | Infrastructure | framework-transformer', function() {

  describe('#forRelease', function() {
    context('when providing a single Framework', function() {
      it('should transform it into a single FrameworkForRelease', function() {
        // given
        const framework = new Framework({
          id: 'frameworkABC123',
          name: 'Nom de mon framework',
          areaIds: ['areaId1', 'areaId2'],
        });

        // when
        const actualFrameworkForRelease = forRelease(framework);

        // then
        expect(actualFrameworkForRelease).toStrictEqual(new FrameworkForRelease({
          id: 'frameworkABC123',
          name: 'Nom de mon framework',
        }));
      });
    });

    context('when providing several Frameworks', function() {
      it('should transform them into a several FrameworksForRelease', function() {
        // given
        const frameworkA = new Framework({
          id: 'frameworkABC123',
          name: 'Nom de mon framework A',
          areaIds: ['areaId1', 'areaId2'],
        });
        const frameworkB = new Framework({
          id: 'frameworkDEF456',
          name: 'Nom de mon framework B',
          areaIds: ['areaId3', 'areaId4'],
        });

        // when
        const actualFrameworksForRelease = forRelease([frameworkA, frameworkB]);

        // then
        expect(actualFrameworksForRelease).toStrictEqual([
          new FrameworkForRelease({
            id: 'frameworkABC123',
            name: 'Nom de mon framework A',
          }),
          new FrameworkForRelease({
            id: 'frameworkDEF456',
            name: 'Nom de mon framework B',
          }),
        ]);
      });
    });
  });

  describe('#forReplication', function() {
    context('when providing a single Framework', function() {
      it('should transform it into a single FrameworkForReplication', function() {
        // given
        const framework = new Framework({
          id: 'frameworkABC123',
          name: 'Nom de mon framework',
          areaIds: ['areaId1', 'areaId2'],
        });

        // when
        const actualFrameworkForReplication = forReplication(framework);

        // then
        expect(actualFrameworkForReplication).toStrictEqual(new FrameworkForReplication({
          id: 'frameworkABC123',
          name: 'Nom de mon framework',
        }));
      });
    });

    context('when providing several Frameworks', function() {
      it('should transform them into a several FrameworksForReplication', function() {
        // given
        const frameworkA = new Framework({
          id: 'frameworkABC123',
          name: 'Nom de mon framework A',
          areaIds: ['areaId1', 'areaId2'],
        });
        const frameworkB = new Framework({
          id: 'frameworkDEF456',
          name: 'Nom de mon framework B',
          areaIds: ['areaId3', 'areaId4'],
        });

        // when
        const actualFrameworksForReplication = forReplication([frameworkA, frameworkB]);

        // then
        expect(actualFrameworksForReplication).toStrictEqual([
          new FrameworkForReplication({
            id: 'frameworkABC123',
            name: 'Nom de mon framework A',
          }),
          new FrameworkForReplication({
            id: 'frameworkDEF456',
            name: 'Nom de mon framework B',
          }),
        ]);
      });
    });
  });
});
