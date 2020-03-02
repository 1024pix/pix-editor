const { expect, sinon } = require('../../../test-helper');
const domainBuilder = require('../../../tooling/domain-builder/factory');
const createRelease = require('../../../../lib/domain/usecases/create-release');

describe('Unit | UseCase | Create Release', () => {
  let areaRepository;
  let expectedCreatedRelease;

  beforeEach(() => {
    expectedCreatedRelease = {
      id: '2020-03-02:fr',
      content: domainBuilder.buildRelease()
    };

    areaRepository = {
      list: sinon.spy(async () => expectedCreatedRelease.content.areas)
    };
  });

  it('should retrieve area from repository', async () => {
    // when
    await createRelease({ areaRepository });

    // then
    expect(areaRepository.list).to.be.called;
  });

  it('should return created release with id and content', async () => {
    // when
    const result = await createRelease({ areaRepository });

    // then
    expect(result).to.deep.equal(expectedCreatedRelease);
  });
});
