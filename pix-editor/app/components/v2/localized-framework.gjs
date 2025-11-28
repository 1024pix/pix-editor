import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { concat, fn } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { trackedArray } from '@ember/reactive/collections';
import { service } from '@ember/service';
import LocalizedFrameworkTube from './field/localized-framework-tube';

export default class LocalizedFramework extends Component {
  @service store;
  @service router;

  @tracked tubeMaxLevelById = Object.fromEntries(this.args.localizedFrameworkTubes.map(({ tubeId, maxLevel }) => [tubeId, maxLevel]));
  @tracked inputStateList = trackedArray([]);

  get isInvalidForm() {
    return this.inputStateList.some((state) => state === 'error');
  }

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
  updateMaxLevel(tubeId, value) {
    this.tubeMaxLevelById[tubeId] = value;
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
          @isDisabled={{this.isInvalidForm}}
          @triggerAction={{this.save}}
        >
          Enregistrer
        </PixButton>
      </div>
      <div class="competence-overview-grid">
      {{#each @competence.sortedThemes as |theme|}}
        <div class="thematic" style={{concat "--tubes-count: " theme.tubes.length ";"}}>
          <h3>{{theme.name}}</h3>
          {{#each theme.tubes as |tube index|}}
          <div class="tube">
            <h4>{{tube.name}}</h4>
            <LocalizedFrameworkTube
              @tube={{tube}}
              @index={{index}}
              @updateMaxLevel={{this.updateMaxLevel}}
              @inputStateList={{this.inputStateList}}
              @value={{this.getMaxLevelLocalizedFrameworkTube tube.id}}
            />
          </div>
          {{/each}}
        </div>
      {{/each}}
      </div>
    </div>
  </template>
}
