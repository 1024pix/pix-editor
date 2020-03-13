import Component from '@glimmer/component';

export default class NoteForm extends Component {
  options = {
    status:['en cours', 'terminé', 'archive']
  };
}
