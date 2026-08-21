import { render } from '@1024pix/ember-testing-library';
import TubeProfile from 'pixeditor/components/target-profile/tube-profile';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | target-profile/competence-thematic-result', function (hooks) {
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
    assert.dom(screen.getByRole('img', { name: 'Actif' })).exists();
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
});
