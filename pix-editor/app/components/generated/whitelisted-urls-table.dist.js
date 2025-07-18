import { camel } from 'kitsu-core'
import PixTable from './pix-table.dist.js';
import PixTableColumn from './pix-table-column.dist.js';
import PixTag from './pix-tag.dist.js';
import RelatedSkillCell from './related-skill-cell.dist.js';
import { computed } from 'vue';


import { createTextVNode as _createTextVNode, resolveComponent as _resolveComponent, createVNode as _createVNode, withCtx as _withCtx, toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

const _hoisted_1 = { class: "whitelisted-urls-table" }

export default { render(_ctx, _cache) {
  const _component_RelatedSkillCell = RelatedSkillCell
  const _component_PixTableColumn = PixTableColumn
  const _component_PixTag = PixTag
  const _component_PixTable = PixTable

  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _createVNode(_component_PixTable, {
      caption: "Liste des URLs à ne pas mettre dans les URLs cassées",
      condensed: "",
      data: _ctx.formattedWhitelistedUrls,
      variant: "primary"
    }, {
      columns: _withCtx(({ row: whitelistedUrl, context }) => [
        _createVNode(_component_PixTableColumn, { context: context }, {
          header: _withCtx(() => _cache[0] || (_cache[0] = [
            _createTextVNode("Nom des acquis concernés")
          ])),
          cell: _withCtx(() => [
            _createVNode(_component_RelatedSkillCell, {
              skills: whitelistedUrl.relatedSkillNames
            }, null, 8 /* PROPS */, ["skills"])
          ]),
          _: 2 /* DYNAMIC */
        }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["context"]),
        _createVNode(_component_PixTableColumn, { context: context }, {
          header: _withCtx(() => _cache[1] || (_cache[1] = [
            _createTextVNode("Type de comparaison")
          ])),
          cell: _withCtx(() => [
            _createVNode(_component_PixTag, {
              class: "whitelisted-url-check-type-tag",
              color: _ctx.checkTypeColor(whitelistedUrl.checkType)
            }, {
              default: _withCtx(() => [
                _createTextVNode(_toDisplayString(_ctx.formatCheckType(whitelistedUrl.checkType)), 1 /* TEXT */)
              ]),
              _: 2 /* DYNAMIC */
            }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["color"])
          ]),
          _: 2 /* DYNAMIC */
        }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["context"]),
        _createVNode(_component_PixTableColumn, {
          context: context,
          class: "column--wide"
        }, {
          header: _withCtx(() => _cache[2] || (_cache[2] = [
            _createTextVNode("URL")
          ])),
          cell: _withCtx(() => [
            _createTextVNode(_toDisplayString(whitelistedUrl?.url), 1 /* TEXT */)
          ]),
          _: 2 /* DYNAMIC */
        }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["context"]),
        _createVNode(_component_PixTableColumn, {
          context: context,
          class: "column--wide"
        }, {
          header: _withCtx(() => _cache[3] || (_cache[3] = [
            _createTextVNode("Commentaire")
          ])),
          cell: _withCtx(() => [
            _createTextVNode(_toDisplayString(whitelistedUrl?.comment), 1 /* TEXT */)
          ]),
          _: 2 /* DYNAMIC */
        }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["context"]),
        _createVNode(_component_PixTableColumn, {
          context: context,
          class: "column--small"
        }, {
          header: _withCtx(() => _cache[4] || (_cache[4] = [
            _createTextVNode("Créée le")
          ])),
          cell: _withCtx(() => [
            _createTextVNode(_toDisplayString(_ctx.formatCreationString(whitelistedUrl)), 1 /* TEXT */)
          ]),
          _: 2 /* DYNAMIC */
        }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["context"]),
        _createVNode(_component_PixTableColumn, {
          context: context,
          class: "column--wide"
        }, {
          header: _withCtx(() => _cache[5] || (_cache[5] = [
            _createTextVNode("Modifée le")
          ])),
          cell: _withCtx(() => [
            _createTextVNode(_toDisplayString(_ctx.formatUpdateString(whitelistedUrl)), 1 /* TEXT */)
          ]),
          _: 2 /* DYNAMIC */
        }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["context"])
      ]),
      _: 1 /* STABLE */
    }, 8 /* PROPS */, ["data"])
  ]))
},
  props: {
  whitelistedUrls: Array,
},
  setup(__props, { expose: __expose }) {
  __expose();

const props = __props;

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

const __returned__ = { props, formattedWhitelistedUrls, formatCheckType, checkTypeColor, formatCreationString, formatUpdateString, formatDateToDDMMYYY, formatDateToHHMM, get camel() { return camel }, PixTable, PixTableColumn, PixTag, RelatedSkillCell, computed }

return __returned__
}

}