import { expect } from '../../../test-helper.js';
import { generateNewId } from '../../../../lib/infrastructure/utils/id-generator.js';

describe('Unit | Infrastructure | Utils | Id Generator', function() {

  it('should generate an id with a given prefix', function() {
    // when
    const generatedId = generateNewId('myPrefix');

    // then
    expect(generatedId.match(/^myPrefix[a-zA-Z0-9]+$/)).to.not.be.null;
  });
});
