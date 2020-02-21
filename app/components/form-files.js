import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { classNames } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

@classic
@classNames('field')
export default class FormFiles extends Component {
  @service
  filePath;

  @action
  remove(index) {
    // clone instead of removeAt, so that rollbackAttributes
    // may work
    let list = this.get('value').slice();
    list.splice(index, 1);
    this.set('value', list);
  }

  @action
  add(file) {
    const value = this.get('value');
    let list = value?value.slice():[];
    list.unshift({file:file, url:'', filename:file.get('name')});
    this.set('value', list);
    if (this.get('baseName') == null) {
      this.set('baseName', this.get('filePath').getBaseName(file.get('name')));
    }
  }
}
