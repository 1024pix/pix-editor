const { expect, sinon } = require('../../../test-helper');
const domainBuilder = require('../../../tooling/domain-builder/factory');
const createRelease = require('../../../../lib/domain/usecases/create-release');

describe('Unit | UseCase | Create Release', () => {
  let datasources;
  let expectedCreatedRelease;

  beforeEach(() => {
    expectedCreatedRelease = {
      id: '2020-03-02:fr',
      content: domainBuilder.buildRelease()
    };

    datasources = {
      areaDatasource: {
        list: sinon.spy(async () => expectedCreatedRelease.content.areas)
      },
      competenceDatasource: {
        list: sinon.spy(async () => expectedCreatedRelease.content.competences)
      },
      challengeDatasource: {
        list: sinon.spy(async () => expectedCreatedRelease.content.challenges)
      },
    };
  });

  it('should retrieve area from repository', async () => {
    // when
    await createRelease(datasources);

    // then
    expect(datasources.areaDatasource.list).to.be.called;
  });

  it('should retrieve competences from repository', async () => {
    // when
    await createRelease(datasources);

    // then
    expect(datasources.competenceDatasource.list).to.be.called;
  });

  it('should retrieve challenges from repository', async () => {
    // when
    await createRelease(datasources);

    // then
    expect(datasources.challengeDatasource.list).to.be.called;
  });

  it('should return created release with id and content', async () => {
    // when
    const result = await createRelease(datasources);

    // then
    expect(result).to.deep.equal(expectedCreatedRelease);
  });
});
