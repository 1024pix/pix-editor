import { render } from '@1024pix/ember-testing-library';
import NoteForm from 'pixeditor/components/form/note';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | note-form', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen;

  test('renders the note form with status menu', async function (assert) {
    // given
    const mockFn = () => {};

    //  when
    screen = await render(<template><NoteForm @close={{mockFn}} @edit={{mockFn}} @entry={{mockFn}} /></template>);

    //  then
    assert.dom(screen.getByRole('button', { name: 'Statut' })).exists();
  });
});
