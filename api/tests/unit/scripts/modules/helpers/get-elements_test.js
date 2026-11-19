import { describe, expect, it } from 'vitest';

import { getElements } from '../../../../../scripts/modules/helpers/get-elements.js';

describe('Unit | Scripts | Modules | Helpers | get-elements', () => {
  it('returns the elements of element components of every section and grain, by reference', () => {
    // given
    const firstElement = { id: 'element-1', type: 'text', content: '<p>Texte</p>' };
    const secondElement = { id: 'element-2', type: 'text', content: '<p>Texte</p>' };
    const thirdElement = { id: 'element-3', type: 'text', content: '<p>Texte</p>' };
    const firstSection = { grains: [{ components: [{ type: 'element', element: firstElement }, { type: 'element', element: secondElement }] }] };
    const secondSection = { grains: [{ components: [{ type: 'element', element: thirdElement }] }] };
    const sections = [firstSection, secondSection];

    // when
    const returnedElements = getElements(sections);

    // then
    expect(returnedElements).toStrictEqual([
      firstElement,
      secondElement,
      thirdElement,
    ]);
    // Returned by reference, so that the elements can be edited in place.
    expect(returnedElements[0]).toBe(firstElement);
  });

  it('returns the elements of every step of stepper components', () => {
    // given
    const firstStepElement = { id: 'element-1', type: 'text', content: '<p>Texte</p>' };
    const secondStepFirstElement = { id: 'element-2', type: 'text', content: '<p>Texte</p>' };
    const secondStepSecondElement = { id: 'element-3', type: 'text', content: '<p>Texte</p>' };
    const stepper = {
      type: 'stepper',
      steps: [{ elements: [firstStepElement] }, { elements: [secondStepFirstElement, secondStepSecondElement] }],
    };
    const sections = [{ grains: [{ components: [stepper] }] }];

    // when
    const returnedElements = getElements(sections);

    // then
    expect(returnedElements).toStrictEqual([
      firstStepElement,
      secondStepFirstElement,
      secondStepSecondElement,
    ]);
  });
});
