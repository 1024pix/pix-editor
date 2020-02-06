import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@classNames('field')
export default class FormSelect extends Component {
  value = false;
}
