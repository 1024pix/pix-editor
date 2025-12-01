import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { selectFiles } from 'ember-file-upload/test-support';
import Illustration from 'pixeditor/components/v2/field/illustration';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';

module('Integration | Component | v2/field/illustration', function (hooks) {
  setupIntlRenderingTest(hooks);
  let addIllustrationStub, removeIllustrationStub, displayStub;

  hooks.beforeEach(() => {
    addIllustrationStub = sinon.stub();
    removeIllustrationStub = sinon.stub();
    displayStub = sinon.stub();
  });

  module('when edition is false', function (hooks) {
    let edition;
    hooks.beforeEach(() => {
      edition = false;
    });

    test('it should display a clickable image when value has `url`', async function (assert) {
      // given
      const image = {
        name: 'file_name',
        url: 'url',
        size: 123,
        type: 'image/png',
      };

      // when
      const screen = await render(
        <template>
          <Illustration
            @title="Illustration"
            @value={{image}}
            @edition={{edition}}
            @addIllustration={{addIllustrationStub}}
            @removeIllustration={{removeIllustrationStub}}
            @display={{displayStub}}
          />
        </template>,
      );

      await click(screen.getByRole('button', { name: "agrandir l'image" }));

      // then
      assert.dom(screen.getByRole('heading', { name: 'Illustration' })).exists();
      assert.ok(displayStub.calledOnce);
    });
  });

  module('when edition is true', function (hooks) {
    let edition;
    hooks.beforeEach(() => {
      edition = true;
    });

    test('it should add an illustration', async function (assert) {
      // when
      const screen = await render(
        <template>
          <Illustration
            @title="Illustration"
            @value={{undefined}}
            @edition={{edition}}
            @addIllustration={{addIllustrationStub}}
            @removeIllustration={{removeIllustrationStub}}
            @display={{displayStub}}
          />
        </template>,
      );

      const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
      await selectFiles(screen.getByLabelText('Choisir une image'), file);

      // then
      assert.ok(removeIllustrationStub.calledOnce);
      assert.ok(addIllustrationStub.calledOnce);
    });

    test('it should remove an illustration', async function (assert) {
      // given
      const image = {
        name: 'file_name',
        url: 'url',
        size: 123,
        type: 'image/png',
      };

      // when
      const screen = await render(
        <template>
          <Illustration
            @title="Illustration"
            @value={{image}}
            @edition={{edition}}
            @addIllustration={{addIllustrationStub}}
            @removeIllustration={{removeIllustrationStub}}
            @display={{displayStub}}
          />
        </template>,
      );

      await click(screen.getByRole('button', { name: "Supprimer l'image" }));

      // then
      assert.ok(removeIllustrationStub.calledOnce);
    });
  });
});
