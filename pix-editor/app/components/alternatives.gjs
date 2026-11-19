import { PixButton, PixCheckbox, PixIcon } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import AlternativesList from 'pixeditor/components/list/alternatives';
import Challenge from 'pixeditor/models/challenge';

export default class Alternatives extends Component {
  <template>
    <div class="alternatives__header {{if this.config.lite 'lite' ''}}">
      <h1 class="alternatives-header__title">
        Déclinaisons de
        {{@challenge.skillName}}
      </h1>
      <LinkTo @route="authenticated.competence.prototypes.single" @model={{@challenge}} aria-label="Fermer"><PixIcon
          @name="close"
          @ariaHidden={{true}}
        /></LinkTo>
    </div>
    {{#unless @rightMaximized}}
      <div class="alternatives__body alternatives__body--{{@size}}">
        <div class="alternatives__information">
          <PixCheckbox
            @checked={{this.shouldDisplayPerimeAlternatives}}
            {{on "change" this.togglePerimeAlternativesDisplay}}
          >
            <:label>Afficher les déclinaisons périmées</:label>
          </PixCheckbox>
          <p>En production : {{@challenge.productionAlternatives.length}}</p>
          <p>Brouillons : {{@challenge.draftAlternatives.length}}</p>
          {{#if this.canCreateAlternative}}
            <PixButton @iconBefore="add" @triggerAction={{@newAlternative}} data-test-new-alternative-action>
              Nouvelle déclinaison
            </PixButton>
          {{/if}}
        </div>
        <AlternativesList @list={{this.alternatives}} />
      </div>
    {{/unless}}
  </template>

  @tracked competence = null;
  @tracked shouldDisplayPerimeAlternatives = false;

  @service config;

  get alternatives() {
    return this.shouldDisplayPerimeAlternatives
      ? this.args.challenge.alternatives
      : this.args.challenge.alternatives.filter((alternative) => alternative.status !== Challenge.STATUSES.PERIME);
  }

  get canCreateAlternative() {
    return this.args.mayCreateAlternative && this.args.challenge.isLive;
  }

  @action
  togglePerimeAlternativesDisplay(event) {
    this.shouldDisplayPerimeAlternatives = event.target.checked;
  }
}
