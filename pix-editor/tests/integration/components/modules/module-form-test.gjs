import { render } from '@1024pix/ember-testing-library';
import { click, fillIn, waitUntil } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import * as monaco from 'monaco-editor';
import ModuleForm from 'pixeditor/components/modules/module-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

const isChrome = navigator?.userAgent?.includes(' Chrome/');
const MODULE_SCHEMA_URI = '/api/module-schema/module-json-schema.json';

module('Integration | Component | modules/module-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.sandbox = sinon.createSandbox();
  });

  hooks.afterEach(async function () {
    this.sandbox.restore();
    // WORKAROUND: let some time for monaco-editor to dismount
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  test.if('it parses and saves a module data', !isChrome, async function (assert) {
    // given
    const saveModule = sinon.stub();

    // when
    const screen = await render(<template><ModuleForm @saveModule={{saveModule}} /></template>);

    // then
    const saveButton = screen.getByRole('button', { name: t('modules.components.module-form.save') });
    assert.dom(saveButton).hasAttribute('aria-disabled');

    const internalTitle = screen.getByRole('textbox', {
      name: new RegExp(`^${t('modules.components.module-form.internal-title-label')}`),
    });
    await fillIn(internalTitle, 'PALOURDE_MAGIQUE');

    assert.dom(saveButton).hasAttribute('aria-disabled');

    const monacoEditor = await screen.findByLabelText(t('modules.components.module-form.content-label'));
    assert.dom(monacoEditor).exists();

    await fillIn(monacoEditor, JSON.stringify({ slug: 'limaçoooooooooooooooooooon' }));

    assert.dom(saveButton).doesNotHaveAttribute('aria-disabled');

    await click(saveButton);
    sinon.assert.calledWithExactly(saveModule, {
      internalTitle: 'PALOURDE_MAGIQUE',
      slug: 'limaçoooooooooooooooooooon',
    });
  });

  module('when a module is given in argument', function () {
    test.if('it uses module’s data as default value', !isChrome, async function (assert) {
      // given
      const moduleWoInternalTitle = {
        id: 'dadfd2d3-0430-47ce-ae0f-455459f12d3b',
        shortId: 'dadfd2d3',
        slug: 'escargot-de-bourgogne',
        details: { level: 1000 },
        sections: [],
      };
      const module = {
        ...moduleWoInternalTitle,
        internalTitle: 'MOL_escargot-bourgogne',
      };

      // when
      const screen = await render(<template><ModuleForm @module={{module}} /></template>);

      // then
      assert
        .dom(
          screen.getByRole('textbox', {
            name: new RegExp(`^${t('modules.components.module-form.internal-title-label')}`),
          }),
        )
        .hasValue(module.internalTitle);

      assert
        .dom(await screen.findByLabelText(t('modules.components.module-form.content-label')))
        .hasValue(JSON.stringify(moduleWoInternalTitle, null, 2));
    });
  });

  module('when module-form is readonly', function () {
    test('it should not display actions buttons', async function (assert) {
      const moduleWoInternalTitle = {
        id: 'dadfd2d4-0430-47ce-ae0f-455459f12d3b',
        shortId: 'dadfd2d4',
        slug: 'escargot-du loiret',
        details: { level: 1001 },
        sections: [],
      };
      const module = {
        ...moduleWoInternalTitle,
        internalTitle: 'MOL_escargot-loiret',
      };

      // when
      const screen = await render(<template><ModuleForm @module={{module}} @readonly={{true}} /></template>);

      // then
      assert
        .dom(
          await screen.queryByRole('textbox', {
            name: new RegExp(`^${t('modules.components.module-form.internal-title-label')}`),
          }),
        )
        .doesNotExist();
      assert.dom(await screen.queryByRole('button', { name: t('modules.components.module-form.save') })).doesNotExist();
      assert
        .dom(await screen.queryByRole('button', { name: t('modules.components.module-form.cancel') }))
        .doesNotExist();
    });
  });

  module('when the module JSON schema is loaded', function () {
    test.if(
      'it configures monaco’s json validation for every module-form instance, fetching the schema at most once',
      !isChrome,
      async function (assert) {
        // given
        const schema = { type: 'object', properties: { slug: { type: 'string' } } };
        this.sandbox
          .stub(window, 'fetch')
          .withArgs(MODULE_SCHEMA_URI)
          .resolves({ json: () => Promise.resolve(schema) });
        const setDiagnosticsOptions = this.sandbox.spy(monaco.languages.json.jsonDefaults, 'setDiagnosticsOptions');
        const saveModule = sinon.stub();

        // when
        // two instances are rendered together: the module-level schema cache should be shared between them
        await render(
          <template>
            <ModuleForm @saveModule={{saveModule}} />
            <ModuleForm @saveModule={{saveModule}} />
          </template>,
        );
        await waitUntil(() => setDiagnosticsOptions.callCount >= 2);

        // then
        assert.true(
          window.fetch.callCount <= 1,
          'the schema is only fetched once, no matter how many instances render',
        );
        assert.strictEqual(setDiagnosticsOptions.callCount, 2, 'each instance configures monaco’s json validation');
        setDiagnosticsOptions.getCalls().forEach((call) => {
          const [options] = call.args;
          assert.true(options.validate);
          assert.strictEqual(options.schemas.length, 1);
          assert.strictEqual(options.schemas[0].uri, MODULE_SCHEMA_URI);
          assert.deepEqual(options.schemas[0].fileMatch, ['*']);
        });
      },
    );
  });
});
