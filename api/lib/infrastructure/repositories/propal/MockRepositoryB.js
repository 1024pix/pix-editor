import { KnexRepository } from './KnexRepository.js';

export class MockRepositoryB extends KnexRepository {
  async insertSomeValue() {
    await this.dbConn('users').insert({
      name: 'name in MockRepositoryB',
      trigram: 'MRB',
      apiKey: '12b833c7-5c9e-4803-9e63-4ac38dec91ba',
      access: 'admin', }).returning('*');
  }
}
