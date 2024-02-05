import Markdoc from '@markdoc/markdoc';
import yaml from 'js-yaml';

export function parseInstruction(instruction) {
  const ast = Markdoc.parse(instruction);

  const { variables: props } = yaml.load(ast.attributes.frontmatter);

  return { ast, props };
}
