import { describe, expect, it } from 'vitest';

import { getElements } from '../../../../../scripts/modules/helpers/get-elements.js';

describe('Unit | Scripts | Modules | Helpers | get-elements', () => {
  it('returns the elements of element components of every section and grain', () => {
    // given
    const firstElement = buildTextElement({ id: 'element-1' });
    const secondElement = buildTextElement({ id: 'element-2' });
    const thirdElement = buildTextElement({ id: 'element-3' });
    const firstGrain = buildGrain([buildElementComponent(firstElement), buildElementComponent(secondElement)]);
    const secondGrain = buildGrain([buildElementComponent(thirdElement)]);
    const sections = [buildSection([firstGrain]), buildSection([secondGrain])];

    // when
    const returnedElements = getElements(sections);

    // then
    expect(returnedElements).toStrictEqual([
      firstElement,
      secondElement,
      thirdElement,
    ]);
  });

  it('returns the elements of every step of stepper components', () => {
    // given
    const firstStepElement = buildTextElement({ id: 'element-1' });
    const secondStepFirstElement = buildTextElement({ id: 'element-2' });
    const secondStepSecondElement = buildTextElement({ id: 'element-3' });
    const stepper = buildStepperComponent([[firstStepElement], [secondStepFirstElement, secondStepSecondElement]]);
    const sections = [buildSection([buildGrain([stepper])])];

    // when
    const returnedElements = getElements(sections);

    // then
    expect(returnedElements).toStrictEqual([
      firstStepElement,
      secondStepFirstElement,
      secondStepSecondElement,
    ]);
  });

  it('returns the same element references so that they can be edited in place', () => {
    // given
    const element = buildTextElement();
    const sections = [buildSection([buildGrain([buildElementComponent(element)])])];

    // when
    const [returnedElement] = getElements(sections);

    // then
    expect(returnedElement).toBe(element);
  });
});

function buildSection(grains) {
  return { id: 'section-1', type: 'question-yourself', grains };
}

function buildGrain(components) {
  return { id: 'grain-1', type: 'challenge', title: 'Grain', components };
}

function buildElementComponent(element) {
  return { type: 'element', element };
}

function buildStepperComponent(stepsElements) {
  return { type: 'stepper', steps: stepsElements.map((elements) => ({ elements })) };
}

function buildTextElement({ id = 'element-1' } = {}) {
  return { id, type: 'text', content: '<p>Texte</p>' };
}
