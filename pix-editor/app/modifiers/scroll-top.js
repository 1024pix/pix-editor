import { modifier } from 'ember-modifier';

export default modifier((element, [isEdition]) => {
  if (isEdition) {
    element.scrollTop = 0;
  }
});
