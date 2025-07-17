import { api } from '../api';

export default class Framework {
  constructor({
    id,
    name,
    areas,
  }) {
    this.id = id;
    this.name = name
    this.areas = new Relationship(areas);
  }
}

class Relationship extends Array {
  constructor(jsonApiRelationship) {
    super([]);
    this.jsonApiRelationship = jsonApiRelationship;
    this.type = this.jsonApiRelationship.data?.[0]?.type;
    this.ids = this.jsonApiRelationship.data.map(({ id }) => id);
  }

  async load() {
    if (!this.type) return [];
    const { data: areas } = await api.get(this.type, {
      params: {
        filter: {
          ids: this.ids,
        },
      },
    });
    return areas;
  }
}
