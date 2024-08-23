import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Alternatives extends Component {

  @tracked competence = null;
  @tracked arePerimeDeclisDisplayed = false;

  @service config;

  get alternatives() {
    return this.arePerimeDeclisDisplayed ? this.args.challenge.alternatives : this.args.challenge.alternatives.filter((alternative) => alternative.status !== 'périmé');
  }
}
