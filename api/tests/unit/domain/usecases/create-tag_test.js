import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { createTag } from '../../../../lib/domain/usecases/index.js';
import { Tag } from '../../../../lib/domain/models/index.js';
import { ConflictError } from '../../../../lib/infrastructure/errors.js';

describe('Unit | Domain | Use Cases | create-tag', () => {
  let tagRepository, dependencies;

  beforeEach(() => {
    tagRepository = {
      list: vi.fn(),
      create: vi.fn(),
    };
    dependencies = {
      tagRepository,
      ConflictError,
    };
  });

  context('when name already taken', function() {
    it('should throw a ConflictError', async function() {
      // given
      tagRepository.list.mockResolvedValue([
        new Tag({ name: 'école' }),
        new Tag({ name: 'SupErCassE' })
      ]);

      // when / then
      await expect(createTag(new Tag({ name: 'ecole' }), dependencies)).rejects.to.deep.equal(new ConflictError('Nom de tag déjà pris'));
      await expect(createTag(new Tag({ name: 'supercassE' }), dependencies)).rejects.to.deep.equal(new ConflictError('Nom de tag déjà pris'));
    });
  });

  context('when name is available', function() {
    it('should return the createdTag', async function() {
      // given
      tagRepository.list.mockResolvedValue([
        new Tag({ name: 'école' }),
      ]);
      tagRepository.create.mockResolvedValue(
        new Tag({ name: 'Internet', airtableId: 'tagAirtableId1', id: 'tagId1' })
      );

      // when
      const tag = new Tag({ name: 'Internet', airtableId: null, id: null });
      const createdTag = await createTag(new Tag({ name: 'Internet', airtableId: null, id: null }), dependencies);

      // then
      expect(createdTag).toStrictEqual(new Tag({ name: 'Internet', airtableId: 'tagAirtableId1', id: 'tagId1' }));
      expect(tagRepository.create).toHaveBeenCalledWith(tag);
    });
  });
});
