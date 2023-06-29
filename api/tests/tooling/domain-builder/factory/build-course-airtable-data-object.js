module.exports = function buildCourseAirtableDataObject(
  {
    id = 'recPBOj7JzBcgXEtO',
    // attributes
    description = 'Programmer niveau 1 et 2',
    imageUrl = 'https://dl.airtable.com/otNiedKYSTBmoAPdyIk2_woman-163426_1920.jpg',
    name = '3.4 niveau 1 et 2',
    adaptive = false,
    createdAt = new Date('2021-01-01'),
    updatedAt = new Date('2021-01-02'),
    // relationships
    challenges = [
      'recs9uvUWKQ4HDzw6',
      'recj8n1giB5f1It04',
      'recgaM9thmu7t3qnj',
      'recZvwJWOh1ruV0QG',
      'recUceYsrMAu38COe',
      'recIN1NGPekHJ9S4l',
      'recFbiP4dLuKL61NJ',
      'rec3XmZPwLagZl7Ku',
    ],
    competences = ['rec8116cdd76088af'],
  } = {}) {
  return {
    id,
    // attributes
    description,
    imageUrl,
    name,
    adaptive,
    createdAt,
    updatedAt,
    // relations
    challenges,
    competences,
  };
};
