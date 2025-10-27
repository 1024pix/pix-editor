import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { createTag } from '../../../../lib/domain/usecases/index.js';
import { Tag } from '../../../../lib/domain/models/index.js';
import { TagTitleAlreadyUsedError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | create-tag', () => {
  let tagRepository, dependencies;

  beforeEach(() => {
    tagRepository = {
      findByTitle: vi.fn(),
      create: vi.fn(),
    };
    dependencies = {
      tagRepository,
    };
  });

  context('when title already taken', function () {
    it('should throw a ConflictError', async function () {
      // given
      tagRepository.findByTitle.mockResolvedValue(new Tag({}));

      // when / then
      await expect(createTag(new Tag({ title: 'titre recherché' }), dependencies)).rejects.to.deep.equal(
        new TagTitleAlreadyUsedError('titre recherché'),
      );
      expect(tagRepository.findByTitle).toHaveBeenCalledWith('titre recherché');
    });
  });

  context('when title is available', function () {
    it('should return the createdTag', async function () {
      // given
      tagRepository.findByTitle.mockResolvedValue(null);
      tagRepository.create.mockResolvedValue(
        new Tag({ title: 'Internet', airtableId: 'tagAirtableId1', id: 'tagId1' }),
      );

      // when
      const tag = new Tag({ title: 'Internet', airtableId: null, id: null });
      const createdTag = await createTag(new Tag({ title: 'Internet', airtableId: null, id: null }), dependencies);

      // then
      expect(createdTag).toStrictEqual(new Tag({ title: 'Internet', airtableId: 'tagAirtableId1', id: 'tagId1' }));
      expect(tagRepository.create).toHaveBeenCalledWith(tag);
    });
  });
});
