import { TutorialForRelease } from '../../../../../lib/domain/models/release/index.js';
import { Tutorial } from '../../../../../lib/domain/models/index.js';

export function buildTutorialDatasourceObject(
  {
    id = 'receomyzL0AmpMFGw',
    airtableId = 'tutorialAirtableId',
    duration = '00:03:31',
    format = TutorialForRelease.FORMATS.VIDEO,
    link = 'http://www.example.com/this-is-an-example.html',
    source = 'Source Example, Example',
    title = 'Communiquer',
    locale = 'fr-fr',
    language = 'fr-fr',
    license = Tutorial.LICENSES.C,
    level = Tutorial.LEVELS.THREE,
    crush = true,
    tagAirtableIds = ['tagAirtableId1'],
    tutorialForSkills = ['skillId1'],
    furtherInformation = ['skillId2'],
  } = {}) {

  return {
    id,
    airtableId,
    duration,
    format,
    link,
    source,
    title,
    locale,
    language,
    license,
    level,
    crush,
    tagAirtableIds,
    tutorialForSkills,
    furtherInformation,
  };
}
