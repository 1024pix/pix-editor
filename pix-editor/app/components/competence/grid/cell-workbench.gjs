import { array } from '@ember/helper';
import { LinkTo } from '@ember/routing';
<template>
  <td class="skill-cell workbench">
    <LinkTo
      @route="authenticated.competence.prototypes.list"
      @models={{array @tubeId @skillOverview.airtableId}}
      class="skill-cell__link"
    >
      {{@skillOverview.name}}
      <div class="workbench__status">
        {{#if @skillOverview.proposedChallengesCount}}
          <span
            data-test-draft-prototype-count
            class="grid-count draft-prototype"
            title="Proposé"
          >{{@skillOverview.proposedChallengesCount}}</span>
        {{/if}}
        {{#if @skillOverview.validatedChallengesCount}}
          <span
            data-test-validated-prototype-count
            class="grid-count validated-prototype"
            title="Validé"
          >{{@skillOverview.validatedChallengesCount}}</span>
        {{/if}}
        {{#if @skillOverview.archivedChallengesCount}}
          <span
            data-test-archived-prototype-count
            class="grid-count archived-prototype"
            title="Archivé"
          >{{@skillOverview.archivedChallengesCount}}</span>
        {{/if}}
        {{#if @skillOverview.obsoleteChallengesCount}}
          <span data-test-obsolete-prototype-count class="grid-count obsolete-prototype" title="Périmé">
            {{@skillOverview.obsoleteChallengesCount}}</span>
        {{/if}}
      </div>
    </LinkTo>
  </td>
</template>
