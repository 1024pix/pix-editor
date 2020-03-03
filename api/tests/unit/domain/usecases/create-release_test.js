const { expect, sinon } = require('../../../test-helper');
const domainBuilder = require('../../../tooling/domain-builder/factory');
const createRelease = require('../../../../lib/domain/usecases/create-release');

describe('Unit | UseCase | Create Release', () => {
  let areaDatasource, competenceDatasource;
  let expectedCreatedRelease;

  beforeEach(() => {
    expectedCreatedRelease = {
      id: '2020-03-02:fr',
      content: domainBuilder.buildRelease()
    };

    areaDatasource = {
      list: sinon.spy(async () => expectedCreatedRelease.content.areas)
    };
    competenceDatasource = {
      list: sinon.spy(async () => expectedCreatedRelease.content.competences)
    };
  });

  it('should retrieve area from repository', async () => {
    // when
    await createRelease({ areaDatasource, competenceDatasource });

    // then
    expect(areaDatasource.list).to.be.called;
  });

  it('should retrieve competences from repository', async () => {
    // when
    await createRelease({ areaDatasource, competenceDatasource });

    // then
    expect(competenceDatasource.list).to.be.called;
  });

  it('should return created release with id and content', async () => {
    // when
    const result = await createRelease({ areaDatasource, competenceDatasource });

    // then
    expect(result).to.deep.equal(expectedCreatedRelease);
  });
});
