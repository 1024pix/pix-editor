import { render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';

import CompetenceOverview from 'pix-editor/components/competence-overview/competence-overview';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import sinon from 'sinon';
import Service from '@ember/service';

module('Integration | Component | competence-overview | competence-overview', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen, competenceOverview;

  hooks.beforeEach(function () {
    competenceOverview = {
      id: 'competence1:challenges-production:nl',
      name: '1.1 ma compétence',
      airtableId: 'recCompetence1',
      thematicOverviews: [
        {
          id: 'thematic1',
          name: 'thematic name',
          tubeOverviews: [
            {
              id: 'tube1',
              name: '@tube',
              skillOverviews: [null, null, null, null, null, null, null],
            },
          ],
        },
      ],
    };
  });

  module('when user is admin', function (hooks) {
    hooks.beforeEach(function () {
      const isAdminStub = sinon.stub().returns(true);
      class Access extends Service {
        isAdmin = isAdminStub;
      }
      this.owner.register('service:access', Access);
    });

    test('it should display localized framework link if locale is defined', async function (assert) {
      // given
      const locale = 'nl';

      // when
      screen = await render(
        <template><CompetenceOverview @competenceOverview={{competenceOverview}} @locale={{locale}} /></template>,
      );

      // then
      const link = screen.getByText('Cadre de traduction');
      assert.dom(link).exists();
    });

    test('it should hide localized framework link if locale is undefined', async function (assert) {
      // given
      const locale = undefined;

      // when
      screen = await render(
        <template><CompetenceOverview @competenceOverview={{competenceOverview}} @locale={{locale}} /></template>,
      );

      // then
      const link = await screen.queryByText('Cadre de traduction');
      assert.dom(link).doesNotExist();
    });
  });
  module('when user not admin', function (hooks) {
    hooks.beforeEach(function () {
      const isAdminStub = sinon.stub().returns(false);
      class Access extends Service {
        isAdmin = isAdminStub;
      }
      this.owner.register('service:access', Access);
    });

    test('it should hide localized framework link ', async function (assert) {
      // given
      const locale = 'nl';

      // when
      screen = await render(
        <template><CompetenceOverview @competenceOverview={{competenceOverview}} @locale={{locale}} /></template>,
      );

      // then
      const link = await screen.queryByText('Cadre de traduction');
      assert.dom(link).doesNotExist();
    });
  });
});
