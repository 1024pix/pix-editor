import { describe, expect, it } from 'vitest';

import { SearchResult } from '../../../../lib/domain/readmodels/index.js';

describe('Unit | Domain | SearchResult', () => {
  describe('#title', () => {
    describe('when title is shorter or equal to 100 characters', () => {
      it('returns the title as it is', () => {
        // given
        const searchResult = new SearchResult({ title: 'this title is a little long, however it is still shorter than a hundred and one characters, cheers!!' });

        // when
        const actualTitle = searchResult.title;

        // then
        expect(actualTitle).toBe('this title is a little long, however it is still shorter than a hundred and one characters, cheers!!');
      });
    });

    describe('when title is longer than 100 characters', () => {
      it('returns a truncated title', () => {
        // given
        const searchResult = new SearchResult({ title: 'this title is a little longer than a hundred characters, so it should be truncated at some point in this sentence' });

        // when
        const actualTitle = searchResult.title;

        // then
        expect(actualTitle).toBe('this title is a little longer than a hundred characters, so it should be truncated at some point in…');
      });
    });
  });
});
