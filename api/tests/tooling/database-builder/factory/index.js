module.exports = {
  ...require('./build-user'),
  buildRelease: require('./build-release'),
  buildStaticCourse: require('./build-static-course'),
  buildTranslation: require('./build-translation'),
};
