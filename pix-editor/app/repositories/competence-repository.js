import BaseRepository from './repository';

export default class CompetenceRepository extends BaseRepository {
  static async list() {
    const response = await fetch('/api/competences', {
      credentials: 'include',
      headers: CompetenceRepository.getAuthHeaders(),
    });

    const result = await response.json();

    return result.data.map((entity) => {
      return CompetenceRepository.deserialize(entity);
    });
  }
}
