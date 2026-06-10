import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import CompetenceOverview from 'pixeditor/components/competence-overview/competence-overview';
import { module, test } from 'qunit';

import { ADMIN, EDITOR, READ_ONLY, READ_PIX_ONLY, REPLICATOR } from '../../../../app/services/access.js';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

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

  [
    ['EDITOR', EDITOR],
    ['ADMIN', ADMIN],
  ].forEach(([roleName, role]) => {
    module(`when user has role ${roleName}`, function (hooks) {
      hooks.beforeEach(function () {
        class Config extends Service {
          accessLevel = role;
        }
        this.owner.register('service:config', Config);
      });

      test('it should display localizedFrameworkTubes button', async function (assert) {
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
  });

  [
    ['READ_PIX_ONLY', READ_PIX_ONLY],
    ['READ_ONLY', READ_ONLY],
    ['REPLICATOR', REPLICATOR],
  ].forEach(([roleName, role]) => {
    module(`when user has role ${roleName}`, function () {
      test(`it should hide localizedFrameworkTubes button`, async function (assert) {
        class Config extends Service {
          accessLevel = role;
        }
        this.owner.register('service:config', Config);

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
});
