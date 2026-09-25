// Generates invalid variants of a value by mutating each of its nodes
const MUTATIONS = [
  { name: 'delete', apply: () => undefined },
  { name: 'empty string', apply: () => '' },
  { name: 'blank', apply: () => ' ' },
  { name: 'number', apply: () => 42 },
  { name: 'negative', apply: () => -1 },
  { name: 'float', apply: () => 1.5 },
  { name: 'boolean', apply: () => true },
  { name: 'null', apply: () => null },
  { name: 'string', apply: () => 'x' },
  { name: 'html', apply: () => '<p>html</p>' },
  { name: 'style tag', apply: () => '<style>p {}</style>' },
  { name: 'long string', apply: () => 'a'.repeat(30) },
  { name: 'uri', apply: () => 'https://pix.fr/a b' },
  { name: 'empty array', apply: () => [] },
  { name: 'empty object', apply: () => ({}) },
  { name: 'unknown key', apply: (value) => (isObject(value) ? { ...value, unknownKey: 1 } : undefined) },
  { name: 'duplicate item', apply: (value) => (Array.isArray(value) && value.length > 0 ? [...value, value[0]] : undefined) },
];

export function* mutate(root, { under = [], skip = [], mutations = MUTATIONS.map(({ name }) => name) } = {}) {
  for (const path of paths(get(root, under), under)) {
    if (skip.some((skipped) => startsWith(path, skipped))) {
      continue;
    }
    const original = get(root, path);
    for (const mutation of MUTATIONS.filter(({ name }) => mutations.includes(name))) {
      const mutated = mutation.apply(original);
      if (mutated === undefined && mutation.name !== 'delete') {
        continue;
      }
      yield { name: `${path.join('.') || '<root>'} → ${mutation.name}`, value: set(root, path, mutated, mutation.name === 'delete') };
    }
  }
}

function* paths(value, path = []) {
  yield path;
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      yield* paths(item, [...path, index]);
    }
  } else if (isObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      yield* paths(item, [...path, key]);
    }
  }
}

function startsWith(path, prefix) {
  return prefix.every((key, index) => path[index] === key);
}

function get(value, path) {
  return path.reduce((node, key) => node[key], value);
}

function set(root, path, newValue, remove) {
  if (path.length === 0) {
    return newValue;
  }
  const copy = structuredClone(root);
  const parent = get(copy, path.slice(0, -1));
  const key = path.at(-1);
  if (remove) {
    if (Array.isArray(parent)) {
      parent.splice(key, 1);
    } else {
      Reflect.deleteProperty(parent, key);
    }
  } else {
    parent[key] = newValue;
  }
  return copy;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
