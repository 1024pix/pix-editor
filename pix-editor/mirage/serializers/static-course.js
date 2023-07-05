import ApplicationSerializer from './application';

const include = ['challengeSummaries'];

export default ApplicationSerializer.extend({
  include,
});
