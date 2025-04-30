import Component from '@glimmer/component';

export default class RelatedSkillCell extends Component {
  get skills() {
    if (!this.args.skills) {
      return '';
    }
    const skillsArray = this.args.skills.split(',');
    const orderedSkillsArray = skillsArray.sort((a,b) => a.localeCompare(b, undefined, { sensitivity: "case" }));
    if (orderedSkillsArray.length === 1) {
      return orderedSkillsArray[0];
    }
    const other = orderedSkillsArray.length === 2 ? 'autre' : 'autres';
    return `${orderedSkillsArray[0]} et ${orderedSkillsArray.length - 1} ${other} acquis`
  }

  <template>
    {{ this.skills }}
  </template>
}
