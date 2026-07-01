import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { Input } from '@ember/component';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Alternatives0 from 'pixeditor/components/list/alternatives';
import Challenge from 'pixeditor/models/challenge';

export default class Alternatives extends Component {
  <template>
    <div class="alternatives__title {{if this.config.lite 'alternatives__title--lite'}}">
      <h1 class="alternatives__heading">
        Déclinaisons de
        {{@challenge.skillName}}
        <div class="alternatives__actions">
          <LinkTo
            @route="authenticated.competence.prototypes.single"
            @model={{@challenge}}
            class="alternatives__close"
            aria-label="Fermer"
          ><PixIcon @name="close" @ariaHidden={{true}} /></LinkTo>
        </div>
      </h1>
    </div>
    {{#unless @rightMaximized}}
      <div class="alternatives__body {{@size}}">
        <Alternatives0 @list={{this.alternatives}} />
      </div>
      <div class="alternatives__footer">
        <div class="alternatives__info">
          <div>
            <Input id="hide-perime" @type="checkbox" @checked={{this.arePerimeDeclisDisplayed}} />
            <label for="hide-perime">Afficher les déclinaisons périmées</label>
          </div>
          <div>En production :
            <span
              class="alternatives__count alternatives__count--production"
            >{{@challenge.productionAlternatives.length}}</span></div>
          <div>Brouillons :
            <span
              class="alternatives__count alternatives__count--workbench"
            >{{@challenge.draftAlternatives.length}}</span></div>
        </div>
        {{#if this.canCreateAlternative}}
          <PixButton
            class="alternatives__create"
            @iconBefore="add"
            @triggerAction={{@newAlternative}}
            data-test-new-alternative-action
          >
            Nouvelle déclinaison
          </PixButton>
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
      : this.args.challenge.alternatives.filter((alternative) => alternative.status !== Challenge.STATUSES.PERIME);
  }

  get canCreateAlternative() {
    return this.args.mayCreateAlternative && this.args.challenge.isLive;
  }
}
