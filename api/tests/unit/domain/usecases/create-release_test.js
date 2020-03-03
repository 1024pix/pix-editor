const { expect, sinon } = require('../../../test-helper');
const domainBuilder = require('../../../tooling/domain-builder/factory');
const createRelease = require('../../../../lib/domain/usecases/create-release');

describe('Unit | UseCase | Create Release', () => {
  let areaRepository, competenceRepository;
  let expectedCreatedRelease;

  beforeEach(() => {
    expectedCreatedRelease = {
      id: '2020-03-02:fr',
      content: domainBuilder.buildRelease()
    };

    areaRepository = {
      list: sinon.spy(async () => expectedCreatedRelease.content.areas)
    };
    competenceRepository = {
      list: sinon.spy(async () => expectedCreatedRelease.content.competences)
    };
  });

  it('should retrieve area from repository', async () => {
    // when
    await createRelease({ areaRepository, competenceRepository });

    // then
    expect(areaRepository.list).to.be.called;
  });

  it('should retrieve competences from repository', async () => {
    // when
    await createRelease({ areaRepository, competenceRepository });

    // then
    expect(competenceRepository.list).to.be.called;
  });

  it('should return created release with id and content', async () => {
    // when
    const result = await createRelease({ areaRepository, competenceRepository });

    // then
    expect(result).to.deep.equal(expectedCreatedRelease);
  });
});
