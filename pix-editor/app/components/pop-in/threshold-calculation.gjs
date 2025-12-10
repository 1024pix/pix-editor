import { action } from '@ember/object';
import Component from '@glimmer/component';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import ThresholdRow from 'pix-editor/components/target-profile/threshold-row';
import PixButton from '@1024pix/pix-ui/components/pix-button';

export default class PopinThresholdCalculation extends Component {
  <template>
    <PixModal @title={{@title}} @onCloseButtonClick={{this.closeModal}} @showModal={{@showModal}}>
      <:content>
        <div class="ui column centered grid">
          <table class="ui very basic collapsing celled table">
            <thead>
              <tr>
                <th colspan="2"></th>
                <th>Nombre d'acquis</th>
              </tr>
            </thead>
            <tbody>
              {{#each this.selectedSkillsLevels as |value|}}
                <ThresholdRow @level={{value}} @selectedSkills={{this.selectedSkills}} />
              {{/each}}
            </tbody>
            <tfoot>
              <tr>
                <th colspan="2">Nombre total d'acquis :</th>
                <th data-test-selectedSkillsCount>{{this.selectedSkillsCount}}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </:content>
      <:footer>
        <PixButton
          data-test-sorting-pop-in-deny
          @backgroundColor="transparent-light"
          @isBorderVisible={{true}}
          @triggerAction={{this.closeModal}}
        >
          Fermer
        </PixButton>
      </:footer>
    </PixModal>
  </template>

  get selectedSkills() {
    const selectedSkills = [];
    const areas = this.args.model;
    const selectedTubes = [];
    areas.forEach((area) => {
      area.sortedCompetences.forEach((competence) => {
        competence.productionTubes.forEach((tube) => {
          if (tube.selectedLevel) {
            selectedTubes.push(tube);
          }
        });
      });
    });
    selectedTubes.forEach((tube) => {
      tube.liveSkills.forEach((skill) => {
        if (skill.isActive && skill.level <= tube.selectedLevel) {
          selectedSkills.push(skill);
        }
      });
    });
    return selectedSkills;
  }

  get selectedSkillsCount() {
    return this.selectedSkills.length;
  }

  get selectedSkillsLevels() {
    const levels = [];
    this.selectedSkills.forEach((skill) => {
      if (!levels.includes(skill.level)) {
        levels.push(skill.level);
      }
    });
    return levels.sort();
  }

  @action
  closeModal() {
    this.args.close();
  }
}
