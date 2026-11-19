import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import TubeProfile from 'pixeditor/components/target-profile/tube-profile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | target-profile/tube-profile', function (hooks) {
  setupIntlRenderingTest(hooks);
  let tube;
  hooks.beforeEach(async function () {
    // given
    tube = {
      id: 'rec123456',
      name: '@tube1',
      practicalDescriptionFr: 'practicalDescriptionFr',
      practicalTitleFr: 'practicalTitleFr',
    };

    this.tube = tube;
    this.clickOnTube = () => {};
  });

  test('it should be selected if tube have a `selectedSkillLevel` if `showTubeDetails` is `false`', async function (assert) {
    const self = this;

    // given
    this.selectedLevel = 6;
    this.showTubeDetails = false;

    // when
    const screen = await render(
      <template>
        <TubeProfile
          @tube={{self.tube}}
          @clickAction={{self.clickOnTube}}
          @selectedSkillLevel={{self.selectedLevel}}
          @showTubeDetails={{self.showTubeDetails}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('checkbox', { name: '@tube1 : practicalTitleFr' })).isChecked();
    assert.dom(screen.queryByText('6')).doesNotExist();
  });

  test('it should not be selected if tube has no `selectedSkillLevel`', async function (assert) {
    const self = this;

    // when
    const screen = await render(
      <template><TubeProfile @tube={{self.tube}} @clickAction={{self.clickOnTube}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('checkbox', { name: '@tube1 : practicalTitleFr' })).isNotChecked();
  });

  test('it should display a `selectedSkillLevel` if `showTubeDetails` is `true`', async function (assert) {
    const self = this;

    // given
    this.showTubeDetails = true;
    this.selectedLevel = 6;

    // when
    const screen = await render(
      <template>
        <TubeProfile
          @tube={{self.tube}}
          @clickAction={{self.clickOnTube}}
          @selectedSkillLevel={{self.selectedLevel}}
          @showTubeDetails={{self.showTubeDetails}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByText('6')).exists();
  });

  test('it should call `clickAction` with the tube on click', async function (assert) {
    const self = this;

    // given
    const clickAction = sinon.stub();

    // when
    const screen = await render(<template><TubeProfile @tube={{self.tube}} @clickAction={{clickAction}} /></template>);
    await click(screen.getByText('practicalDescriptionFr'));

    // then
    assert.ok(clickAction.calledOnceWith(tube));
  });
});
