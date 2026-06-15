import { DomainTransaction } from '../../../lib/domain/DomainTransaction.js';
import { catchErr, knex } from '../../test-helper.js';
import { describe, expect, it } from 'vitest';

describe('API | Integration | Domain | DomainTransaction', function() {
  describe('behaviour when nesting', function() {
    describe('DomainTransaction.execute in DomainTransaction.execute', function() {
      it('should use the same transaction all the way', async function() {
        // given
        let didIGoAllTheWayToTheEnd = false;
        const addTwoframeworksInTwoDomainTrExecute = async function() {
          const knexConnA = DomainTransaction.getConnection();

          // check empty in scope A
          const keys0 = await knexConnA('frameworks').pluck('name');
          expect(keys0, 'it starts with an empty table').toEqual([]);

          // insert in scope A
          await knexConnA('frameworks').insert({ id: 'scopeA', name: 'scopeA' });

          // check has one in scope A
          const keys1 = await knexConnA('frameworks').pluck('name');
          expect(keys1, '"scopeA" has been inserted in first layer').toEqual(['scopeA']);

          // nested scope
          await DomainTransaction.execute(async function() {
            const knexConnB = DomainTransaction.getConnection();

            // check already has one in scope B
            const keys1 = await knexConnB('frameworks').pluck('name');
            expect(keys1, '"scopeA" found in second layer').toEqual(['scopeA']);

            // insert in scope B
            await knexConnB('frameworks').insert({ id: 'scopeB', name: 'scopeB' });

            // check has two in scope B
            const keys2 = await knexConnB('frameworks').pluck('name').orderBy('name');
            expect(keys2, '"scopeB" also inserted, but in second layer').toEqual(['scopeA', 'scopeB']);
            didIGoAllTheWayToTheEnd = true;
          });
        };

        // when
        await DomainTransaction.execute(addTwoframeworksInTwoDomainTrExecute);

        // then
        expect(didIGoAllTheWayToTheEnd).toBe(true);
        const finalKeys = await knex('frameworks').pluck('name').orderBy('name');
        expect(finalKeys).toEqual(['scopeA', 'scopeB']);
      });

      it('should rollback everything when something goes wrong in the nested scope', async function() {
        // given
        const addTwoframeworksInTwoDomainTrExecute = async function() {
          const knexConnA = DomainTransaction.getConnection();

          await knexConnA('frameworks').insert({ id: 'scopeA', name: 'scopeA' });

          await DomainTransaction.execute(async function() {
            const knexConnB = DomainTransaction.getConnection();

            await knexConnB('frameworks').insert({ id: 'scopeB', name: 'scopeB' });

            throw new Error("Let's rollback !");
          });
        };

        // when
        const err = await catchErr(DomainTransaction.execute)(addTwoframeworksInTwoDomainTrExecute);

        // then
        expect(err.message).toEqual("Let's rollback !");
        const { count } = await knex('frameworks').count('id').first();
        expect(parseInt(count)).toEqual(0);
      });
    });
  });
});
