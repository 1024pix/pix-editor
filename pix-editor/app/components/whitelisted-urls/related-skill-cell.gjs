import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';

export default class RelatedSkillCell extends Component {
  constructor(...args) {
    super(...args);
    this.id = 'related-skill-cell-' + guidFor(this);
  }

  get skillCellContent() {
    if (!this.args.skills) {
      return '';
    }
    const skillsArray = this.args.skills.split(',');
    const orderedSkillsArray = skillsArray.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'case' }));
    if (orderedSkillsArray.length === 1) {
      return orderedSkillsArray[0];
    }
    const other = orderedSkillsArray.length === 2 ? 'autre' : 'autres';
    return `${orderedSkillsArray[0]} et ${orderedSkillsArray.length - 1} ${other} acquis`;
  }

  get skillTooltipContent() {
    if (!this.args.skills) {
      return '';
    }
    const skillsArray = this.args.skills.split(',');
    return skillsArray
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'case' }))
      .join(',');
  }

  <template>
    <PixTooltip @id={{this.id}} @position="top-right">
      <:triggerElement>
        <span class="icon icon-info" aria-labelledby={{this.id}}>{{this.skillCellContent}}</span>
      </:triggerElement>

      <:tooltip>
        {{this.skillTooltipContent}}
      </:tooltip>
    </PixTooltip>
  </template>
}
