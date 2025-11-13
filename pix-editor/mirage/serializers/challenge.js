import ApplicationSerializer from './application';

const include = ['challengeLocales'];

export default ApplicationSerializer.extend({
  include,
  links(challenge) {
    return { notes: { related: `/api/notes?filter[challengeId]=${challenge.id}` } };
  },
});
