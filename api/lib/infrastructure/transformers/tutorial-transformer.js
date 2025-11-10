import _ from 'lodash';

export function filterTutorialsFields(tutorials) {
  const fieldsToInclude = [
    'id',
    'duration',
    'format',
    'link',
    'source',
    'title',
    'locale',
  ];
  return tutorials.map((tutorial) => _.pick(tutorial, fieldsToInclude));
}
