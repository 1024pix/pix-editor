export function filterFrameworkFields({ id, name }) {
  return { id, name };
}

export function filterFrameworksFields(frameworks) {
  return frameworks.map(filterFrameworkFields);
}
