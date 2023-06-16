module.exports = function(databaseBuilder) {
  databaseBuilder.factory.buildStaticCourse({
    id: 'static-course-1',
    name: 'Static Course 1',
    description: 'Static Course 1 description',
    challengeIds: 'challenge1NQqfx9mYKUQEO,challengeTYFrFy5EGYEet,challenge1rSPsnisQ8ft4W',
    imageUrl: 'some/image/url'
  });
};
