import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class PopinTubeLevel extends Component {
  <template>
    <PixModal
      @title={{this.title}}
      @onCloseButtonClick={{this.closeModal}}
      @showModal={{@showModal}}
      class="popin-tube-level"
    >
      <:content>
        <div class="levels">
          {{#each this.skillsAndSelectedStatus as |skillAndSelectedStatus|}}
            {{#if skillAndSelectedStatus}}
              <div
                class="level {{if skillAndSelectedStatus.isSelected 'selected'}}"
                {{on "click" (fn this.select skillAndSelectedStatus.skill)}}
              >
                {{skillAndSelectedStatus.skill.level}}
              </div>
            {{else}}
              <div class="level disabled"></div>
            {{/if}}
          {{/each}}
        </div>
      </:content>
      <:footer>
        <PixButton
          data-test-cancel-button
          @backgroundColor="transparent-light"
          @isBorderVisible={{true}}
          @triggerAction={{this.closeModal}}
        >
          {{t "common.cancel"}}
        </PixButton>
        {{#if this.mayUnset}}
          <PixButton data-test-erase-button @triggerAction={{this.clear}}>
            Effacer
          </PixButton>
        {{/if}}
      </:footer>
    </PixModal>
  </template>

  get title() {
    return this.args.tube?.name || 'no_tube';
  }

  get skillsAndSelectedStatus() {
    const skills = this.args.skills;
    const selected = this.args.selectedSkills;
    return skills.reduce(
      (orderedSkills, skill) => {
        const level = skill.level;
        const isSelected = selected.includes(skill.pixId);
        orderedSkills[level - 1] = { skill, isSelected };
        return orderedSkills;
      },
      [null, null, null, null, null, null, null, null],
    );
  }

  get mayUnset() {
    const value = this.args.level;
    return value != false;
  }

  @action
  select(skill) {
    const level = skill.level;
    const skillIds = this.skillsAndSelectedStatus.reduce((ids, skillAndSelectedStatus) => {
      if (skillAndSelectedStatus && skillAndSelectedStatus.skill.level <= level) {
        ids.push(skillAndSelectedStatus.skill.pixId);
      }
      return ids;
    }, []);
    this.args.setTubeLevel(this.args.tube, level, skillIds);
    this.closeModal();
  }

  @action
  clear() {
    this.args.clearTube(this.args.tube);
    this.closeModal();
  }

  @action
  closeModal() {
    this.args.close();
  }
}
