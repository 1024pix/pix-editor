import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import Service from '@ember/service';
import ChallengesProductionHeader from 'pixeditor/components/challenges-production/challenges-production-header';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | challenges-production | challenges-production-header', function (hooks) {
  setupIntlRenderingTest(hooks);
  let skill;

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    skill = store.createRecord('skill', {
      id: 'skillAId',
      name: '@skillA1',
      version: 3,
    });

    class MultipanelManager extends Service {
      onTableClosed = sinon.stub();
      expandTable = sinon.stub();
    }
    this.owner.register('service:multipanelManager', MultipanelManager);

    class Router extends Service {
      transitionTo = sinon.stub();
    }
    this.owner.register('service:router', Router);

    class Config extends Service {
      localeToLanguageMap = { en: 'Anglais' };
    }
    this.owner.register('service:config', Config);
  });

  test('should render all information if present', async function (assert) {
    // given
    const locale = 'en';
    const canExpand = true;
    const isToRephrase = true;

    // when
    const screen = await render(
      <template>
        <ChallengesProductionHeader
          @skill={{skill}}
          @locale={{locale}}
          @canExpand={{canExpand}}
          @isToRephrase={{isToRephrase}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByText(skill.name, { exact: false })).exists();
    assert.dom(screen.getByText('actif', { exact: false })).exists();
    assert.dom(screen.getByText(`V${skill.version}`, { exact: false })).exists();
    assert.dom(screen.getByText('À revoir', { exact: false })).exists();
    assert.dom(screen.getByText('Anglais', { exact: false })).exists();

    assert.dom(screen.getByRole('button', { name: 'Agrandir la liste des épreuves' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Fermer la liste des épreuves' })).exists();
  });

  module('when isToRephrase is false', function () {
    test('should not display À revoir tag', async function (assert) {
      // given
      const isToRephrase = false;

      // when
      const screen = await render(
        <template><ChallengesProductionHeader @skill={{skill}} @isToRephrase={{isToRephrase}} /></template>,
      );

      // then
      assert.dom(screen.getByText(skill.name, { exact: false })).exists();
      assert.notOk(await screen.queryByText('À revoir', { exact: false }), 'À revoir tag shoud not be visible');
    });
  });

  module('when canExpand is false', function () {
    test('should not display expand button', async function (assert) {
      // given
      const canExpand = false;

      // when
      const screen = await render(
        <template><ChallengesProductionHeader @skill={{skill}} @canExpand={{canExpand}} /></template>,
      );

      // then
      assert.dom(screen.getByText(skill.name, { exact: false })).exists();
      assert.notOk(
        await screen.queryByRole('button', { name: 'Agrandir la liste des épreuves' }),
        'Expand button should not be visible',
      );
    });
  });

  module('when expanding panel', function () {
    test('should call multipanel manager expand method', async function (assert) {
      // given
      const canExpand = true;
      const multipanelManagerStub = this.owner.lookup('service:multipanelManager');

      // when
      const screen = await render(
        <template><ChallengesProductionHeader @skill={{skill}} @canExpand={{canExpand}} /></template>,
      );
      await click(screen.getByRole('button', { name: 'Agrandir la liste des épreuves' }));

      // then
      assert.ok(multipanelManagerStub.expandTable.calledOnce);
    });
  });

  module('when closing panel', function () {
    test('should call multipanel manager close method and router transitionTo', async function (assert) {
      // given
      const canExpand = true;
      const competenceId = 'competenceId';
      const overview = 'overview';
      const multipanelManagerStub = this.owner.lookup('service:multipanelManager');
      const routerStub = this.owner.lookup('service:router');

      // when
      const screen = await render(
        <template>
          <ChallengesProductionHeader
            @skill={{skill}}
            @canExpand={{canExpand}}
            @competenceId={{competenceId}}
            @overview={{overview}}
          />
        </template>,
      );
      await click(screen.getByRole('button', { name: 'Fermer la liste des épreuves' }));

      // then
      assert.ok(multipanelManagerStub.onTableClosed.calledOnce);
      assert.ok(routerStub.transitionTo.calledWith('authenticated.v2.competence-overview', competenceId, overview));
    });
  });
});
