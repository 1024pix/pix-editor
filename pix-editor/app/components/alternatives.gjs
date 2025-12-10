import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import Alternatives0 from 'pix-editor/components/list/alternatives';
import { Input } from '@ember/component';
import { on } from '@ember/modifier';

export default class Alternatives extends Component {
  <template>
    <div class="main-title {{if this.config.lite 'lite' ''}}">
      <h1 class="ui header">
        <div class="ui right floated menu">
          <LinkTo
            @route="authenticated.competence.prototypes.single"
            @model={{@challenge}}
            class="ui button icon item"
          ><i class="icon window close"></i></LinkTo>
        </div>
        Déclinaisons de
        {{@challenge.skillName}}
      </h1>
    </div>
    {{#unless @rightMaximized}}
      <div class="ui attached segment competence {{@size}}">
        <Alternatives0 @list={{this.alternatives}} />
      </div>
      <div class="ui borderless bottom attached labelled icon menu">
        <div class="item competence-info">
          <div>
            <Input id="hide-perime" @type="checkbox" @checked={{this.arePerimeDeclisDisplayed}} />
            <label for="hide-perime">Afficher les déclinaisons périmées</label>
          </div>
          <div>En production : <span class="production">{{@challenge.productionAlternatives.length}}</span></div>
          <div>Brouillons : <span class="workbench">{{@challenge.draftAlternatives.length}}</span></div>
        </div>
        {{#if this.canCreateAlternative}}
          <button class="ui button right item" {{on "click" @newAlternative}} type="button">
            <i class="plus square outline icon" data-test-new-alternative-action></i>
            Nouvelle déclinaison
          </button>
        {{/if}}
      </div>
    {{/unless}}
  </template>

  @tracked competence = null;
  @tracked arePerimeDeclisDisplayed = false;

  @service config;

  get alternatives() {
    return this.arePerimeDeclisDisplayed
      ? this.args.challenge.alternatives
      : this.args.challenge.alternatives.filter((alternative) => alternative.status !== 'périmé');
  }

  get canCreateAlternative() {
    return this.args.mayCreateAlternative && this.args.challenge.isLive;
  }
}
