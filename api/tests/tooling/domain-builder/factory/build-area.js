const faker = require('faker');

module.exports = function buildArea({
  id = faker.random.uuid(),
  code = faker.random.number(),
  title = faker.lorem.words(),
  competences = [],
  color = faker.lorem.word(),
  // optional
  name
} = {}) {
  name = name || `${code}. ${title}`;
  return {
    id,
    name,
    code,
    title,
    competences,
    color,
  };
};
