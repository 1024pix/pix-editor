import { expect, sinon } from '../../../test-helper.js';
import { notifyReleaseCreationFailure, notifyReleaseCreationSuccess } from '../../../../lib/domain/services/learning-content-notification.js';

describe('Unit | Domain | Services | learning-content-notification', function() {

  describe('#notifyReleaseCreationSuccess', () => {

    it('should send a success message with given Slack notifier', async function() {
      const slackNotifier = {
        send: sinon.stub().resolves(),
      };

      await notifyReleaseCreationSuccess(slackNotifier);

      const expectedBlocks = {
        attachments: [
          {
            mrkdwn_in: ['text'],
            color: '#5bc0de',
            title: 'Information',
            text: 'Une nouvelle version du référentiel vient d’être créée.',
          }
        ]
      };
      expect(slackNotifier.send).to.have.been.calledWithExactly(expectedBlocks);
    });
  });

  describe('#notifyReleaseCreationFailure', () => {

    it('should send a failure message with given Slack notifier', async function() {
      // given
      const slackNotifier = {
        send: sinon.stub().resolves(),
      };
      const errorMessage = 'Some network error occurred';

      // when
      await notifyReleaseCreationFailure(errorMessage, slackNotifier);

      // then
      const expectedBlocks = {
        attachments: [
          {
            mrkdwn_in: ['text'],
            color: '#d9534f',
            title: 'Information',
            text: 'Une erreur s’est produite lors de la création de la version du référentiel.',
            fields: [
              {
                title: 'Error',
                value: errorMessage,
                short: false
              },
            ],
          }
        ]
      };
      expect(slackNotifier.send).to.have.been.calledWithExactly(expectedBlocks);
    });
  });

});
