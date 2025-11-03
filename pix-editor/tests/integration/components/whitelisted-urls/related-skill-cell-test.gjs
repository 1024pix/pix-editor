import { render } from '@1024pix/ember-testing-library';
import { triggerEvent } from '@ember/test-helpers';
import RelatedSkillCell from 'pixeditor/components/whitelisted-urls/related-skill-cell';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | whitelisted-urls/related-skill-cell', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display an empty when there is no skill', async function (assert) {
    // given
    const skills = null;

    // when
    const screen = await (render(<template>
  <RelatedSkillCell @skills={{skills}} />
</template>));

    // then
    const content = await screen.queryAllByText(/.+/i);
    assert.strictEqual(content.length, 0);
  });

  test('it should display a skill when there is one skill', async function (assert) {
    // given
    const skills = '@skill1';

    // when
    const screen = await (render(<template>
      <RelatedSkillCell @skills={{skills}} />
    </template>));
    const allElementsWithSkill = await screen.queryAllByText('@skill1');
    const [skillCell, tooltip] = [allElementsWithSkill.find((el) => el.hasAttribute('aria-labelledby')), allElementsWithSkill.find((el) => !el.hasAttribute('aria-labelledby'))];
    await triggerEvent(skillCell, 'mouseenter');

    // then
    assert.dom(skillCell).exists();
    assert.dom(tooltip).isVisible();
  });

  test('it should display the first skill (as in alphabetical order) and a singular version of appended sentence when there is a list of 2 skills', async function (assert) {
    // given
    const skills = '@verite2,@mensonge3';

    // when
    const screen = await (render(<template>
      <RelatedSkillCell @skills={{skills}} />
    </template>));
    const skillCell = await screen.getByText('@mensonge3 et 1 autre acquis');
    const tooltip = await screen.getByText('@mensonge3,@verite2');
    await triggerEvent(skillCell, 'mouseenter');

    // then
    assert.dom(skillCell).exists();
    assert.dom(tooltip).isVisible();
  });

  test('it should display the first skill (as in alphabetical order) and a plural version of appended sentence when there is a list of more than 2 skills', async function (assert) {
    // given
    const skills = '@verite2,@mensonge3,@meOperator3';

    // when
    const screen = await (render(<template>
      <RelatedSkillCell @skills={{skills}} />
    </template>));
    const skillCell = await screen.getByText('@mensonge3 et 2 autres acquis');
    const tooltip = await screen.getByText('@mensonge3,@meOperator3,@verite2');
    await triggerEvent(skillCell, 'mouseenter');

    // then

    // then
    assert.dom(skillCell).exists();
    assert.dom(tooltip).isVisible();
  });
});
