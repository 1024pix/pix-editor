import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';

export default class Checkbox extends Component {
  ignorableAttrs = ['checked', 'label', 'disabled'];

  elementId = 'checkbox-' + guidFor(this);
}
