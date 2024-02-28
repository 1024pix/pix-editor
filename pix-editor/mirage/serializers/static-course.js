import ApplicationSerializer from './application';

const include = ['challengeSummaries', 'tags'];

export default ApplicationSerializer.extend({
  include,
});
