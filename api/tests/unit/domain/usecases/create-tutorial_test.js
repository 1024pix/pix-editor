import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTutorial } from '../../../../lib/domain/usecases/index.js';
import * as updatePixApiReleaseCache from '../../../../lib/domain/services/update-pix-api-release-cache.js';
import { Tutorial } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Use Cases | create-tutorial', () => {
  const createdTutorial = Symbol('createdTutorial');
  let tutorialRepository, dependencies, onTutorialCreated;

  beforeEach(() => {
    tutorialRepository = { create: vi.fn().mockResolvedValueOnce(createdTutorial) };
    dependencies = { tutorialRepository };

    onTutorialCreated = vi.spyOn(updatePixApiReleaseCache, 'onTutorialCreated').mockResolvedValueOnce();
  });

  it('saves the tutorial to database and notifies PixApi', async () => {
    // given
    const tutorial = new Tutorial({});

    // when
    const result = await createTutorial(tutorial, dependencies);

    // then
    expect(result).toBe(createdTutorial);
    expect(tutorialRepository.create).toHaveBeenCalledExactlyOnceWith(tutorial);
    expect(onTutorialCreated).toHaveBeenCalledExactlyOnceWith(createdTutorial);
  });

  describe('when tutorial has a Youtube video link', () => {
    it('is saved with a app.pix.fr/youtube-video.html link', async () => {
      // given
      const tutorial = new Tutorial({ link: 'youtu.be/videoid' });

      // when
      const result = await createTutorial(tutorial, dependencies);

      // then
      expect(result).toBe(createdTutorial);
      expect(tutorialRepository.create).toHaveBeenCalledExactlyOnceWith(new Tutorial({ link: 'https://app.pix.fr/youtube-video.html?v=videoid' }));
      expect(onTutorialCreated).toHaveBeenCalledExactlyOnceWith(createdTutorial);
    });
  });
});
