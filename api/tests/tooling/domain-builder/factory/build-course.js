const Course = require('../../../../lib/domain/models/Course');

module.exports = function buildCourse({
  id = 'recPBOj7JzBcgXEtO',
  description = 'Programmer niveau 1 et 2',
  imageUrl = 'https://dl.airtable.com/otNiedKYSTBmoAPdyIk2_woman-163426_1920.jpg',
  name = '3.4 niveau 1 et 2',
  challenges = ['recs9uvUWKQ4HDzw6'],
  competences = ['rec8116cdd76088af'],
} = {}) {
  return new Course({
    id,
    description,
    imageUrl,
    name,
    challenges,
    competences,
  });
};
