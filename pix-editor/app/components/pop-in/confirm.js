import Component from '@glimmer/component';

export default class PopInConfirm extends Component {

  get title() {
    return this.args.title || 'no_title';
  }
}
