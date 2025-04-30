import { render } from '@1024pix/ember-testing-library';
import RelatedSkillCell from 'pixeditor/components/whitelisted-urls/related-skill-cell';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | whitelisted-urls/related-skill-cell', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display an empty when there is no skill', async function(assert) {
    // given
    const skills = null;

    // when
    const screen = await (render(<template>
  <RelatedSkillCell @skills={{skills}} />
</template>));

    // then
    const content = await screen.queryAllByText(/.+/i);

    assert.ok(content.length === 0);
  });

  test('it should display a skill when there is one skill', async function(assert) {
    // given
    const skills = '@skill1';

    // when
    const screen = await (render(<template>
      <RelatedSkillCell @skills={{skills}} />
    </template>));

    // then
    assert.dom(screen.getByText('@skill1')).exists();
  });

  test('it should display the first skill (as in alphabetical order) and a singular version of appended sentence when there is a list of 2 skills', async function(assert) {
    // given
    const skills = '@verite2,@mensonge3';

    // when
    const screen = await (render(<template>
      <RelatedSkillCell @skills={{skills}} />
    </template>));

    // then
    assert.dom(screen.getByText('@mensonge3 et 1 autre acquis')).exists();
  });

  test('it should display the first skill (as in alphabetical order) and a plural version of appended sentence when there is a list of more than 2 skills', async function(assert) {
    // given
    const skills = '@verite2,@mensonge3,@meOperator3';

    // when
    const screen = await (render(<template>
      <RelatedSkillCell @skills={{skills}} />
    </template>));

    // then
    assert.dom(screen.getByText('@mensonge3 et 2 autres acquis')).exists();
  });
});
