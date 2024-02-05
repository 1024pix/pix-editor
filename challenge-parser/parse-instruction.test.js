import { describe, it, expect } from 'vitest';
import { parseInstruction } from './parse-instruction';

describe('parseInstruction', () => {
  it('should parse challenge instruction', () => {
    const instruction = `---
variables:
  - name: person
    type: person
  - name: apples
    type: integer
    params:
      min: 5
      max: 9
  - name: price
    type: integer
    params:
      min: 2
      max: 4
---
Dans son panier {% $bar.firstName %} a {% $apples %} pommes.
Si il arrive à toutes les vendre à {% price %} euros pièce au marché, combien cela va-t-il lui rapporter ?
`;

    const result = parseInstruction(instruction);

    expect(result).toEqual({
      ast: expect.any(Object),
      props: [
        { name: 'person', type: 'person' },
        { name: 'apples', type: 'integer', params: { min: 5, max: 9 } },
        { name: 'price', type: 'integer', params: { min: 2, max: 4 } },
      ],
    })
  });
});
