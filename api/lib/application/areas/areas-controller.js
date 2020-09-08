const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/area-serializer');

module.exports = {

  async get() {
    const areas = await usecases.getAreas();
    return serializer.serialize(areas);
  },
};
