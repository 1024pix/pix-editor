import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName("")
export default class NoteForm extends Component {
  init() {
    super.init(...arguments);
    this.options = {
      status:["en cours", "terminé", "archive"]
    };
  }

  @action
  save() {
    let entry = this.get("entry");
    if (!entry.get("id")) {
      entry.set("createdAt", (new Date()).toISOString());
    }
    //TODO: show loading
    entry.save()
    .then(this.get("update")());
  }
}
