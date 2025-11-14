import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { selectFiles } from 'ember-file-upload/test-support';
import Files from 'pixeditor/components/v2/field/files';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';

module('Integration | Component | v2/field/files', function(hooks) {
  setupIntlRenderingTest(hooks);
  let addAttachmentStub, removeAttachmentStub, updateBasenameStub;

  hooks.beforeEach(() => {
    addAttachmentStub = sinon.stub();
    removeAttachmentStub = sinon.stub();
    updateBasenameStub = sinon.stub();
  });

  module('when edition is false', function(hooks) {
    let edition;
    hooks.beforeEach(() => {
      edition = false;
    });

    test('it should display a downloadable file', async function(assert) {
      // given
      const piecesJointes = [
        {
          filename: 'file_name',
          url: 'url',
          size: 123,
          type: 'text/csv',
        },
      ];

      const attachmentBaseName = 'pouet';

      // when
      const screen = await render(
      <template>
        <Files
          @title="Pièces jointes"
          @value={{piecesJointes}}
          @baseName={{attachmentBaseName}}
          @edition={{edition}}
          @removeAttachment={{removeAttachmentStub}}
          @addAttachment={{addAttachmentStub}}
        />
      </template>,
      );

      // then
      assert.ok(screen.getByRole('link', { name: 'file_name' }).hasAttributes('href', 'url'));
      assert.dom(screen.getByRole('heading', { name: 'Pièces jointes' })).exists();
    });
  });

  module('when edition is true', function(hooks) {
    let edition;
    hooks.beforeEach(() => {
      edition = true;
    });

    test('it should add a file', async function(assert) {
      // given
      const attachmentBaseName = 'attachmentBaseName';
      const file = new File([], 'challenge-file.csv', { type: 'text/csv' });
      addAttachmentStub.withArgs({ file: sinon.match({ file }) });

      // when
      const screen = await render(
      <template>
        <Files
          @title="Pièces jointes"
          @baseName={{attachmentBaseName}}
          @edition={{edition}}
          @removeAttachment={{removeAttachmentStub}}
          @addAttachment={{addAttachmentStub}}
        />
      </template>,
      );

      await selectFiles(screen.getByLabelText('Ajouter un fichier...'), file);

      // then
      assert.ok(addAttachmentStub.calledOnce);
    });

    test('it should remove a file', async function(assert) {
      // given
      const file1 = {
        filename: 'file_name',
        url: 'url',
        size: 123,
        type: 'text/csv',
      };
      const file2
        = {
          filename: 'file_name2',
          url: 'url2',
          size: 456,
          type: 'text/csv',
        };

      const piecesJointes = [file1, file2];

      const attachmentBaseName = 'pouet';
      removeAttachmentStub.withArgs({ file: sinon.match({ file: file2 }) });

      // when
      const screen = await render(
      <template>
        <Files
          @title="Pièces jointes"
          @value={{piecesJointes}}
          @attachmentBaseName={{attachmentBaseName}}
          @edition={{edition}}
          @removeAttachment={{removeAttachmentStub}}
          @addAttachment={{addAttachmentStub}}
          @updateBasename={{updateBasenameStub}}
        />
      </template>,
      );

      await click(screen.getByRole('button', { name: 'Supprimer la pièce jointe file_name2' }));

      // then
      assert.ok(removeAttachmentStub.calledOnce);
    });
  });
});
