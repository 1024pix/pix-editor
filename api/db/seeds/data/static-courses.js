module.exports = function(databaseBuilder) {
  databaseBuilder.factory.buildStaticCourse({
    id: 'courseFr0mS33d5',
    name: 'Static Course 1',
    description: 'Static Course 1 description',
    challengeIds: 'challenge1NQqfx9mYKUQEO,challengeTYFrFy5EGYEet,challenge1rSPsnisQ8ft4W',
    imageUrl: 'some/image/url',
    createdAt: new Date(),
    isActive: true,
  });

  databaseBuilder.factory.buildStaticCourse({
    id: 'courseABC123CoCo',
    name: 'Static Course 2',
    description: 'Static Course 2 description',
    challengeIds: 'challenge1NQqfx9mYKUQEO',
    imageUrl: 'some/image/url',
    createdAt: new Date('2021-01-01'),
    isActive: false,
    deactivationReason: 'Les épreuves sont trop faciles',
  });
};
