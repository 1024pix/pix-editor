import { KnexRepository } from './KnexRepository.js';
import { MockRepositoryB } from './MockRepositoryB.js';

export class MockRepositoryA extends KnexRepository {
  static model = 'area';

  constructor({ knexTransaction } = {}) {
    super({ knexTransaction });
    this.mockRepositoryB = new MockRepositoryB({ knexTransaction: this.dbConn });
  }

  async insertSomeValue() {
    await this.dbConn('users').insert({
      name: 'name in MockRepositoryA',
      trigram: 'MRA',
      apiKey: 'a0657a1d-41d4-4367-9cff-ae24257803db',
      access: 'admin', }).returning('*');
  }
}
