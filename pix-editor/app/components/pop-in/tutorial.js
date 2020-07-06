import Component from '@glimmer/component';

export default class PopInTutorialComponent extends Component {

  get hasEmptyMandatoryField() {
    const tutorial = this.args.tutorial;
    return this._fieldIsEmpty(tutorial.language)
      || this._fieldIsEmpty(tutorial.title)
      || this._fieldIsEmpty(tutorial.link)
      || this._fieldIsEmpty(tutorial.source)
      || this._fieldIsEmpty(tutorial.format)
      || this._fieldIsEmpty(tutorial.duration);
  }

  _fieldIsEmpty(field) {
    return field === undefined || field.trim() === '';
  }
}
