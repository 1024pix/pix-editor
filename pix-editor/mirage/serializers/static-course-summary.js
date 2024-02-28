import ApplicationSerializer from './application';

const include = ['tags'];

export default ApplicationSerializer.extend({
  include,
});
