import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';

import { catchErr, domainBuilder } from '../../../test-helper.js';
import { duplicateModule } from '../../../../lib/domain/usecases/duplicate-module.js';
import { DraftModule } from '../../../../lib/domain/models/index.js';
import { DraftModuleInternalTitleAlreadyUsedError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | duplicateModule', () => {
  let module, moduleRepository, draftModuleRepository, createDraftModule, savedDraftModule;

  beforeEach(() => {
    module = domainBuilder.buildModule({
      id: '6282925d-4775-4bca-b513-4c3009ec5886',
      shortId: '6a68bf32',
      slug: 'comment-devenir-ami-avec-une-ia',
      internalTitle: 'IAGenAmi_CLA',
      title: 'Comment devenir ami avec une IA ?',
      isBeta: true,
      visibility: 'public',
      version: '2.0',
      sections: [
        {
          id: 'aaaaaaaa-1111-1111-1111-111111111111',
          type: 'question-yourself',
          grains: [
            {
              id: 'bbbbbbbb-2222-2222-2222-222222222222',
              type: 'challenge',
              title: 'Grain',
              components: [{ type: 'element', element: { id: 'cccccccc-3333-3333-3333-333333333333', type: 'text', content: 'texte' } }],
            },
          ],
        },
        { id: 'not-a-uuid', type: 'practise', grains: [] },
      ],
    });
    moduleRepository = { getById: vi.fn().mockResolvedValueOnce(module) };
    draftModuleRepository = { isInternalTitleUsed: vi.fn().mockResolvedValueOnce(false) };
    savedDraftModule = Symbol('savedDraftModule');
    createDraftModule = vi.fn().mockResolvedValueOnce(savedDraftModule);
  });

  it('creates and returns a draft module duplicated from the module', async () => {
    // when
    const duplicatedDraftModule = await duplicateModule({ moduleId: module.id }, { moduleRepository, draftModuleRepository, createDraftModule });

    // then
    expect(duplicatedDraftModule).toBe(savedDraftModule);
    expect(moduleRepository.getById).toHaveBeenCalledExactlyOnceWith({ id: module.id });
    expect(createDraftModule).toHaveBeenCalledOnce();
    const [createdDraftModule] = createDraftModule.mock.calls[0];
    expect(createdDraftModule).toBeInstanceOf(DraftModule);
  });

  it('prefixes internal title and title with "[Copie] " and suffixes slug with "-copie"', async () => {
    // when
    await duplicateModule({ moduleId: module.id }, { moduleRepository, draftModuleRepository, createDraftModule });

    // then
    const [createdDraftModule] = createDraftModule.mock.calls[0];
    expect(createdDraftModule.internalTitle).toBe('[Copie] IAGenAmi_CLA');
    expect(createdDraftModule.title).toBe('[Copie] Comment devenir ami avec une IA ?');
    expect(createdDraftModule.slug).toBe('comment-devenir-ami-avec-une-ia-copie');
  });

  it('does not link the draft module to the duplicated module and lets its creation set id, shortId and version', async () => {
    // when
    await duplicateModule({ moduleId: module.id }, { moduleRepository, draftModuleRepository, createDraftModule });

    // then
    const [createdDraftModule] = createDraftModule.mock.calls[0];
    expect(createdDraftModule.moduleId).toBeUndefined();
    expect(createdDraftModule.id).toBeUndefined();
    expect(createdDraftModule.shortId).toBeUndefined();
    expect(createdDraftModule.version).toBeUndefined();
  });

  it('regenerates every UUID "id" field in sections, at every depth', async () => {
    // when
    await duplicateModule({ moduleId: module.id }, { moduleRepository, draftModuleRepository, createDraftModule });

    // then
    const [createdDraftModule] = createDraftModule.mock.calls[0];
    const [duplicatedSection] = createdDraftModule.sections;
    const [duplicatedGrain] = duplicatedSection.grains;
    const [duplicatedComponent] = duplicatedGrain.components;
    expect(duplicatedSection.id).not.toBe('aaaaaaaa-1111-1111-1111-111111111111');
    expect(duplicatedSection.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(duplicatedGrain.id).not.toBe('bbbbbbbb-2222-2222-2222-222222222222');
    expect(duplicatedComponent.element.id).not.toBe('cccccccc-3333-3333-3333-333333333333');
  });

  it('leaves non-UUID "id" fields untouched', async () => {
    // when
    await duplicateModule({ moduleId: module.id }, { moduleRepository, draftModuleRepository, createDraftModule });

    // then
    const [createdDraftModule] = createDraftModule.mock.calls[0];
    expect(createdDraftModule.sections[1].id).toBe('not-a-uuid');
  });

  it('keeps other fields of the module', async () => {
    // when
    await duplicateModule({ moduleId: module.id }, { moduleRepository, draftModuleRepository, createDraftModule });

    // then
    const [createdDraftModule] = createDraftModule.mock.calls[0];
    expect(createdDraftModule.isBeta).toBe(module.isBeta);
    expect(createdDraftModule.visibility).toBe(module.visibility);
    expect(createdDraftModule.details).toStrictEqual(module.details);
    expect(createdDraftModule.glossary).toStrictEqual(module.glossary);
  });

  context('when a draft module already uses the duplicated internal title', () => {
    it('throws a DraftModuleInternalTitleAlreadyUsedError and does not create the draft module', async () => {
      // given
      draftModuleRepository.isInternalTitleUsed = vi.fn().mockResolvedValueOnce(true);

      // when
      const error = await catchErr(duplicateModule)({ moduleId: module.id }, { moduleRepository, draftModuleRepository, createDraftModule });

      // then
      expect(error).toBeInstanceOf(DraftModuleInternalTitleAlreadyUsedError);
      expect(error.message).toBe('Un brouillon avec le titre interne "[Copie] IAGenAmi_CLA" existe déjà.');
      expect(draftModuleRepository.isInternalTitleUsed).toHaveBeenCalledExactlyOnceWith({ internalTitle: '[Copie] IAGenAmi_CLA' });
      expect(createDraftModule).not.toHaveBeenCalled();
    });
  });
});
