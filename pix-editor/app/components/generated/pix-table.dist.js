import { computed, getCurrentInstance } from 'vue';
import PixBlock from './pix-block.dist.js';


import { toDisplayString as _toDisplayString, normalizeClass as _normalizeClass, createElementVNode as _createElementVNode, renderSlot as _renderSlot, renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, resolveComponent as _resolveComponent, withCtx as _withCtx, createBlock as _createBlock } from "vue"

const _hoisted_1 = ["onClick"]

export default { render(_ctx, _cache) {
  const _component_PixBlock = PixBlock

  return (_openBlock(), _createBlock(_component_PixBlock, {
    variant: _ctx.variant,
    class: _normalizeClass(["pix-table", { 'pix-table--condensed': !!_ctx.condensed }])
  }, {
    default: _withCtx(() => [
      _createElementVNode("table", null, [
        _createElementVNode("caption", {
          class: _normalizeClass({
        'pix-table__caption': _ctx.displayCaption,
        'screen-reader-only': !_ctx.displayCaption
      })
        }, _toDisplayString(_ctx.caption), 3 /* TEXT, CLASS */),
        _createElementVNode("thead", {
          class: _normalizeClass(`pix-table-header--${_ctx.variant}`)
        }, [
          _createElementVNode("tr", null, [
            _renderSlot(_ctx.$slots, "columns", {
              row: null,
              context: "header"
            })
          ])
        ], 2 /* CLASS */),
        _createElementVNode("tbody", null, [
          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.data, (row, index) => {
            return (_openBlock(), _createElementBlock("tr", {
              key: index,
              class: _normalizeClass({ 'pix-table__clickable-row': _ctx.hasOnRowClick }),
              onClick: $event => (_ctx.onClick(row))
            }, [
              _renderSlot(_ctx.$slots, "columns", {
                row: row,
                context: "cell"
              })
            ], 10 /* CLASS, PROPS */, _hoisted_1))
          }), 128 /* KEYED_FRAGMENT */))
        ])
      ])
    ]),
    _: 3 /* FORWARDED */
  }, 8 /* PROPS */, ["variant", "class"]))
},
  props: {
  variant: {
    type: String,
    default: "primary",
    validator: (value) => {
      return ['primary', 'certif', 'orga', 'admin'].includes(value);
    }
  },
  caption: {
    type: String,
    required: true
  },
  condensed: {
    type: Boolean,
    default: false,
  },
  displayCaption: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array,
    required: true,
  },
},
  emits: ['row-click'],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;

const emits = __emit;

const hasOnRowClick = computed(() => {
  return !!getCurrentInstance()?.vnode.props?.onRowClick
});

function onClick(row, event) {
  event.stopPropagation();
  if (hasOnRowClick.value) {
    emits('row-click', row);
  }
}

const __returned__ = { props, emits, hasOnRowClick, onClick, computed, getCurrentInstance, PixBlock }

return __returned__
}

}