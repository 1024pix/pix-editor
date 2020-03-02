import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class Checkbox extends Component {
  ignorableAttrs = ['checked', 'label', 'disabled'];

  elementId = 'checkbox-' + guidFor(this);
}
