import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { catchErr, domainBuilder, hFake } from '../../../test-helper.js';
import * as staticCourseController from '../../../../lib/application/static-courses/static-courses.js';
import {
  localizedChallengeRepository,
  staticCourseRepository,
  staticCourseTagRepository,
} from '../../../../lib/infrastructure/repositories/index.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';
import { InvalidStaticCourseCreationOrUpdateError } from '../../../../lib/domain/errors.js';

describe('Unit | Controller | static courses controller', function() {
  describe('create', function() {

    describe('creationCommand normalization', function() {
      let saveStub, getReadStub, getManyStub, listIdsStub, generateNewIdStub;

      beforeEach(function() {
        vi.useFakeTimers({
          now: new Date('2021-10-29T03:04:00Z'),
        });
        listIdsStub = vi.spyOn(staticCourseTagRepository, 'listIds');
        listIdsStub.mockResolvedValue([123, 456]);
        getManyStub = vi.spyOn(localizedChallengeRepository, 'getMany');
        getManyStub.mockResolvedValue([{ id: 'chalA' }]);
        saveStub = vi.spyOn(staticCourseRepository, 'save');
        saveStub.mockResolvedValue('course123');
        getReadStub = vi.spyOn(staticCourseRepository, 'getRead');
        getReadStub.mockResolvedValue({});
        generateNewIdStub = vi.spyOn(idGenerator, 'generateNewId');
        generateNewIdStub.mockReturnValue('courseDEF456');
      });

      afterEach(function() {
        vi.useRealTimers();
      });

      it('should pass along creation command from attributes when all is valid', async function() {
        // given
        const request = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name  ',
                description: '  some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': ['123'],
              }
            }
          }
        };

        // when
        await staticCourseController.create(request, hFake);

        // then
        const expectedStaticCourse = domainBuilder.buildStaticCourse({
          id: 'courseDEF456',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalA'],
          tagIds: [123],
          createdAt: new Date('2021-10-29T03:04:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).toHaveBeenCalledWith(expectedStaticCourse);
      });

      it('should normalize name to an empty string when not a string, and thus throw an error', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: null,
                description: '  some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          }
        };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                description: '  some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          }
        };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 123,
                description: '  some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          }
        };

        // when
        const error0 = await catchErr(staticCourseController.create)(request0, hFake);
        const error1 = await catchErr(staticCourseController.create)(request1, hFake);
        const error2 = await catchErr(staticCourseController.create)(request2, hFake);

        // then
        expect(error0).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error0.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(error1).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error1.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(error2).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error2.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(saveStub).not.toHaveBeenCalled();
      });

      it('should normalize description to an empty string when not a string', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: null,
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          }
        };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          }
        };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 123,
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          }
        };

        // when
        await staticCourseController.create(request0, hFake);
        await staticCourseController.create(request1, hFake);
        await staticCourseController.create(request2, hFake);

        // then
        const expectedStaticCourse = domainBuilder.buildStaticCourse({
          id: 'courseDEF456',
          name: 'some valid name',
          description: '',
          challengeIds: ['chalA'],
          tagIds: [],
          createdAt: new Date('2021-10-29T03:04:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).toHaveBeenNthCalledWith(1, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(2, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(3, expectedStaticCourse);
      });

      it('should normalize challengeIds to an empty array when not an array, and thus throw an error', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                challengeIds: 'coucou',
                tagIds: [],
              }
            }
          }
        };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                challengeIds: null,
                tagIds: [],
              }
            }
          }
        };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                tagIds: [],
              }
            }
          }
        };
        const request3 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                'challenge-ids': 123,
                tagIds: [],
              }
            }
          }
        };

        // when
        const error0 = await catchErr(staticCourseController.create)(request0, hFake);
        const error1 = await catchErr(staticCourseController.create)(request1, hFake);
        const error2 = await catchErr(staticCourseController.create)(request2, hFake);
        const error3 = await catchErr(staticCourseController.create)(request3, hFake);

        // then
        expect(error0).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error0.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error1).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error1.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error2).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error2.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error3).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error3.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(saveStub).not.toHaveBeenCalled();
      });

      it('should normalize tagIds to an empty array when not an array', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': 'coucou',
              }
            }
          }
        };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': null,
              }
            }
          }
        };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                'challenge-ids': ['chalA'],
              }
            }
          }
        };
        const request3 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': 123,
              }
            }
          }
        };

        // when
        await staticCourseController.create(request0, hFake);
        await staticCourseController.create(request1, hFake);
        await staticCourseController.create(request2, hFake);
        await staticCourseController.create(request3, hFake);

        // then
        const expectedStaticCourse = domainBuilder.buildStaticCourse({
          id: 'courseDEF456',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalA'],
          tagIds: [],
          createdAt: new Date('2021-10-29T03:04:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).toHaveBeenNthCalledWith(1, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(2, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(3, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(4, expectedStaticCourse);
      });
    });
  });
  describe('update', function() {

    describe('updateCommand normalization', function() {
      let saveStub, getReadStub, getManyStub, getStub, listIdsStub;

      beforeEach(function() {
        vi.useFakeTimers({
          now: new Date('2021-10-29T03:04:00Z'),
        });
        listIdsStub = vi.spyOn(staticCourseTagRepository, 'listIds');
        listIdsStub.mockResolvedValue([123, 456]);
        getManyStub = vi.spyOn(localizedChallengeRepository, 'getMany');
        getManyStub.mockResolvedValue([{ id: 'chalA' }]);
        saveStub = vi.spyOn(staticCourseRepository, 'save');
        saveStub.mockResolvedValue();
        getStub = vi.spyOn(staticCourseRepository, 'get');
        getStub.mockResolvedValue(domainBuilder.buildStaticCourse({
          id: 'someCourseId',
          createdAt: new Date('2020-01-01T00:00:01Z'),
        }));
        getReadStub = vi.spyOn(staticCourseRepository, 'getRead');
        getReadStub.mockResolvedValue({});
      });

      afterEach(function() {
        vi.useRealTimers();
      });

      it('should pass along update command from attributes when all is valid', async function() {
        // given
        const request = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name  ',
                description: '  some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': ['123'],
              }
            }
          },
          params: { id: 'someCourseId' }
        };

        // when
        await staticCourseController.update(request, hFake);

        // then
        const expectedStaticCourse = domainBuilder.buildStaticCourse({
          id: 'someCourseId',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalA'],
          tagIds: [123],
          createdAt: new Date('2020-01-01T00:00:01Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).toHaveBeenCalledWith(expectedStaticCourse);
      });

      it('should normalize name to an empty string when not a string, and thus throw an error', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: null,
                description: '  some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          },
          params: { id: 'someCourseId' }
        };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                description: '  some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          },
          params: { id: 'someCourseId' }
        };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 123,
                description: '  some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          },
          params: { id: 'someCourseId' }
        };

        // when
        const error0 = await catchErr(staticCourseController.update)(request0, hFake);
        const error1 = await catchErr(staticCourseController.update)(request1, hFake);
        const error2 = await catchErr(staticCourseController.update)(request2, hFake);

        // then
        expect(error0).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error0.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(error1).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error1.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(error2).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error2.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(saveStub).not.toHaveBeenCalled();
      });

      it('should normalize description to an empty string when not a string', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: null,
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          },
          params: { id: 'someCourseId' }
        };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          },
          params: { id: 'someCourseId' }
        };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 123,
                'challenge-ids': ['chalA'],
                'tag-ids': [],
              }
            }
          },
          params: { id: 'someCourseId' }
        };

        // when
        await staticCourseController.update(request0, hFake);
        await staticCourseController.update(request1, hFake);
        await staticCourseController.update(request2, hFake);

        // then
        const expectedStaticCourse = domainBuilder.buildStaticCourse({
          id: 'someCourseId',
          name: 'some valid name',
          description: '',
          challengeIds: ['chalA'],
          tagIds: [],
          createdAt: new Date('2020-01-01T00:00:01Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).toHaveBeenNthCalledWith(1, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(2, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(3, expectedStaticCourse);
      });

      it('should normalize challengeIds to an empty array when not an array, and thus throw an error', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                challengeIds: 'coucou',
                tagIds: [],
              }
            }
          },
          params: { id: 'someCourseId' }
        };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                challengeIds: null,
                tagIds: [],
              }
            }
          },
          params: { id: 'someCourseId' }
        };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                tagIds: [],
              }
            }
          },
          params: { id: 'someCourseId' }
        };
        const request3 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                challengeIds: 123,
                tagIds: [],
              }
            }
          },
          params: { id: 'someCourseId' }
        };

        // when
        const error0 = await catchErr(staticCourseController.update)(request0, hFake);
        const error1 = await catchErr(staticCourseController.update)(request1, hFake);
        const error2 = await catchErr(staticCourseController.update)(request2, hFake);
        const error3 = await catchErr(staticCourseController.update)(request3, hFake);

        // then
        expect(error0).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error0.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error1).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error1.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error2).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error2.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error3).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error3.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(saveStub).not.toHaveBeenCalled();
      });

      it('should normalize tagIds to an empty array when not an array', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': 'coucou',
              }
            }
          },
          params: { id: 'someCourseId' },
        };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': null,
              }
            }
          },
          params: { id: 'someCourseId' },
        };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                'challenge-ids': ['chalA'],
              }
            }
          },
          params: { id: 'someCourseId' },
        };
        const request3 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: {
            data: {
              attributes: {
                name: 'some valid name',
                description: 'some valid description',
                'challenge-ids': ['chalA'],
                'tag-ids': 123,
              }
            }
          },
          params: { id: 'someCourseId' },
        };

        // when
        await staticCourseController.update(request0, hFake);
        await staticCourseController.update(request1, hFake);
        await staticCourseController.update(request2, hFake);
        await staticCourseController.update(request3, hFake);

        // then
        const expectedStaticCourse = domainBuilder.buildStaticCourse({
          id: 'someCourseId',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalA'],
          tagIds: [],
          createdAt: new Date('2020-01-01T00:00:01Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).toHaveBeenNthCalledWith(1, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(2, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(3, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(4, expectedStaticCourse);
      });
    });
  });
});
