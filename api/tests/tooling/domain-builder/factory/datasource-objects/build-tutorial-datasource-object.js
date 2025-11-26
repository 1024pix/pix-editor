import { TutorialForRelease } from '../../../../../lib/domain/models/release/index.js';
import { Tutorial } from '../../../../../lib/domain/models/index.js';

export function buildTutorialDatasourceObject({
  id = 'receomyzL0AmpMFGw',
  duration = '00:03:31',
  format = TutorialForRelease.FORMATS.VIDEO,
  link = 'http://www.example.com/this-is-an-example.html',
  source = 'Source Example, Example',
  title = 'Communiquer',
  locale = 'fr-fr',
  license = Tutorial.LICENSES.C,
  level = Tutorial.LEVELS.THREE,
  crush = true,
  tagIds = ['tagId1'],
} = {}) {
  return {
    id,
    airtableId: id,
    duration,
    format,
    link,
    source,
    title,
    locale,
    license,
    level,
    crush,
    tagAirtableIds: tagIds,
    tagIds,
  };
}
