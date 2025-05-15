export function staticCoursesBuilder(databaseBuilder) {
  const staticCourseId1 = databaseBuilder.factory.buildStaticCourse({
    name: 'Static Course 1',
    description: 'Static Course 1 description',
    challengeIds: 'challenge1NQqfx9mYKUQEO,challengeTYFrFy5EGYEet,challenge1rSPsnisQ8ft4W',
    createdAt: new Date(),
    isActive: true,
  }).id;

  databaseBuilder.factory.buildStaticCourse({
    name: 'Static Course 2',
    description: 'Static Course 2 description',
    challengeIds: 'challenge1NQqfx9mYKUQEO',
    createdAt: new Date('2021-01-01'),
    isActive: false,
    deactivationReason: 'Les épreuves sont trop faciles',
  });

  const staticCourseId3 = databaseBuilder.factory.buildStaticCourse({
    name: 'Static Course 3 PLEIN DE TAGS',
    description: 'Static Course 3 description',
    challengeIds: 'challenge1NQqfx9mYKUQEO,challengeTYFrFy5EGYEet',
    createdAt: new Date('2022-01-01'),
    isActive: true,
    deactivationReason: 'Les épreuves sont trop cools',
  }).id;
  const tagA = databaseBuilder.factory.buildStaticCourseTag({ label: 'Panel Externe' });
  const tagB = databaseBuilder.factory.buildStaticCourseTag({ label: 'International' });
  const tagC = databaseBuilder.factory.buildStaticCourseTag({ label: 'Pix+ BTP' });
  const tagD = databaseBuilder.factory.buildStaticCourseTag({ label: 'Brouillon' });
  const tagE = databaseBuilder.factory.buildStaticCourseTag({ label: 'Panel Interne' });
  databaseBuilder.factory.linkTagsTo({ staticCourseId: staticCourseId3, staticCourseTagIds: [tagA.id, tagB.id, tagC.id, tagD.id] });
  databaseBuilder.factory.linkTagsTo({ staticCourseId: staticCourseId1, staticCourseTagIds: [tagE.id] });
}
