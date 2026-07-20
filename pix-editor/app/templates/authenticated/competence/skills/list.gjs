import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import Skills from 'pixeditor/components/list/skills';
<template>
  <div class="competence-skills-list__title">
    <h1 class="competence-skills-list__heading">
      Versions de
      {{@controller.firstSkill.name}}
      <div class="competence-skills-list__actions">
        <PixIconButton @iconName="close" @ariaLabel="Fermer" @triggerAction={{@controller.close}} />
      </div>
    </h1>
  </div>
  <div class="competence-skills-list__body">
    <Skills @list={{@controller.model.sortedSkills}} />
  </div>
  <div class="competence-skills-list__footer">
    {{#if @controller.mayCreateSkill}}
      <PixButton @iconBefore="add" @triggerAction={{@controller.newSkillVersion}}>
        Nouvelle Version
      </PixButton>
    {{/if}}
  </div>
</template>
