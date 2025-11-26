import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { concat, fn } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

export default class LocalizedFramework extends Component {
  @service store;
  @service router;

  @tracked tubeMaxLevelById = Object.fromEntries(this.args.localizedFrameworkTubes.map(({ tubeId, maxLevel }) => [tubeId, maxLevel]));

  @action
  getMaxLevelLocalizedFrameworkTube(tubeId) {
    return this.tubeMaxLevelById[tubeId] ?? 8;
  }

  @action
  async save() {
    const localizedFrameworkTubesToSave = [];
    for (const tubeId in this.tubeMaxLevelById) {
      const existingLocalizedFrameworkTube = this.args.localizedFrameworkTubes.find((localizedFrameworkTube) => localizedFrameworkTube.tubeId === tubeId);
      if (existingLocalizedFrameworkTube) {
        existingLocalizedFrameworkTube.maxLevel = this.tubeMaxLevelById[tubeId];
        localizedFrameworkTubesToSave.push(existingLocalizedFrameworkTube);
      } else {
        localizedFrameworkTubesToSave.push(this.store.createRecord('localized-framework-tube', {
          locale: this.args.locale,
          tubeId,
          maxLevel: this.tubeMaxLevelById[tubeId],
        }));
      }
    }
    await Promise.all(localizedFrameworkTubesToSave.map((localizedFramework) => localizedFramework.save()));
    this.router.transitionTo('authenticated.v2.competence-overview', this.args.competence.id, 'challenges-production');
  }

  @action
  updateMaxLevel(tubeId, e) {
    this.tubeMaxLevelById[tubeId] = Number(e.target.value);
  }

  <template>
    <div class="competence-overview localized-framework-tube">
      <div class="competence-overview-actions">
        <PixButton
          class="competence-overview-actions__fetch"
          @size="small"
          @isBorderVisible={{true}}
          @variant="secondary"
          @loadingColor="grey"
          @triggerAction={{this.save}}
        >
          Enregistrer
        </PixButton>
      </div>
      <div class="competence-overview-grid">
      {{#each @competence.sortedThemes as |theme|}}
        <div class="thematic" style={{concat "--tubes-count: " theme.tubes.length ";"}}>
          <h3>{{theme.name}}</h3>
          {{#each theme.tubes as |tube|}}
          <div class="tube">
            <h4>{{tube.name}}</h4>
            <PixInput max=8 min=0 type="number" @screenReaderOnly={{true}} @value={{this.getMaxLevelLocalizedFrameworkTube tube.id}} {{on "change" (fn this.updateMaxLevel tube.id)}}>
              <:label>Modifier le niveau max du tube {{tube.name}}</:label>
            </PixInput>
          </div>
          {{/each}}
        </div>
      {{/each}}
      </div>
    </div>
  </template>
}
