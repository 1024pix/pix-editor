// Returns every element of the given sections, including the elements of each stepper step.
export function getElements(sections) {
  return sections
    .flatMap((section) => section.grains)
    .flatMap((grain) => grain.components)
    .flatMap((component) => component.type === 'stepper'
      ? component.steps.flatMap((step) => step.elements)
      : [component.element]);
}
