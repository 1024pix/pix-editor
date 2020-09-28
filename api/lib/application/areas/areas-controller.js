const serializer = require('../../infrastructure/serializers/jsonapi/area-serializer');
const areaRepository = require('../../infrastructure/repositories/area-repository');

module.exports = {

  async get() {
    const areas = await areaRepository.get();
    return serializer.serialize(areas);
  },
};
