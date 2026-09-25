import { describe, expect, it } from 'vitest';

import { duplicateModule } from '../../../../lib/domain/usecases/duplicate-module.js';

describe('Unit | Domain | Use Cases | duplicateModule', () => {
  it('sets a new slug suffixed with "-copie"', () => {
    // given
    const moduleData = {
      id: '6282925d-4775-4bca-b513-4c3009ec5886',
      slug: 'bac-a-sable',
      title: 'Bac à sable',
      shortId: '6a68bf32',
    };

    // when
    const result = duplicateModule({ moduleData });

    // then
    expect(result.slug).toBe('bac-a-sable-copie');
  });

  it('sets a new title suffixed with " (copie)"', () => {
    // given
    const moduleData = {
      id: '6282925d-4775-4bca-b513-4c3009ec5886',
      slug: 'bac-a-sable',
      title: 'Bac à sable',
      shortId: '6a68bf32',
    };

    // when
    const result = duplicateModule({ moduleData });

    // then
    expect(result.title).toBe('Bac à sable (copie)');
  });

  it('sets a new random shortId', () => {
    // given
    const moduleData = {
      id: '6282925d-4775-4bca-b513-4c3009ec5886',
      slug: 'bac-a-sable',
      title: 'Bac à sable',
      shortId: '6a68bf32',
    };

    // when
    const result = duplicateModule({ moduleData });

    // then
    expect(result.shortId).not.toBe(moduleData.shortId);
    expect(result.shortId).toMatch(/^[0-9a-f]{8}$/);
  });

  it('regenerates every UUID "id" field, at every depth', () => {
    // given
    const moduleData = {
      id: '6282925d-4775-4bca-b513-4c3009ec5886',
      slug: 'bac-a-sable',
      title: 'Bac à sable',
      shortId: '6a68bf32',
      sections: [
        {
          id: 'aaaaaaaa-1111-1111-1111-111111111111',
          grains: [
            {
              id: 'bbbbbbbb-2222-2222-2222-222222222222',
              components: [{ type: 'element', element: { id: 'cccccccc-3333-3333-3333-333333333333', type: 'text' } }],
            },
          ],
        },
      ],
    };

    // when
    const result = duplicateModule({ moduleData });

    // then
    expect(result.id).not.toBe(moduleData.id);
    expect(result.sections[0].id).not.toBe(moduleData.sections[0].id);
    expect(result.sections[0].grains[0].id).not.toBe(moduleData.sections[0].grains[0].id);
    expect(result.sections[0].grains[0].components[0].element.id).not.toBe(
      moduleData.sections[0].grains[0].components[0].element.id,
    );
  });

  it('leaves non-UUID "id" fields untouched', () => {
    // given
    const moduleData = {
      id: '6282925d-4775-4bca-b513-4c3009ec5886',
      slug: 'bac-a-sable',
      title: 'Bac à sable',
      shortId: '6a68bf32',
      sections: [{ id: 'not-a-uuid', grains: [] }],
    };

    // when
    const result = duplicateModule({ moduleData });

    // then
    expect(result.sections[0].id).toBe('not-a-uuid');
  });

  it('leaves other fields untouched', () => {
    // given
    const moduleData = {
      id: '6282925d-4775-4bca-b513-4c3009ec5886',
      slug: 'bac-a-sable',
      title: 'Bac à sable',
      shortId: '6a68bf32',
      isBeta: true,
      visibility: 'public',
    };

    // when
    const result = duplicateModule({ moduleData });

    // then
    expect(result.isBeta).toBe(true);
    expect(result.visibility).toBe('public');
  });
});
