import BaseRepository from './repository';

export default class AreaRepository extends BaseRepository {
  static async list() {
    const response = await fetch('/api/areas', {
      credentials: 'include',
      headers: AreaRepository.getAuthHeaders(),
    });

    const result = await response.json();

    return result.data.map((entity) => {
      return AreaRepository.deserialize(entity);
    });
  }
}
