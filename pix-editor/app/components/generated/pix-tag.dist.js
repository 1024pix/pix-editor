
import { renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export default { render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", {
    class: _normalizeClass([{[`pix-tag--${_ctx.color}`]: _ctx.color}, "pix-tag"])
  }, [
    _renderSlot(_ctx.$slots, "default")
  ], 2 /* CLASS */))
},
  props: {
  color: String,
},
  setup(__props, { expose: __expose }) {
  __expose();



const __returned__ = {  }

return __returned__
}

}