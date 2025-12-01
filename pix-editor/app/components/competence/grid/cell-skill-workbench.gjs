import Component from '@glimmer/component';
import { LinkTo } from '@ember/routing';
import { array } from '@ember/helper';

export default class CompetenceGridCellSkillWorkbenchComponent extends Component {
  <template>
    <td class="skill-cell skill-workbench">
      <LinkTo
        @route="authenticated.competence.skills.list"
        @models={{array @tube.id @skill.level}}
        class="skill-cell__link"
      >
        <div class="skill-name">
          {{@skill.name}}
        </div>
        <div class="skill-workbench__status">
          {{#if this.hasDraftSkill}}
            <span
              data-test-draft-count
              class="workbench-status draft-skill ui tiny label"
              title="En construction"
            >{{this.draftCount}}</span>
          {{/if}}

          {{#if this.hasActiveSkill}}
            <span data-test-active-count class="workbench-status active-skill ui tiny label" title="Validé">1</span>
          {{/if}}

          {{#if this.hasArchivedSkill}}
            <span
              data-test-archived-count
              class="workbench-status archive-skill ui tiny label"
              title="Archivé"
            >{{this.archivedCount}}</span>
          {{/if}}

          {{#if this.hasObsoleteSkill}}
            <span
              data-test-obsolete-count
              class="workbench-status obsolete-skill ui tiny label"
              title="Périmé"
            >{{this.obsoleteCount}}</span>
          {{/if}}
        </div>
      </LinkTo>
    </td>
  </template>

  get archivedCount() {
    const archivedSkill = this.args.skills.filter((skill) => skill.isArchived);
    return archivedSkill.length;
  }

  get obsoleteCount() {
    const obsoleteSkills = this.args.skills.filter((skill) => skill.isObsolete);
    return obsoleteSkills.length;
  }

  get draftCount() {
    const draftSkill = this.args.skills.filter((skill) => skill.isDraft);
    return draftSkill.length;
  }

  get hasActiveSkill() {
    const activeSkill = this.args.skills.filter((skill) => skill.isActive);
    return activeSkill.length > 0;
  }

  get hasDraftSkill() {
    return this.draftCount > 0;
  }

  get hasArchivedSkill() {
    return this.archivedCount > 0;
  }

  get hasObsoleteSkill() {
    return this.obsoleteCount > 0;
  }
}
