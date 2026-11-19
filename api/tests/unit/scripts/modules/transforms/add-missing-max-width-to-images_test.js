import { describe, expect, it } from 'vitest';

import { domainBuilder } from '../../../../test-helper.js';
import { addMissingMaxWidthToImages } from '../../../../../scripts/modules/transforms/add-missing-max-width-to-images.js';

describe('Unit | Scripts | Modules | Transforms | add-missing-max-width-to-images', () => {
  it('adds maxWidth set to 0 to image elements without maxWidth', () => {
    // given
    const firstImage = buildImageElement({ id: 'image-1' });
    const secondImage = buildImageElement({ id: 'image-2' });
    const module = buildModuleWithComponents([buildElementComponent(firstImage), buildElementComponent(secondImage)]);

    // when
    const { sections, numberOfEditedObjects } = addMissingMaxWidthToImages(module);

    // then
    const returnedImages = sections[0].grains[0].components.map((component) => component.element);
    const expectedFirstImage = { ...firstImage, maxWidth: 0 };
    const expectedSecondImage = { ...secondImage, maxWidth: 0 };
    expect(numberOfEditedObjects).toBe(2);
    expect(returnedImages).toStrictEqual([expectedFirstImage, expectedSecondImage]);
  });

  it('does not update image elements which already have a maxWidth', () => {
    // given
    const imageWithMaxWidth = buildImageElement({ id: 'image-1', maxWidth: 400 });
    const imageWithZeroMaxWidth = buildImageElement({ id: 'image-2', maxWidth: 0 });
    const module = buildModuleWithComponents([buildElementComponent(imageWithMaxWidth), buildElementComponent(imageWithZeroMaxWidth)]);

    // when
    const { sections, numberOfEditedObjects } = addMissingMaxWidthToImages(module);

    // then
    expect(numberOfEditedObjects).toBe(0);
    expect(sections).toStrictEqual(module.sections);
  });

  it('ignores elements which are not images', () => {
    // given
    const module = buildModuleWithComponents([buildElementComponent(buildTextElement())]);

    // when
    const { sections, numberOfEditedObjects } = addMissingMaxWidthToImages(module);

    // then
    expect(numberOfEditedObjects).toBe(0);
    expect(sections).toStrictEqual(module.sections);
  });

  it('returns an updated copy of the sections without modifying the given module', () => {
    // given
    const module = buildModuleWithComponents([buildElementComponent(buildImageElement())]);
    const originalSections = structuredClone(module.sections);

    // when
    const { sections } = addMissingMaxWidthToImages(module);

    // then
    expect(sections).not.toBe(module.sections);
    expect(module.sections).toStrictEqual(originalSections);
  });
});

function buildModuleWithComponents(components) {
  return domainBuilder.buildModule({ sections: [buildSection([buildGrain(components)])] });
}

function buildSection(grains) {
  return { id: 'section-1', type: 'question-yourself', grains };
}

function buildGrain(components) {
  return { id: 'grain-1', type: 'challenge', title: 'Grain', components };
}

function buildElementComponent(element) {
  return { type: 'element', element };
}

function buildImageElement({ id = 'image-1', ...attributes } = {}) {
  return {
    id,
    type: 'image',
    url: 'https://assets.pix.org/modules/image.svg',
    alt: 'Une image',
    alternativeText: '',
    legend: '',
    licence: '',
    ...attributes,
  };
}

function buildTextElement({ id = 'text-1' } = {}) {
  return { id, type: 'text', content: '<p>Texte</p>' };
}
