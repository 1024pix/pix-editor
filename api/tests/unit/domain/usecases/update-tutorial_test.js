import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateTutorial } from '../../../../lib/domain/usecases/index.js';
import * as updatePixApiReleaseCache from '../../../../lib/domain/services/update-pix-api-release-cache.js';
import { Tutorial } from '../../../../lib/domain/models/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | update-tutorial', () => {
  const updatedTutorial = Symbol('updatedTutorial');
  let tutorialRepository, dependencies, onTutorialUpdated;

  beforeEach(() => {
    tutorialRepository = { get: vi.fn(), update: vi.fn().mockResolvedValueOnce(updatedTutorial) };
    dependencies = { tutorialRepository };

    onTutorialUpdated = vi.spyOn(updatePixApiReleaseCache, 'onTutorialUpdated').mockResolvedValueOnce();
  });

  it('saves the tutorial to database and notifies PixApi', async () => {
    // given
    const existingTutorial = { update: vi.fn() };
    tutorialRepository.get.mockResolvedValueOnce(existingTutorial);

    const tutorial = new Tutorial({ airtableId: 'existingTutorial' });

    // when
    const result = await updateTutorial(tutorial, dependencies);

    // then
    expect(result).toBe(updatedTutorial);
    expect(tutorialRepository.get).toHaveBeenCalledExactlyOnceWith('existingTutorial');
    expect(existingTutorial.update).toHaveBeenCalledExactlyOnceWith(tutorial);
    expect(tutorialRepository.update).toHaveBeenCalledExactlyOnceWith(existingTutorial);
    expect(onTutorialUpdated).toHaveBeenCalledExactlyOnceWith(updatedTutorial);
  });

  describe('when tutorial does not exist', () => {
    it('throws a NotFoundError', async () => {
      tutorialRepository.get.mockResolvedValueOnce(null);
      const tutorial = new Tutorial({ airtableId: 'unknownTutorial' });

      // when
      const result = updateTutorial(tutorial, dependencies);

      await expect(result).rejects.toStrictEqual(new NotFoundError('unknown tutorial id'));
    });
  });

  describe('when tutorial has a Youtube video link', () => {
    it('migrates Youtube video link to app.pix.fr/youtube-video.html before saving', async () => {
      // given
      const existingTutorial = { update: vi.fn(), isYoutubeVideoLink: true, rewriteYoutubeVideoLink: vi.fn() };
      tutorialRepository.get.mockResolvedValueOnce(existingTutorial);

      const tutorial = new Tutorial({ airtableId: 'existingTutorial' });

      // when
      const result = await updateTutorial(tutorial, dependencies);

      // then
      expect(result).toBe(updatedTutorial);
      expect(tutorialRepository.get).toHaveBeenCalledExactlyOnceWith('existingTutorial');
      expect(existingTutorial.update).toHaveBeenCalledExactlyOnceWith(tutorial);
      expect(existingTutorial.rewriteYoutubeVideoLink).toHaveBeenCalledExactlyOnceWith({ logger: expect.any(Object) });
      expect(tutorialRepository.update).toHaveBeenCalledExactlyOnceWith(existingTutorial);
      expect(onTutorialUpdated).toHaveBeenCalledExactlyOnceWith(updatedTutorial);
    });
  });
});
