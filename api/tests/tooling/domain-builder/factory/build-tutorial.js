import { Tutorial } from '../../../../lib/domain/models/index.js';

export function buildTutorial({
  id = 'tutorialId',
  locale = 'fr'
} = {}) {
  return new Tutorial({
    id,
    locale,
  });
}
