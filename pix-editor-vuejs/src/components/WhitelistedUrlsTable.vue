<script setup>
import { camel } from 'kitsu-core'
import PixTable from './PixTable.vue';
import PixTableColumn from './PixTableColumn.vue';
import PixTag from './PixTag.vue';
import RelatedSkillCell from './RelatedSkillCell.vue';
import { computed } from 'vue';

const props = defineProps({
  whitelistedUrls: Array,
});

const formattedWhitelistedUrls = computed(() => {
  return props.whitelistedUrls.map(whitelistedUrl => {
    const object = {};
    Object.keys(whitelistedUrl).forEach(key => {
      const camelisedKey = camel(key);
      object[camelisedKey] = whitelistedUrl[key];
    });
    return object;
  });
});

function formatCheckType(checkType) {
  if (checkType === 'exact_match') {
    return 'Strictement égale à';
  } else {
    return 'Commence par';
  }
};

function checkTypeColor(checkType) {
  if (checkType === 'exact_match') {
    return 'primary';
  } else {
    return 'yellow';
  }
};

function formatCreationString(whitelistedUrl) {
  const date = new Date(whitelistedUrl.createdAt);
  const DDMMYYYY = formatDateToDDMMYYY(date);
  const HHMM = formatDateToHHMM(date);
  if (!whitelistedUrl.creatorName) {
    return `${DDMMYYYY} à ${HHMM}`;
  }
  return `${DDMMYYYY} à ${HHMM} par ${whitelistedUrl.creatorName} `;
};

function formatUpdateString(whitelistedUrl) {
  const date = new Date(whitelistedUrl.updatedAt);
  const DDMMYYYY = formatDateToDDMMYYY(date);
  const HHMM = formatDateToHHMM(date);
  if (!whitelistedUrl.latestUpdatorName) {
    return `${DDMMYYYY} à ${HHMM}`;
  }
  return `${DDMMYYYY} à ${HHMM} par ${whitelistedUrl.latestUpdatorName}`;
};

function formatDateToDDMMYYY(date) {
  const formater = new Intl.DateTimeFormat('fr');
  return formater.format(date);
}

function formatDateToHHMM(date) {
  const formater = new Intl.DateTimeFormat('fr', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return formater.format(date);
}
</script>

<template>
  <div class="whitelisted-urls-table">
    <PixTable
      caption="Liste des URLs à ne pas mettre dans les URLs cassées"
      condensed
      :data="formattedWhitelistedUrls"
      variant="primary"
    >
      <template #columns="{ row: whitelistedUrl, context }" >
      <PixTableColumn :context="context">
        <template #header>Nom des acquis concernés</template>
        <template #cell>
          <RelatedSkillCell :skills="whitelistedUrl.relatedSkillNames" />
        </template>
      </PixTableColumn>
      <PixTableColumn :context="context">
        <template #header>Type de comparaison</template>
        <template #cell>
          <PixTag class="whitelisted-url-check-type-tag" :color="checkTypeColor(whitelistedUrl.checkType)">
            {{ formatCheckType(whitelistedUrl.checkType) }}
          </PixTag>
        </template>
      </PixTableColumn>
        <PixTableColumn :context="context" class="column--wide">
          <template #header>URL</template>
          <template #cell>{{ whitelistedUrl?.url }}</template>
        </PixTableColumn>
        <PixTableColumn :context="context" class="column--wide">
          <template #header>Commentaire</template>
          <template #cell>{{ whitelistedUrl?.comment }}</template>
        </PixTableColumn>
        <PixTableColumn :context="context" class="column--small">
          <template #header>Créée le</template>
          <template #cell>{{ formatCreationString(whitelistedUrl) }}</template>
        </PixTableColumn>
        <PixTableColumn :context="context" class="column--wide">
          <template #header>Modifée le</template>
          <template #cell>{{  formatUpdateString(whitelistedUrl) }}</template>
        </PixTableColumn>
      </template>
    </PixTable>
  </div>
</template>
