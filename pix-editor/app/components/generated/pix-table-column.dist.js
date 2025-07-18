import { computed, getCurrentInstance, useSlots } from 'vue';


import { renderSlot as _renderSlot, createElementVNode as _createElementVNode, createCommentVNode as _createCommentVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, normalizeClass as _normalizeClass } from "vue"

const _hoisted_1 = ["aria-sort"]
const _hoisted_2 = { class: "pix-table-header-container" }
const _hoisted_3 = { key: 0 }

export default { render(_ctx, _cache) {
  return (_ctx.displayHeader)
    ? (_openBlock(), _createElementBlock("th", {
        key: 0,
        scope: "col",
        "aria-sort": _ctx.ariaSort
      }, [
        _createElementVNode("div", _hoisted_2, [
          _renderSlot(_ctx.$slots, "header"),
          _cache[0] || (_cache[0] = _createElementVNode("button", null, " ↕️ ", -1 /* CACHED */)),
          _createCommentVNode(" <PixIconButton\n        v-if=\"sortable\"\n        @ariaLabel={{this.iconLabel}}\n        @iconName={{this.iconName}}\n        @triggerAction={{@onSort}}\n        @size=\"small\"\n      /> ")
        ])
      ], 8 /* PROPS */, _hoisted_1))
    : (_ctx.isMainRow)
      ? (_openBlock(), _createElementBlock("th", {
          key: 1,
          scope: "row",
          class: _normalizeClass({
    [`pix-table-column--${_ctx.type}`]: !!_ctx.type,
  })
        }, [
          _renderSlot(_ctx.$slots, "cell")
        ], 2 /* CLASS */))
      : (_openBlock(), _createElementBlock("td", {
          key: 2,
          class: _normalizeClass({
    [`pix-table-column--${_ctx.type}`]: !!_ctx.type,
  })
        }, [
          _renderSlot(_ctx.$slots, "cell"),
          (!!_ctx.slots?.subcell)
            ? (_openBlock(), _createElementBlock("p", _hoisted_3, [
                _renderSlot(_ctx.$slots, "subcell")
              ]))
            : _createCommentVNode("v-if", true)
        ], 2 /* CLASS */))
},
  props: {
  context: String,
  type: {
    type: String,
    default: 'text',
    validator(value) {
      const correctTypes = ['number', 'text', 'checkbox', 'tag', 'tagDate'];
      return correctTypes.includes(value);
    }
  },
  sortOrder: {
    type: String,
    validator(value) {
      if (value === undefined) return true;
      const correctSortOrders = ['asc', 'desc', null];
      return correctSortOrders.includes(value);
    }
  },
  ariaLabelDefaultSort: {
    type: String,
    required: true,
  },
  ariaLabelSortDesc: {
    type: String,
    required: true,
  },
  ariaLabelSortAsc: {
    type: String,
    required: true,
  },
  isMainRow: Boolean,
},
  setup(__props, { expose: __expose }) {
  __expose();

const props = __props;

const slots = useSlots();

const displayHeader = computed(() => {
  return props.context === 'header';
});

const sortable = computed(() => {
  return !!getCurrentInstance()?.vnode.props?.onSort
});

const iconName = computed(() => {
  const isText = props.type === 'text';
  if (!props.sortOrder) {
    return isText ? 'sortAz' : 'sort';
  }
  if (props.sortOrder === 'asc') {
    return isText ? 'sortAzAsc' : 'sortAsc';
  }
  return isText ? 'sortAzDesc' : 'sortDesc';
});

const iconLabel = computed(() => {
  if (!props.sortOrder) {
    return props.ariaLabelDefaultSort;
  }
  if (props.sortOrder === 'asc') {
    return props.ariaLabelSortDesc;
  }
  return props.ariaLabelSortAsc;
});

const ariaSort = computed(() => {
  if (!sortable.value) {
    return undefined;
  }
  if (!props.sortOrder) {
    return 'none';
  }
  if (props.sortOrder === 'asc') {
    return 'ascending';
  }
  return 'descending';
});

const __returned__ = { props, slots, displayHeader, sortable, iconName, iconLabel, ariaSort, computed, getCurrentInstance, useSlots }

return __returned__
}

}